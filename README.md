# P130 Account Center V0.1

好玩實驗室 P 系列的共用帳號生命週期入口。依 SBI-P-SDS v3.1，P130 與其他專案共用同一個 Supabase Project 與 `auth.users`，但不取代各專案自己的登入頁、角色或資料權限。

## 第一版功能

- Email 自助註冊與驗證
- 忘記／重設／修改密碼
- 顯示名稱設定
- 登入、登出與登入狀態
- 以 `TblP130UserProfile` 儲存最少的帳號基本資料

## 明確不包含

- 不自動授予任何 P 專案資格
- 不管理 P112、P126 等專案的業務角色
- 不建立第二套 Supabase Auth
- 不使用 Auth Trigger 自動初始化其他 P 專案資料

## 使用方式

請先閱讀 [docs/Deployment.md](docs/Deployment.md)。正式部署建立 `config.js`；ZIP 僅提供安全的 `config-sample.js`。

## 結構

```
P130_AccountCenter_V0.1/
├── database/             # P130 專屬 migration、permissions、health check
├── docs/                 # 部署說明
├── index.html
├── styles.css
├── app.js
└── config-sample.js
```
