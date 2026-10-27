# SportON

Sport majmualarini topish va bron qilish platformasi: katalog, xarita, onlayn bron, sharhlar,
yangiliklar, foydalanuvchi profili va admin panel.

```
ayolkaryera/
├── src/, public/, index.html   Frontend — React 19 + Vite (SPA)
├── backend/                    Backend — Next.js 16: REST API (/api/v1) + admin panel (/admin)
│   ├── src/db/schema.ts        Ma’lumotlar bazasi sxemasi (Drizzle ORM, PostgreSQL)
│   ├── src/app/api/v1/         API route’lar
│   ├── src/app/admin/          Admin panel
│   ├── drizzle/                SQL migratsiyalar
│   └── scripts/                migrate, seed, admin:create
├── deploy/nginx.conf           Production: sayt + /api,/admin proksi
└── docker-compose.yml          Postgres + backend + web
```

## Lokal ishga tushirish

Node.js 22+ kerak. Postgres o‘rnatish **shart emas**: `DATABASE_URL` bo‘lmasa backend
`backend/.data/pglite` ichidagi o‘rnatilgan Postgres (PGlite) bilan ishlaydi.

```bash
npm install
cp backend/.env.example backend/.env.local     # AUTH_SECRET va ADMIN_PASSWORD ni to‘ldiring
npm run setup:api                               # backend paketlari + migratsiya + seed + admin

npm run dev:api      # backend  → http://localhost:3001  (admin: /admin)
npm run dev          # frontend → http://localhost:5173  (/api avtomatik backendga proksilanadi)
```

> PGlite bitta jarayonda ishlaydi: `db:*` skriptlarini ishga tushirishdan oldin `dev:api` ni to‘xtating.

Dev rejimda Telegram bot ulanmagan bo‘lsa, parolni tiklash kodi sahifada ko‘rsatiladi.

## API qisqacha

| Metod | Yo‘l | Tavsif |
|---|---|---|
| GET | `/api/v1/catalog` | E’lon qilingan majmualar va xizmatlar (30 s kesh) |
| GET | `/api/v1/news`, `/news/:id` | Yangiliklar |
| GET/POST | `/api/v1/news/:id/comments` | Izohlar |
| GET/POST | `/api/v1/complexes/:id/reviews` | Sharhlar (reyting shulardan hisoblanadi) |
| POST | `/api/v1/complexes/:id/view` | Ko‘rishlar hisoblagichi |
| GET | `/api/v1/services/:id/availability` | Band soatlar |
| GET/POST | `/api/v1/bookings` | Mening bronlarim / yangi bron (kirish kerak) |
| PATCH | `/api/v1/bookings/:id` | Bronni bekor qilish (3 soat oldin) |
| POST | `/api/v1/uploads` | Bitta rasm/video yuklash (xom fayl, oqim bilan; rasm ≤15 MB, video ≤200 MB) |
| POST | `/api/v1/submissions` | Majmua arizasi: maydonlar + `media` ro‘yxati (yuklanganlar va havolalar) |
| POST | `/api/v1/auth/register`, `login`, `logout` | Sessiya — httpOnly cookie |
| GET/PATCH/DELETE | `/api/v1/auth/me` | Profil |
| POST | `/api/v1/auth/password`, `reset/request`, `reset/verify`, `reset/confirm` | Parol |
| POST | `/api/v1/auth/google`, `/auth/telegram` | Ijtimoiy kirish (sozlangan bo‘lsa) |
| POST | `/api/v1/subscribe`, `/support` | Obuna, murojaat |
| GET/PATCH/DELETE | `/api/v1/notifications` | Bildirishnomalar ro‘yxati, o‘qildi, o‘chirish |
| GET | `/api/v1/notifications/stream` | Real vaqt oqimi (SSE) |
| GET/PATCH/DELETE | `/api/v1/notifications/prefs` | Sozlamalar, Telegram holati |
| POST/DELETE | `/api/v1/push/subscribe` | Brauzer push obunasi |
| POST | `/api/telegram/webhook` | Bot: parolni tiklash (`/start reset`), hisobni ulash (`/start`), `/stop` |

Xatolar yagona formatda: `{ "error": { "code", "message", "field" } }`.

## Rasm va videolar

Majmua qo‘shishda va admin panelda rasm/videoni istalgancha qo‘shish mumkin: fayl yuklash
(har biri alohida, progress bilan) yoki havola — YouTube, Instagram post/reels, to‘g‘ridan-to‘g‘ri
rasm yoki `.mp4/.webm/.mov`. Fayl turi kengaytma emas, tarkibi bo‘yicha tekshiriladi; HEIC
qabul qilinmaydi. Chegaralar: `MAX_IMAGE_MB`, `MAX_VIDEO_MB`. Birinchi rasm — muqova.

## Bildirishnomalar

- **Kanallar:** saytdagi qo‘ng‘iroqcha (real vaqtda, SSE), Telegram bot (foydalanuvchi profildan ulaydi)
  va brauzer push (VAPID kalitlari kerak). Foydalanuvchi sozlamalari serverda saqlanadi.
- **Avtomatik:** bron qabul qilindi / tasdiqlandi / bekor / yakunlandi, mashg‘ulotdan 2 soat oldin eslatma,
  ariza tasdiqlandi / rad etildi, murojaatga javob, yangi yangilik (ixtiyoriy).
- **Admin → Bildirishnomalar:** hammaga, bron qilganlarga, 30 kunda faollarga yoki tanlangan
  foydalanuvchilarga; hozir yoki rejalashtirib; avval o‘zingizga test; yetkazildi/o‘qildi statistikasi.
- Fon vazifalari (rejalashtirilgan jo‘natmalar, eslatmalar) backend ichida har 30 soniyada ishlaydi
  (`src/instrumentation.ts`). Bir nechta instansiyada — SSE uchun Redis pub/sub kerak (`src/lib/events.ts`).

## Admin panel

`/admin` — boshqaruv paneli (KPI, 14 kunlik bronlar grafigi), bronlar (tasdiqlash/bekor/yakunlash),
majmua arizalari moderatsiyasi (tasdiqlash → majmua avtomatik yaratiladi, ariza muallifi — egasi),
majmualar va xizmatlar (bron usuli: soatlik / ariza / faqat qo‘ng‘iroq; qoralama → e’lon), majmua
egasini biriktirish, qoralamani oldindan ko‘rish, reklama va promo karusel, Reels, yangiliklar,
tadbirlar (saytdan ro‘yxatdan o‘tganlar ro‘yxati), sharh/izoh moderatsiyasi, foydalanuvchilar,
bildirishnomalar (hammaga yoki bitta foydalanuvchiga), murojaatlar, obunachilar, amallar jurnali,
xatolar jurnali.

Rollar: `moderator` — kontent va bronlar; `admin` — qo‘shimcha ravishda foydalanuvchilar,
o‘chirish, jurnallar.

## Majmua egasi kabineti

`/kabinet` — admin tasdiqlagan majmua egasi saytdagi **telefon raqami va paroli** bilan kiradi:
yangi bronlarni tasdiqlash/bekor qilish/yakunlash (mijozga sayt va Telegram orqali xabar boradi),
majmua ma’lumotlari, rasm/videolar va xizmatlarni tahrirlash, sharhlarni ko‘rish. Holat (e’lon),
«Tasdiqlangan» belgisi va tartib — faqat admin. Egalik: ariza tasdiqlanganda avtomatik yoki
Admin → Majmua → «Majmua egasi» orqali telefon raqami bo‘yicha.

## Til

O‘zbek (asosiy) va rus. Matnlar kodda o‘zbekcha `tr('…')` ichida, ruscha tarjima — `src/i18n/ru.js`.
Til tepadagi menyuda va Profil → Sozlamalar’da almashtiriladi. Backenddagi xato xabarlari ham
shu lug‘at orqali tarjima qilinadi. Bazadagi kontent (majmua tavsiflari, yangiliklar) — o‘zbekcha.

## Testlar va sifat

```bash
npm run lint            # oxlint (no-undef bilan — aniqlanmagan o‘zgaruvchi build’dan oldin ushlanadi)
npm test                # frontend: bron rejimi, telefon, i18n lug‘ati
npm --prefix backend test       # backend: bron qoidalari, qoralama havolasi, SEO (XSS)
npm run test:all        # hammasi + backend typecheck
```

## Monitoring va SEO

- Server 500 xatolari va brauzerdagi JS xatolari bazaga yoziladi (Admin → Xatolar), yangi turdagi
  xato haqida `TELEGRAM_ADMIN_CHAT_ID` ga xabar boradi.
- `/sitemap.xml` — bazadagi majmua, xizmat, yangilik, tadbir va sport turlaridan; `robots.txt`
  undagi domenni production domeningizga moslang.
- Ijtimoiy tarmoq va qidiruv botlariga nginx meta teglari va JSON-LD bor sahifa beradi
  (`/api/v1/seo`), foydalanuvchilarga — SPA (`useSeo` sarlavha va OG teglarni yangilaydi).

## Production (Docker)

```bash
cp .env.production.example .env        # parollar va AUTH_SECRET ni to‘ldiring
docker compose up -d --build
docker compose run --rm backend npm run db:setup
docker compose run --rm -e ADMIN_PHONE=901234567 -e ADMIN_PASSWORD='...' backend npm run admin:create
```

Sayt, `/api`, `/admin` va `/kabinet` bitta domenda nginx orqali xizmat qiladi. HTTPS’ni oldidagi
Caddy/Cloudflare/certbot bilan yoqing (keyin `deploy/security-headers.conf` dagi HSTS qatorini oching).

**Zaxira:** `backup` xizmati har kuni bazani (`pg_dump`) va yuklangan fayllarni `./backups` ga
saqlaydi, `BACKUP_KEEP_DAYS` (standart 14) kundan eskilarini o‘chiradi. Tiklash buyruqlari —
`deploy/backup.sh` boshida. Zaxirani boshqa serverga ham nusxalab turing.

### Launch checklist

- [ ] `AUTH_SECRET` — kamida 32 belgili tasodifiy satr; `.env` repoga tushmasin
- [ ] Admin → Majmualar → **«Demo’larni yashirish»** (28 ta namuna majmua)
- [ ] Haqiqiy majmualarning qulayliklari, rasmlari va koordinatalarini admin paneldan to‘ldirish
- [ ] Telegram bot: `TELEGRAM_BOT_TOKEN`, webhook o‘rnatish (backend/.env.example ga qarang),
      `TELEGRAM_ADMIN_CHAT_ID` — yangi bron/arizalar haqida xabar
- [ ] Brauzer push: `npx web-push generate-vapid-keys` → `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`
- [ ] Google/Telegram orqali kirish kerak bo‘lsa — `GOOGLE_CLIENT_ID`, `VITE_TELEGRAM_BOT_ID`
- [ ] `backups/` papkasini boshqa joyga (S3, boshqa server) nusxalash
- [ ] `public/robots.txt` dagi Sitemap domeni, `PUBLIC_SITE_URL`
- [ ] Telegram bot tokeni chatda/ochiq joyda ko‘rsatilgan bo‘lsa — @BotFather → /revoke

## Ma’lum cheklovlar

- Bir nechta backend instansiyasida real-vaqt bildirishnomalar (SSE) uchun Redis pub/sub kerak
  (`src/lib/events.ts`); so‘rovlar cheklovi esa bazada — instansiyalar orasida umumiy.
- Murabbiylar bo‘limi hali haqiqiy ma’lumotga ulanmagan («tez orada»).
- Rus tili interfeys uchun; bazadagi kontent va «Bo‘limlar» (blog) maqolalari o‘zbekcha.
