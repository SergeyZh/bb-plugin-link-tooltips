import { definePluginApp } from "@get-bb/plugin-sdk/app";
import { installLinkTooltips } from "./tooltips";

export default definePluginApp((app) => {
  app.contentScripts.register({
    id: "link-tooltips",
    mount({ signal }) {
      return installLinkTooltips(document, signal);
    },
  });
});
