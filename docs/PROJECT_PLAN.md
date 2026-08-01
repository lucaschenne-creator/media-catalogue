# Media Catalogue 專案規劃書

## 1. 文件目的

本文件將前期討論整理成單一、可持續維護的專案基準。未來的新 Codex 任務、技術決策、驗收與部署，都應先以本文件及 repository 根目錄的 `AGENTS.md` 為準。

本專案是一個單人使用的私人媒體收藏目錄，第一版包含圖片與漫畫。程式碼與真實收藏資料分離；GitHub 只保存通用程式碼，真實 metadata 與媒體檔案不提交至 repository。影片功能不屬於第一版，僅保留為未來可能的獨立擴充。

## 2. 已確認的需求與限制

### 2.1 使用情境

- 使用者只有一人。
- 每類資料預期不超過數千筆。
- 核心查詢是標題、作者與多標籤篩選，不需要複雜統計。
- 不會有多人同時修改資料。
- 可以接受更新時整份 JSON 重新寫入。
- 第一版以瀏覽、搜尋、標籤篩選與圖片檢視為主；管理與上傳功能延後。
- 媒體內容可能敏感但必須合法，且不可包含未成年人、非自願私密影像、偷拍或其他違法內容。

### 2.2 隱私邊界

真正需要保護的是完整收藏索引，包括標題、作者、標籤、所有 object keys 與收藏關係。

- 公開：登入頁。
- 登入後可見：收藏頁、metadata、搜尋結果。
- 可接受公開：取得完整網址後的單一媒體檔案。
- 不可公開：密碼、session signing secret、R2 API 憑證、完整 metadata JSON。
- GitHub repository 必須為 Private，且不得包含真實敏感資料或媒體。
- UUID／亂數 object key 只用來降低猜測機率，不視為授權機制。

## 3. 最終產品範圍

### 3.1 圖片庫

- 以縮圖網格顯示。
- 搜尋標題與標籤。
- 支援多標籤 AND／OR 篩選，預設 AND。
- 點擊後開啟 Lightbox，才載入原圖。
- Lightbox 支援上一張、下一張、方向鍵、Esc、背景關閉與手機觸控。
- 可選擇顯示原始來源連結。

### 3.2 漫畫收藏

- 顯示封面、標題、作者與標籤。
- 搜尋標題、作者與標籤。
- 點擊後以新分頁開啟來源頁，使用 `noopener noreferrer`。
- 第一版不保存或重新託管完整漫畫內容，只管理收藏資訊與封面。

### 3.3 共用體驗

- 支援桌面、平板與手機。
- 有 loading、error、empty 與媒體載入失敗狀態。
- 所有重要互動可用鍵盤操作。
- 搜尋在瀏覽器內完成，支援英文不分大小寫及中文、日文部分字串比對。
- 顯示結果數量，並可清除搜尋與標籤。

## 4. 目標架構

```text
Private GitHub Repository
只存通用程式碼與假資料
        │
        ▼
Cloudflare Pages
公開登入頁＋登入後 React 介面
        │
        ▼
Cloudflare Worker / Pages Functions
密碼驗證、Session、Metadata API
        │
        ├── Private R2 Bucket
        │   └── metadata/*.json
        │
        └── Public R2 Bucket / Custom Domain
            ├── images/original/
            ├── images/thumbnails/
            └── manga/covers/
```

### 4.1 元件責任

| 元件 | 責任 |
|---|---|
| React 前端 | 畫面、路由、搜尋、標籤篩選與圖片 Lightbox |
| Worker／Functions | 密碼驗證、Session、讀取與未來更新 JSON |
| Private R2 | 真實 metadata JSON 與備份 |
| Public R2 | 以不可猜測 object key 儲存媒體檔案 |
| GitHub | 私有程式碼、測試、文件與非敏感假資料 |
| Cloudflare Pages | 前端部署與正式網站入口 |

### 4.2 登入設計

第一版正式上線前必須具備真正的伺服器端驗證，不可只用前端畫面隱藏內容。

- 單一密碼，不做註冊、多使用者、Email 驗證或資料庫。
- 密碼與 session signing secret 存在 Cloudflare Secret。
- 登入成功後設定簽名 Session Cookie。
- Cookie 使用 `HttpOnly`、`Secure`、`SameSite=Strict`。
- 預計 session 有效期 30 天，並提供登出。
- 登入端點需有基本 rate limiting。
- 未驗證請求不可取得任何真實 JSON。
- 登入頁與網站加入 `noindex, nofollow`；這只降低索引，不是安全機制。

## 5. 資料模型

兩份 catalog 都使用以下 envelope：

```json
{
  "version": 1,
  "updatedAt": "2026-08-01T00:00:00+08:00",
  "items": []
}
```

### 5.1 ImageItem

```ts
type ImageItem = {
  id: string
  title: string
  originalKey: string
  thumbnailKey: string
  sourceUrl?: string
  tags: string[]
  addedAt?: string
}
```

### 5.2 MangaItem

```ts
type MangaItem = {
  id: string
  title: string
  author: string
  coverKey: string
  sourceUrl: string
  tags: string[]
  addedAt?: string
}
```

欄位名稱採用 `originalKey`、`thumbnailKey`、`coverKey` 與 `sourceUrl`，避免模糊的 `image`、`url`。ID 應使用 UUID 或穩定的隨機識別碼，不依賴陣列索引。

## 6. 儲存與安全規則

- JSON 只保存 R2 object key，不保存 R2 API key 或秘密憑證。
- object key 不可使用連號或可預測原始檔名，正式資料使用 UUID／亂數。
- 公開媒體網址由單一 utility 根據 base URL 與 object key 組合。
- 各路徑 segment 必須正確 URL encode，且要正規化 base URL 尾端斜線。
- `VITE_` 變數會出現在前端 bundle，只能保存公開資訊，例如公開媒體 base URL。
- `.env` 不提交 Git；只提交不含真實值的 `.env.example`。
- 不提供列出 Public R2 bucket 全部物件的功能。
- 正式 metadata 不放在前端 `public/`、GitHub 或 build artifact。
- 開發階段可在 repository 使用明確標示為假的 fixture；接上 Worker 後移除公開 fixture 路徑。
- Worker 的 metadata API 只允許固定 catalog 名稱，不接受任意 R2 object path。

## 7. JSON 驗證與更新策略

使用 Zod 作為前端與工具共用的資料 schema。驗證內容至少包含：

- JSON 可解析且符合 envelope 與 item schema。
- 同一 catalog 的 `id` 不重複。
- tags 不含空字串，並回報重複 tag。
- object key 不得是完整 HTTP URL，且需符合允許的 prefix。
- `sourceUrl` 必須是有效的 HTTP 或 HTTPS URL。
- 錯誤訊息指出檔名與 item id。

未來加入管理模式時，更新流程為：

```text
驗證 Session
  → 驗證新 JSON
  → 讀取現有 JSON
  → 備份現有 JSON
  → 寫入新 JSON
```

使用明確的「儲存」按鈕，不在每次按鍵時覆寫。第一版管理功能不在 MVP 範圍內。

## 8. 技術選擇

- React
- TypeScript（strict，不使用 `any`）
- Vite
- React Router
- 原生 CSS 或 CSS Modules
- Zod
- Vitest 與 React Testing Library（需要 UI 測試時）
- Cloudflare Pages／Workers／R2

不採用 Tailwind、UI component library、傳統帳號資料庫、D1、PostgreSQL、FastAPI 或 Analytics。除非未來需求明確改變，否則不引入這些技術。

## 9. 分階段交付計畫

### 階段 1：專案骨架

- 初始化 Git。
- 建立 React＋TypeScript＋Vite。
- 建立圖片與漫畫兩個路由及共用導覽。
- 建立基本響應式版面、README 與 `AGENTS.md`。
- 不加入真實資料、R2、登入或完整功能。

驗收：兩頁可切換，手機與桌面版面正常，`npm run build` 通過。

### 階段 2：資料層與假資料

- 建立圖片與漫畫 TypeScript 型別及 Zod schemas。
- 建立每類三筆普通、非敏感 fixture。
- 建立共用載入 hook 與 loading／error／empty 狀態。

驗收：錯誤 JSON 顯示可理解訊息，無 `any`，測試與 build 通過。

### 階段 3：搜尋

- 共用搜尋與篩選 hook。
- 支援 title、author、tags、結果數量與清除搜尋控制。
- 補標題、作者、標籤與空結果測試。

### 階段 4：Multi-tag 篩選

- 顯示目前頁面的所有 Tag，並支援多選。
- 支援 AND／OR（預設 AND）、清除所有 Tag、搜尋與 Tag 同時使用，以及結果數量。
- 補單一 Tag、多 Tag AND／OR、搜尋加 Tag、清除 Tag 與無符合結果測試。

### 階段 5：卡片與響應式 Grid

- 圖片與漫畫卡片、lazy loading、fallback、鍵盤操作。
- 漫畫外部連結安全屬性。
- 列表只載入圖片縮圖或漫畫封面，不載入圖片原圖。

### 階段 6：圖片 Lightbox

- 完成圖片 Lightbox、前後瀏覽、鍵盤操作、焦點管理與來源連結。
- 僅在使用者打開 Lightbox 時才載入圖片原圖。

### 階段 7：媒體 URL 整合

- 建立 `mediaUrl` utility 與 `.env.example`。
- 使用公開 R2 base URL 與不可猜測 object key。
- 缺少設定時顯示清楚錯誤。

### 階段 8：資料驗證工具

- 建立 `npm run validate:data`。
- 驗證 schema、重複 ID／tag、URL 與 object key。
- 讓 build 前執行資料驗證。

### 階段 9：登入與私人 Metadata API

- 建立 Worker／Pages Functions。
- 單一密碼、簽名 Cookie、登出、rate limiting。
- 將真實 JSON 放進 Private R2，由登入後 API 讀取。
- 移除正式環境對公開 fixture 的依賴。

### 階段 10：品質與安全驗收

- 單元、整合與必要的瀏覽器測試。
- Accessibility、鍵盤、焦點、媒體錯誤與手機版檢查。
- 確認 secrets、真實 metadata、媒體檔案未進入 Git 歷史。
- 驗證未登入時 API 無法存取。

### 階段 11：Cloudflare 部署

- 以 Private GitHub repository 連接 Cloudflare。
- 設定 Pages、Worker、R2 bindings、Secrets 與 custom domain。
- 保護正式與預覽部署，完成部署與復原說明。

## 10. 任務與 Git 工作流程

同一個 Codex Project 使用同一個 repository；每個可獨立驗收的成果使用一個任務。密切相關的修正留在原任務，完成後再進下一階段。

每個階段依序完成：

```text
實作 → 測試 → build → 檢查 diff → 人工操作 → commit → 下一階段
```

早期依賴關係強，先採順序開發。架構穩定後，文件、accessibility、測試或工具等彼此獨立的工作才適合用 worktree 平行進行。

建議 commit 範例：

- `feat: scaffold media catalogue`
- `feat: add catalog data schemas`
- `feat: add catalogue search and tag filters`

Codex 不應自行 commit 或 push；必須由使用者明確要求。

## 11. 每階段完成定義

- 本階段驗收條件全部完成。
- 沒有加入超出階段範圍的後端、資料庫或套件。
- 沒有提交 `.env`、secret、真實 metadata 或媒體。
- 相關測試通過。
- `npm run build` 通過。
- Diff 已檢查且 README／規劃文件與實作一致。
- 已記錄尚未解決的風險與下一步。

## 12. 已知風險與注意事項

- 公開媒體 URL 可被複製；這是已接受的產品取捨。
- UUID 不能替代權限控制；完整收藏索引仍必須由登入保護。
- 公開網路可見的內容可能被下載或擷取，技術上無法完全防止。
- 來源網站可公開瀏覽不代表擁有重新託管或散布副本的權利；應保存來源資訊並尊重移除要求。
- 不應重新散布付費牆後內容或未取得權利的完整作品。
- JSON 整份覆寫的主要風險是誤清空，因此管理版上線前必須有 schema 驗證與版本備份。

### 12.1 未來擴充

- 影片庫不屬於第一版範圍。
- 第一版不建立影片路由、資料型別、播放器、影片 R2 目錄或相關 API。
- 未來若重新評估影片功能，應作為獨立階段更新本規劃書，並重新評估儲存、轉碼、播放與成本需求。

## 13. 當前狀態與立即下一步

截至 2026-08-01，repository 已完成「階段 1：專案骨架」、「階段 2：資料層與假資料」、「階段 3：搜尋」、「階段 4：Multi-tag 篩選」與「階段 5：卡片與響應式 Grid」：

- React＋TypeScript＋Vite 專案可建置。
- 圖片與漫畫兩個路由及共用導覽已建立。
- 基本桌面／手機響應式版面已建立。
- `AGENTS.md`、README、安全忽略規則與本規劃書已建立。
- 可在目前頁面選擇多個 Tag，以預設 AND 或 OR 模式篩選，且可與搜尋同時使用。
- 圖片與漫畫以一致的響應式卡片呈現；圖片只使用 `thumbnailKey`，漫畫只使用 `coverKey`，並提供 lazy loading、載入失敗 fallback、鍵盤 focus 與安全外部連結。
- lint、測試、production build 與本機入口路徑檢查均通過。

下一個可獨立驗收的成果是「階段 6：圖片 Lightbox」。開始前應先由使用者檢查目前 diff 與本機畫面，確認後再建立下一個 commit。本文件是後續所有實作與新任務的參考點。
