# SportON backend

Next.js 16 (App Router) — REST API (`/api/v1`) va admin panel (`/admin`). To‘liq hujjat: [../README.md](../README.md).

```bash
npm install
cp .env.example .env.local
npm run db:setup        # migratsiya + seed
npm run admin:create    # ADMIN_PHONE / ADMIN_PASSWORD (.env.local)
npm run dev             # http://localhost:3001/admin
```

Sxema o‘zgarsa: `src/db/schema.ts` → `npm run db:generate` → `npm run db:migrate`.
Frontend katalogi o‘zgarsa seed nusxasini yangilash: `npm run seed:export`.

Telegram webhook:
`https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<domen>/api/telegram/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>`
