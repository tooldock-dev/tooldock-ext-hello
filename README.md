# Hello 範例

ToolDock 擴充範例：示範畫面、後端、儲存與自動發佈

這是 ToolDock 擴充，用 `create-tooldock-extension` 的 `view` 範本建立。

## 開發

需要先安裝 ToolDock 和 Node.js 18 以上。

| 指令 | 說明 |
|---|---|
| `npm run dev` | 以開發模式啟動 ToolDock 並載入這個擴充。存檔後會自動重新載入後端和畫面 |
| `npm run debug` | 同上，並開啟後端偵錯埠 `127.0.0.1:9229` |
| `npm run validate` | 檢查 manifest、檔案和相依套件 |
| `npm run pack` | 打包成 `dist/hello-example-<版本>.tbx`，只含正式相依 |
| `npm run install-local` | 打包並安裝到本機的 ToolDock |

開發模式使用獨立的資料目錄（`ToolDock-ExtDev`），可以和平常使用的 ToolDock 同時開啟，互不干擾。如果想從乾淨的狀態開始，執行 `npm run dev -- --fresh`。

找不到 ToolDock 時，可以用 `--app` 參數或 `TOOLDOCK_PATH` 環境變數指定位置：

```bash
TOOLDOCK_PATH=/Applications/ToolDock.app npm run dev
```

## 偵錯

**後端**

- **VS Code**：按 F5 選「ToolDock：啟動並偵錯擴充」，就能在 `backend/` 設中斷點。擴充重新載入後，除錯器會自動重新連線。
- **其他工具**：執行 `npm run debug`，再到 Chrome 開啟 `chrome://inspect` 附加。
- **偵錯啟動流程**：要偵錯 `activate()` 本身時，執行 `npm run dev -- --inspect-brk`，擴充會停在第一行等待除錯器。

**畫面**：在 ToolDock 的分頁上按右鍵，選「檢查此畫面」，開發者工具會直接定位到這個擴充的畫面。

**日誌**：`ctx.log.*` 和 `console.log` 會顯示在 ToolDock 的輸出面板（`⇧⌘U`），也會顯示在執行 `npm run dev` 的終端機。

## 發佈

專案已附上 GitHub Actions 流程 `.github/workflows/release.yml`：推送 `v*` tag 後，會自動驗證、打包、簽章，並建立 GitHub Release。ToolDock 商店會從 Release 下載並驗證簽章。

**第一次設定（只需做一次）**

1. 產生簽章金鑰：

   ```bash
   npx tooldock-ext keygen
   ```

   私鑰會存到 `~/.tooldock/keys/tooldock-signing-key.pem`（權限 600），終端機會印出公鑰字串。請另外備份私鑰，**不要提交到 git**。

2. 把私鑰加入 GitHub repo 的 secret `TOOLDOCK_SIGNING_KEY`：

   ```bash
   gh secret set TOOLDOCK_SIGNING_KEY < ~/.tooldock/keys/tooldock-signing-key.pem
   ```

   也可以到 GitHub repo →「Settings → Secrets and variables → Actions」新增，內容貼上私鑰檔的全部文字（包含 `-----BEGIN PRIVATE KEY-----` 那兩行）。

3. 把公鑰字串提交到 ToolDock 商店索引。
4. 選用：把公鑰設為 repo variable `TOOLDOCK_PUBLIC_KEY`，CI 發佈前會再驗證一次，可以及早發現 secret 設錯：

   ```bash
   gh variable set TOOLDOCK_PUBLIC_KEY --body "<公鑰字串>"
   ```

**每次發佈**

```bash
npm version patch        # 或 minor / major；會更新 package.json 並建立 v<版本> tag
git push --follow-tags
```

tag 必須是 `v` 加上 `package.json` 的版本（例如 `v0.2.0`），不一致時 CI 會失敗。`package-lock.json` 必須提交，CI 使用 `npm ci` 安裝。

Release 會附上三個檔案：

| 檔案 | 內容 |
|---|---|
| `hello-example-<版本>.tbx` | 擴充套件 |
| `hello-example-<版本>.tbx.sha256` | `.tbx` 的 SHA-256 |
| `hello-example-<版本>.tbx.sig` | Ed25519 簽章 |

沒有設定 `TOOLDOCK_SIGNING_KEY` 時，CI 仍會發佈 `.tbx` 和 `.sha256`，但會顯示「未簽章，商店不會收錄」的警告。

**在本機簽章與驗證**

```bash
npx tooldock-ext pack --sign --key ~/.tooldock/keys/tooldock-signing-key.pem
npx tooldock-ext verify dist/hello-example-<版本>.tbx --public-key <公鑰字串>
```

## 專案結構

```
package.json      manifest（tooldock 欄位：畫面、指令、設定、生命週期）
backend/index.js  後端：activate(ctx) / deactivate()
ui/               畫面（如果有）
.tbxignore        打包時要排除的檔案
.github/workflows/release.yml  推送 v* tag 時自動發佈
```

## 加入函式庫

```bash
npm install <套件>
```

用 `npm install` 安裝的套件會列在 `dependencies`，打包時一起帶走，ToolDock 平台不需要更新。`devDependencies` 不會被打包。

API 型別定義在 `node_modules/tooldock-types/index.d.ts`。編輯器裡的自動完成和型別檢查已經透過 `jsconfig.json` 設定好了。
