## Setup

```bash
pnpm install
pnpm run db:generate
pnpm run db:push
pnpm run db:seed
pnpm run dev
```

`pnpm run db:generate` is required after install — without it, auth and other DB routes fail with `Cannot find module '.prisma/client/default'`.

## Accounts for testing

- `admin@fabnest3d.com` / `admin123` — admin access
- `user@example.com` / `user123` — regular users

## Email (Gmail) + WhatsApp

Add these to `.env` (do not commit secrets):

```env
GMAIL_USER=yourshop@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM=Fabnest3D <yourshop@gmail.com>
NEXT_PUBLIC_WHATSAPP_NUMBER=9477XXXXXXX
```

- Use a Google [App Password](https://myaccount.google.com/apppasswords) (2FA required), not your normal Gmail password.
- If `GMAIL_USER` / `GMAIL_APP_PASSWORD` are unset, the app falls back to `ADMIN_EMAIL` / `APP_PASSCODE`.
- When an admin changes an order status, the customer receives an email.
- `NEXT_PUBLIC_WHATSAPP_NUMBER` enables “Chat on WhatsApp” links on account orders and in the footer (`wa.me`).
