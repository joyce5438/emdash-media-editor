import { definePlugin } from "emdash";

export const PLUGIN_ID = "media-metadata-editor";
export const PLUGIN_VERSION = "0.1.0";
export const ADMIN_PAGE = { path: "/edit", label: "Media Text Editor" } as const;
export const MEDIA_LIST_QUERY = { limit: "20", mimeType: "image/" } as const;

/** Only these two fields are sent when saving. Filename, files, and EXIF are left unchanged. */
export function mediaMetadataPayload(input: { alt?: string | null; caption?: string | null }) {
	return {
		alt: input.alt ?? "",
		caption: input.caption ?? "",
	};
}

export function createPlugin() {
	return definePlugin({
		id: PLUGIN_ID,
		version: PLUGIN_VERSION,
		admin: { pages: [ADMIN_PAGE] },
	});
}
