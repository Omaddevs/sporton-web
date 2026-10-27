CREATE TABLE "promo_slides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"image" text NOT NULL,
	"link" text,
	"alt" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
INSERT INTO "promo_slides" ("image", "link", "alt", "sort_order") VALUES
	('/images/promo/sporton-telegram.png', 'https://t.me/sportonuz', 'SportON Telegram kanali', 0),
	('/images/promo/sporton-instagram.png', 'https://www.instagram.com/sporton.uz', 'SportON — Instagramda ham kuzatib boring', 1);
