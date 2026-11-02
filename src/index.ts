import type { PluginDescriptor } from "emdash";
import { ADMIN_PAGE, PLUGIN_ID, PLUGIN_VERSION } from "./plugin.ts";

/** Register this trusted native plugin in the EmDash integration. */
export function mediaEditorPlugin(): PluginDescriptor {
	return {
		id: PLUGIN_ID,
		version: PLUGIN_VERSION,
		format: "native",
		entrypoint: "emdash-media-editor/plugin",
		adminEntry: "emdash-media-editor/admin",
		adminPages: [{ path: ADMIN_PAGE.path, label: ADMIN_PAGE.label }],
	};
}

export default mediaEditorPlugin;
