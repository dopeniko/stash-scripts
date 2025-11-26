import { PluginContext } from "@/context";
import React, { useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import { type IScenePlayerProps } from "../../types/stashPlugin";

const DiscordActivity: React.FC<IScenePlayerProps> = (props) => {
  const { PluginApi } = window;
  const pluginCtx = React.useContext(PluginContext);

  const player = PluginApi.utils.InteractiveUtils.getPlayer();

  if (!player) {
    return null;
  }

  const newProps = {
    studio_name: props.scene.studio?.name ?? "Unknown Studio",
    url: props.scene.urls?.length ? props.scene.urls[0] : "",
    file_duration: props.scene.files?.length
      ? props.scene.files[0].duration
      : 0,
    performers: props.scene.performers.length
      ? props.scene.performers.map((performer) => performer.name).join(", ")
      : "Unlisted Performer(s)",
  };

  const sceneData = { ...props.scene, ...newProps };

  const setDiscordActivity = useDebouncedCallback(
    () => {
      if (!pluginCtx.enabled || pluginCtx.ws?.readyState !== WebSocket.OPEN) {
        return;
      }

      const config = pluginCtx.config;

      const currentTime = player.currentTime() ?? 0;
      const endTimestamp =
        Date.now() + (sceneData.file_duration - currentTime) * 1000;

      let body = {
        details: replaceVars(config.discordDetailsText, sceneData),
        state: replaceVars(config.discordStateText, sceneData),
        largeImageKey: config.discordShowImage
          ? config.discordLargeImageKey
          : undefined,
        largeImageText: replaceVars(config.discordLargeImageText, sceneData),
        endTimestamp: sceneData.file_duration > 0 ? endTimestamp : undefined,
        buttons:
          config.discordShowUrlButton && URL.canParse(sceneData.url)
            ? [
                {
                  label: replaceVars(config.discordUrlButtonText, sceneData),
                  url: sceneData.url,
                },
              ]
            : undefined,
        instance: true,
      };

      pluginCtx.ws.send(
        JSON.stringify({
          clientId: config.discordClientId,
          presence: body,
        })
      );
    },
    500,
    { maxWait: 5000 }
  );

  function replaceVars(templateStr: string, data: typeof sceneData) {
    const pattern = /{\s*(\w+?)\s*}/g;

    const replacedStr = templateStr
      .replace(pattern, (_, token: keyof typeof sceneData) => data[token] ?? "")
      .trim();

    if (replacedStr.length <= 128) {
      return replacedStr;
    }

    return replacedStr.substring(0, 125) + "...";
  }

  useEffect(() => {
    player.on("playing", setDiscordActivity);
    player.on("play", setDiscordActivity);
    player.on("timeupdate", setDiscordActivity);
    player.on("seeked", setDiscordActivity);
    player.on("ended", () => {
      if (
        pluginCtx.config !== null &&
        pluginCtx.ws &&
        pluginCtx.ws.readyState === WebSocket.OPEN
      ) {
        pluginCtx.ws.send(
          JSON.stringify({
            clientId: pluginCtx.config.discordClientId,
            presence: {},
          })
        );
      }
    });
  }, [player]);

  return null;
};

export default DiscordActivity;
