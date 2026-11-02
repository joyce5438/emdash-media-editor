import { test } from "node:test";
import assert from "node:assert/strict";
import { mediaEditorPlugin } from "../src/index.ts";
import {
	ADMIN_PAGE,
	MEDIA_LIST_QUERY,
	PLUGIN_ID,
	PLUGIN_VERSION,
	createPlugin,
	mediaMetadataPayload,
} from "../src/plugin.ts";

test("descriptor registers a native admin page without extra capabilities", () => {
	const descriptor = mediaEditorPlugin();
	assert.equal(descriptor.id, PLUGIN_ID);
	assert.equal(descriptor.version, PLUGIN_VERSION);
	assert.equal(descriptor.format, "native");
	assert.equal(descriptor.entrypoint, "emdash-media-editor/plugin");
	assert.equal(descriptor.adminEntry, "emdash-media-editor/admin");
	assert.deepEqual(descriptor.adminPages, [{ path: "/edit", label: "Media Text Editor" }]);
	assert.equal("capabilities" in descriptor, false);
});

test("plugin metadata matches the descriptor", () => {
	const plugin = createPlugin();
	assert.equal(plugin.id, PLUGIN_ID);
	assert.equal(plugin.version, PLUGIN_VERSION);
	assert.deepEqual(plugin.admin?.pages, [ADMIN_PAGE]);
	assert.equal(plugin.routes && Object.keys(plugin.routes).length, 0);
});

test("save payload contains only alt and caption", () => {
	assert.deepEqual(mediaMetadataPayload({ alt: "Bowl of gukbap", caption: "Seoul pork soup" }), {
		alt: "Bowl of gukbap",
		caption: "Seoul pork soup",
	});
	assert.deepEqual(mediaMetadataPayload({ alt: null, caption: undefined }), { alt: "", caption: "" });
	assert.deepEqual(Object.keys(mediaMetadataPayload({ alt: "a", caption: "b", filename: "x.png" } as never)), [
		"alt",
		"caption",
	]);
});

test("media list query is images only", () => {
	assert.equal(MEDIA_LIST_QUERY.mimeType, "image/");
	assert.equal(MEDIA_LIST_QUERY.limit, "20");
});
