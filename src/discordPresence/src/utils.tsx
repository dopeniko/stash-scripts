import React from "react";
import { PLUGIN_ID } from "./context";

type ToastHook = ReturnType<typeof window.PluginApi.hooks.useToast>;
type ToastOptions = Parameters<ToastHook["toast"]>[0];

export const createToast = (hook: ToastHook, toast: ToastOptions): void => {
  hook.toast({
    content: (
      <span discord-presence="toast">
        <h6>Discord Presence</h6>
        {toast.content}
      </span>
    ),
    variant: toast.variant,
    delay: 10000,
  });
};

export const log = {
  info(message: string, ...args: any) {
    console.log(`[${PLUGIN_ID}] ${message}`, ...args);
  },
  debug(message: string, ...args: any) {
    console.debug(`[${PLUGIN_ID}] ${message}`, ...args);
  },
  error(message: string, ...args: any) {
    console.error(`[${PLUGIN_ID}] ${message}`, ...args);
  },
};
