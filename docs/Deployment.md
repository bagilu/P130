# P130 部署與 Supabase 設定

1. 將本專案內容部署到 GitHub Pages，例如 `https://YOUR_GITHUB_USERNAME.github.io/P130/`。
2. 複製 `config-sample.js` 為 `config.js`，填入同一個 P 系列 Supabase Project 的 URL、anon key 與 P130 網址；不要將 `config.js` 提交到 Git。
3. 在 Supabase SQL Editor 依序執行 `database/01_P130_AccountCenter.sql`、`90_P130_Permissions.sql`，再執行 `99_P130_HealthCheck.sql`。
4. 在 Supabase Authentication → URL Configuration：
   - 將 P130 網址設為 Site URL（或依目前其他專案的 Site URL 策略保留）。
   - 在 Redirect URLs 加入 P130 的完整網址（含末尾 `/`）。
   - **保留**現有 P 專案的所有合法 Redirect URLs，不可刪除。
5. 在 Authentication → Email Templates 檢查 Confirm signup 與 Reset password 的連結可回到 P130。此版前端以 `emailRedirectTo` / `redirectTo` 指向 P130。
6. 以新 Email 完成註冊、驗證、登入、忘記密碼與顯示名稱更新測試。

## 既有專案遷移原則

各 P 專案保留自己的登入頁與 `signInWithPassword()`，並使用自己的 Auth storageKey，例如 `P126-auth`。登入頁只需連至 P130：註冊、忘記密碼、帳號設定。不得將 service role key 放入前端。
