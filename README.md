# EmDash Media Text Editor

English | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md)

An EmDash **native plugin** for editing image **alt text** and **captions** from one admin page. Each image is saved separately. The plugin does not upload, replace, rename, or delete files, and it does not change EXIF.

**No theme integration required:** the plugin only adds an admin page. Public pages keep using the media metadata already stored by EmDash.

## Compatibility and requirements

- Tested with EmDash and `@emdash-cms/admin` **1.3.1** and **1.4.0**.
- This is a trusted native plugin, not a sandboxed plugin. Install it as a site dependency; it cannot be installed from the EmDash sandboxed-plugin registry.
- The admin page lists media whose MIME type starts with `image/`. Audio and other files are omitted.
- Saving writes only `alt` and `caption` on the existing media record. Filenames, storage keys, and binary objects are left unchanged.
- There is no autosave. Unsaved field changes stay in the browser until you press **Save** on that image.

## Access and trust

The plugin does not declare extra EmDash capabilities. It uses the signed-in administrator's existing media API:

- `GET /_emdash/api/media` to list images
- `PUT /_emdash/api/media/:id` with `{ alt, caption }` only

If the account cannot update media metadata, save requests fail. The plugin does not call upload, replace, or delete endpoints.

This is trusted native code running inside the site process, with the authority of a site dependency. The narrow save payload describes this implementation; it is **not a sandbox security boundary**. Review the code and only install native plugins you trust.

## Installation

Install from this GitHub repository in your EmDash site (this project is not currently published to npm):

```sh
npm install github:joyce5438/emdash-media-editor#v0.1.0
```

Add the descriptor to your existing EmDash `plugins` array in `astro.config.mjs`, preserving your existing configuration:

```js
import { mediaEditorPlugin } from "emdash-media-editor";

// Inside emdash({ ... }):
plugins: [
  mediaEditorPlugin(),
  // ...your other plugins
],
```

Rebuild and deploy your site. Open **Media Text Editor** in the EmDash plugin menu.

## Usage

The page shows a two-column card list: thumbnail, filename, alt text, caption, and a **Save** button per image. Use **Load more** to continue the cursor. Saving one image does not submit the others.

Alt text is the accessible `alt` value. Caption is the media description/caption field. Write one short sentence that names what is visible; leave decorative images with empty alt text.

## Cache and usage

**The plugin does not change or disable page or media caching.** After you save, HTML that already inlined the previous alt or caption may stay cached until that cache expires or is invalidated. The binary file on R2 (or equivalent) is not rewritten, so image cache headers are unaffected.

Listing media and saving metadata use the existing admin API. This is an editorial tool, not a bulk importer.

## License

MIT. See [LICENSE](LICENSE).
