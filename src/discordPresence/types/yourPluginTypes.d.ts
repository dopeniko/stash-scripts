/** Types for your plugin config. Settings are undefined by default. Data should
 * match the settings in your `/src/source.yml` file. */
interface MyPluginConfig {
  discordClientId?: string;
  discordDetailsText?: string;
  discordStateText?: string;
  discordShowImage?: boolean;
  discordLargeImageKey?: string;
  discordLargeImageText?: string;
  discordShowUrlButton?: boolean;
  discordUrlButtonText?: string;
}
