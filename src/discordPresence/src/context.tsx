import React from "react";
import { PresenceWsHook } from "./hooks/useWebSocket";

export const PLUGIN_ID = "discordPresence" as const;

export const defaultConfig: Required<MyPluginConfig> = {
  discordClientId: "1236860180407521341",
  discordDetailsText: "{title}",
  discordStateText: "from {studio_name}",
  discordShowImage: false,
  discordLargeImageKey: "stashbox",
  discordLargeImageText: "Stashapp",
  discordShowUrlButton: false,
  discordUrlButtonText: "Watch",
} as const;

export const enum PluginState {
  DISCONNECTED,
  CONNECTING,
  CONNECTED,
  SENDING_UPDATES,
  CONNECTION_ERROR,
}

interface IPluginContext extends PresenceWsHook {}

export const PluginContext = React.createContext<IPluginContext>({
  config: defaultConfig,
  enabled: false,
  keepAlive: true,
  lastPresenceUpdate: null,
  state: PluginState.DISCONNECTED,
  ws: null,
  setEnabled: (e: boolean) => {},
  setKeepAlive: (e: boolean) => {},
});
