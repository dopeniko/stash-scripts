import { PluginState } from "@/context";
import { createToast, log } from "@/utils";
import React, { useRef, useState } from "react";

export interface UseDiscordPresenceOptions {
  pluginConfig: Required<MyPluginConfig>;
  initialEnabled?: boolean;
  initialKeepAlive?: boolean;
  socketUrl?: string;
}

export interface PresenceWsHook {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  lastPresenceUpdate: number | null;
  state: PluginState;
  config: Required<MyPluginConfig>;
  ws: WebSocket | null;
}

export function useDiscordPresence(
  options: UseDiscordPresenceOptions
): PresenceWsHook {
  const { PluginApi } = window;
  const { hooks } = PluginApi;
  const MAX_RETRIES = 5;

  const toasts = hooks.useToast();
  const socketUrl = options.socketUrl ?? "ws://localhost:6969";

  const [enabled, setEnabled] = useState<boolean>(
    options.initialEnabled ?? true
  );
  const [retryCount, setRetryCount] = useState(-1);
  const [lastPresenceUpdate, setLastPresenceUpdate] = useState<number | null>(
    null
  );
  const [state, setState] = useState<PluginState>(PluginState.DISCONNECTED);
  const [config, setConfig] = useState(() => options.pluginConfig);

  const wsRef = useRef<WebSocket | null>(null);
  const presenceTimeoutRef = useRef<number | null>(null);

  // keep config up-to-date if caller passes a new pluginConfig
  React.useEffect(() => {
    if (options.pluginConfig) {
      setConfig(options.pluginConfig);
    }
  }, [options.pluginConfig]);

  React.useEffect(() => {
    if (!enabled) {
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {}
        wsRef.current = null;
      }
      setState(PluginState.DISCONNECTED);
      return;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    const ws = new WebSocket(socketUrl);
    wsRef.current = ws;

    setState(PluginState.CONNECTING);

    const onOpen = (ev: Event) => {
      setState(PluginState.CONNECTED);
      createToast(toasts, { content: "Connected.", variant: "success" });
      setRetryCount(0);
    };

    const onMessage = (ev: MessageEvent) => {
      setState(PluginState.SENDING_UPDATES);
      setLastPresenceUpdate(Date.now());

      if (presenceTimeoutRef.current !== null) {
        window.clearTimeout(presenceTimeoutRef.current);
      }

      presenceTimeoutRef.current = window.setTimeout(() => {
        setLastPresenceUpdate((prev) => {
          if (prev === null) return prev;
          if (Date.now() - prev > 5000) {
            setState(PluginState.CONNECTED);
          }
          return prev;
        });
      }, 5000);
    };

    const onError = (e?: Event | Error) => {
      if (retryCount === -1) {
        log.error("Failed to connect to the companion app", e);
        createToast(toasts, {
          content: (
            <>
              Failed to connect to the companion app.{" "}
              <a
                href="https://discourse.stashapp.cc/t/discord-presence/1374"
                target="_blank"
              >
                Is the tray app running?
              </a>
            </>
          ),
          variant: "warning",
        });
        setEnabled(false);
        return;
      }

      const currentRetry = retryCount < 1 ? 1 : retryCount + 1;

      if (currentRetry > MAX_RETRIES) {
        log.error("Lost connection to the companion app", e);
        createToast(toasts, {
          content: "Connection lost to RPC server.",
          variant: "danger",
        });
        setState(PluginState.CONNECTION_ERROR);
        setEnabled(false);
        setRetryCount(-1);
        return;
      }

      log.info(`Attempting reconnect (${currentRetry})`);
      setRetryCount(currentRetry);
    };

    ws.addEventListener("open", onOpen);
    ws.addEventListener("error", onError);
    ws.addEventListener("message", onMessage);

    // cleanup for this socket instance
    return () => {
      try {
        ws.removeEventListener("open", onOpen);
        ws.removeEventListener("error", onError);
        ws.removeEventListener("message", onMessage);
      } catch {}

      if (presenceTimeoutRef.current !== null) {
        window.clearTimeout(presenceTimeoutRef.current);
        presenceTimeoutRef.current = null;
      }

      if (wsRef.current === ws) {
        try {
          ws.close();
        } catch {}
        wsRef.current = null;
      }
    };
  }, [enabled, retryCount, socketUrl]);

  // cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (presenceTimeoutRef.current !== null) {
        window.clearTimeout(presenceTimeoutRef.current);
        presenceTimeoutRef.current = null;
      }
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {}
        wsRef.current = null;
      }
    };
  }, []);

  const returnObj = React.useMemo<PresenceWsHook>(
    () => ({
      enabled,
      setEnabled,
      lastPresenceUpdate,
      state,
      config,
      ws: wsRef.current,
    }),
    [enabled, lastPresenceUpdate, state, config]
  );

  return returnObj;
}
