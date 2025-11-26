import React, { useContext, useEffect, useState } from "react";
import { IScenePlayerProps } from "../types/stashPlugin";
import DiscordActivity from "./components/DiscordActivity";
import Status from "./components/Status";
import { defaultConfig, PLUGIN_ID, PluginContext } from "./context";
import { useDiscordPresence } from "./hooks/useWebSocket";

import "./styles.scss";

const { PluginApi } = window;
const { GQL } = PluginApi;

const DiscordPresence: React.FC<React.PropsWithChildren> = (props) => {
  const { data } = GQL.useConfigurationQuery();

  const [config, setConfig] = useState(defaultConfig);

  useEffect(() => {
    const config: MyPluginConfig = data.configuration.plugins[PLUGIN_ID];
    setConfig({ ...defaultConfig, ...config });
  }, [data.configuration.plugins[PLUGIN_ID]]);

  const presence = useDiscordPresence({
    pluginConfig: config,
    initialEnabled: false,
    socketUrl: "ws://localhost:6969",
  });

  return (
    <PluginContext.Provider value={presence}>
      {props.children}
    </PluginContext.Provider>
  );
};

PluginApi.patch.after("App", (props) => {
  return [<DiscordPresence>{props.children}</DiscordPresence>];
});

PluginApi.patch.after(
  "ScenePlayer",
  (props: IScenePlayerProps, _: any, Original: React.JSX.Element) => {
    return [Original, <DiscordActivity {...props} />];
  }
);

PluginApi.patch.after("MainNavBar.UtilityItems", (props) => {
  const { state } = useContext(PluginContext);
  return [<Status status={state} />, props.children];
});
