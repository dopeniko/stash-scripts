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
  // Auto heal is not currently implemented
  keepAlive: boolean;
  setKeepAlive: (v: boolean) => void;
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

  const toasts = hooks.useToast();
  const socketUrl = options.socketUrl ?? "ws://localhost:6969";

  const [enabled, setEnabled] = useState<boolean>(
    options.initialEnabled ?? true
  );
  const [keepAlive, setKeepAlive] = useState<boolean>(
    options.initialKeepAlive ?? true
  );
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

  const failedToConnectToast = (e?: Event | Error) => {
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
    setKeepAlive(false);
    setEnabled(false);
  };

  const connectionLostToast = (e?: Event | Error) => {
    log.error("Lost WS connection to tray app", e);
    createToast(toasts, {
      content: "Connection lost to RPC server.",
      variant: "danger",
    });
    setState(PluginState.CONNECTION_ERROR);
  };

  React.useEffect(() => {
    if (!enabled) {
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {
          /* ignore */
        }
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
      wsRef.current?.removeEventListener("error", failedToConnectToast);
      wsRef.current?.addEventListener("error", connectionLostToast);
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

    ws.addEventListener("open", onOpen);
    ws.addEventListener("error", failedToConnectToast);
    ws.addEventListener("message", onMessage);

    // cleanup for this socket instance
    return () => {
      try {
        ws.removeEventListener("open", onOpen);
        ws.removeEventListener("error", failedToConnectToast);
        ws.removeEventListener("error", connectionLostToast);
        ws.removeEventListener("message", onMessage);
      } catch {
        /* ignore */
      }

      if (presenceTimeoutRef.current !== null) {
        window.clearTimeout(presenceTimeoutRef.current);
        presenceTimeoutRef.current = null;
      }

      if (wsRef.current === ws) {
        try {
          ws.close();
        } catch {
          /* ignore */
        }
        wsRef.current = null;
      }
    };
  }, [enabled, keepAlive, socketUrl]);

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
        } catch {
          /* ignore */
        }
        wsRef.current = null;
      }
    };
  }, []);

  const returnObj = React.useMemo<PresenceWsHook>(
    () => ({
      enabled,
      setEnabled,
      keepAlive,
      setKeepAlive,
      lastPresenceUpdate,
      state,
      config,
      ws: wsRef.current,
    }),
    [enabled, keepAlive, lastPresenceUpdate, state, config]
  );

  return returnObj;
}
