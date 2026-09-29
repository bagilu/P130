# P130 寄信服務維運備忘

本文件記錄 P130 與 P 系列共用 Supabase Auth 的寄信限制與檢查方式；不顯示在一般使用者介面。

## 目前配置

- 寄信服務：Brevo Custom SMTP
- 寄件者：以 Supabase Authentication → Emails → SMTP Settings 的 Sender email 為準。
- Sender email 必須已在 Brevo 驗證。SMTP key 是密碼，不可放入 GitHub、前端程式或截圖。

## 三層限制

| 層級 | 目前值 | 說明 |
| --- | ---: | --- |
| Brevo Free | 每日 300 封 | 同一 Brevo 帳號下的所有交易信總量，包含所有 P 系列專案。 |
| Supabase Auth 專案總量 | 每小時 30 封（預設保護性限制） | 可在 Authentication → Rate Limits 依需求調整；調整前先確認 Brevo 額度與濫用風險。 |
| 同一使用者重設密碼 | 60 秒 | Supabase 的預設重送間隔。P130 忘記密碼頁也會在成功送出後鎖定按鈕並倒數 60 秒。 |

## 使用者提示

P130 在註冊驗證與忘記密碼成功後，應提醒使用者檢查：

- 收件匣
- 垃圾郵件匣
- Gmail「促銷內容」分類

忘記密碼頁使用「若此 Email 已註冊」的說法，避免揭露帳號是否存在。

## 排查順序

1. Supabase Project → Logs → Log Type 選 Auth，搜尋 `/recover` 或 `password`。
2. 若 `/recover` 回傳 200，再到 Brevo → Transactional → Logs 查收件人與時間。
3. Brevo 顯示 sender invalid 時，驗證 Sender email；若被收件端歸為垃圾郵件，後續請由校方資訊單位協助完成寄件網域的 DKIM／DMARC 驗證。
