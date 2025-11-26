import { PluginContext, PluginState } from "@/context";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import React, { useContext } from "react";

interface IStatus {
  status: PluginState;
}

const Status: React.FC<IStatus> = (props) => {
  const { PluginApi } = window;
  const { Icon } = PluginApi.components;
  const { Button, Badge } = PluginApi.libraries.Bootstrap;

  const { enabled, setEnabled } = useContext(PluginContext);

  const colour = () => {
    switch (props.status) {
      case PluginState.CONNECTED:
        return "connected";
      case PluginState.CONNECTING:
        return "connecting";
      case PluginState.SENDING_UPDATES:
        return "sending-updates";
      case PluginState.DISCONNECTED:
        return "disconnected";
      case PluginState.CONNECTION_ERROR:
        return "connection-error";
    }
  };

  return (
    <Button
      className="nav-utility minimal"
      title={"Discord Presence"}
      onClick={() => setEnabled(!enabled)}
    >
      <span className="position-relative">
        <Badge
          discord-presence="status-dot"
          className={["position-absolute p-1 rounded-circle", colour()].join(
            " "
          )}
        >
          <span hidden>{props.status}</span>
        </Badge>
        <Icon icon={faDiscord}></Icon>
      </span>
    </Button>
  );
};

export default Status;
