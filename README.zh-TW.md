# EmDash 媒體文字編輯

[English](README.md) | 繁體中文 | [日本語](README.ja.md)

EmDash **原生外掛**，在單一後台頁面編輯圖片的**替代文字（alt）**與**說明文字（caption）**。每張圖片分開儲存。此外掛不會上傳、取代、重新命名或刪除檔案，也不改 EXIF。

**不需要整合前台版型：**外掛只新增後台頁面。公開頁面仍讀取 EmDash 既有的媒體中繼資料。

## 相容性與限制

- 已在本機 Cloudflare Workers 模擬環境，搭配 EmDash 與 `@emdash-cms/admin` **1.3.1** 測試。
- 這是可信任的原生外掛，需作為網站套件安裝，不能從 EmDash 的沙盒外掛 registry 安裝。
- 後台頁只列出 MIME 類型以 `image/` 開頭的媒體，不含音訊等其他檔案。
- 儲存時只寫入既有媒體紀錄的 `alt` 與 `caption`；檔名、儲存鍵與檔案本體不變。
- 沒有自動儲存。欄位改動留在瀏覽器，直到按下該張圖片的「Save」。

## 權限與信任範圍

外掛不另外宣告 EmDash capabilities，而是使用已登入管理者既有的媒體 API：

- `GET /_emdash/api/media` 列出圖片
- `PUT /_emdash/api/media/:id`，body 只有 `{ alt, caption }`

若帳號不能更新媒體中繼資料，儲存會失敗。外掛不呼叫上傳、取代或刪除端點。

原生外掛在網站程序內執行，擁有網站相依套件的權限，**不受沙盒隔離**。儲存欄位的範圍描述的是目前實作，並不是沙盒安全邊界。安裝前請確認信任程式碼來源。

## 安裝

目前尚未發布到 npm，請在 EmDash 網站專案中從 GitHub 安裝：

```sh
npm install github:joyce5438/emdash-media-editor#v0.1.0
```

在 `astro.config.mjs` 中匯入外掛，加入現有 EmDash 的 `plugins` 陣列：

```js
import { mediaEditorPlugin } from "emdash-media-editor";

// 在 emdash({ ... }) 中：
plugins: [
  mediaEditorPlugin(),
  // ...其他外掛
],
```

重新建置並部署。在後台外掛選單開啟 **Media Text Editor**。

## 使用方式

頁面以雙欄卡片顯示縮圖、檔名、替代文字、說明文字，以及每張圖片自己的儲存按鈕。可用 **Load more** 繼續載入。儲存一張不會送出其他張。

替代文字是無障礙 `alt`；說明文字是媒體 caption。請用一句話說出畫面中看得到的主體；裝飾性圖片可留空 alt。

## 快取與用量

**外掛不會變更或關閉頁面或媒體快取。**儲存後，已快取且內含舊 alt／caption 的 HTML 可能要等快取到期或清除才更新。R2（或同等儲存）上的檔案本體不會重寫，因此圖片快取標頭不受影響。

列出媒體與儲存中繼資料使用既有後台 API。這是編輯工具，不是批次匯入器。

## 授權

MIT，詳見 [LICENSE](LICENSE)。
