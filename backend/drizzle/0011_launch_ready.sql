CREATE TABLE "error_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" text NOT NULL,
	"message" text NOT NULL,
	"stack" text,
	"url" text,
	"user_agent" text,
	"user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"user_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"item_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "favorites_user_id_kind_item_id_pk" PRIMARY KEY("user_id","kind","item_id")
);
--> statement-breakpoint
CREATE TABLE "likes" (
	"user_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"item_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "likes_user_id_kind_item_id_pk" PRIMARY KEY("user_id","kind","item_id")
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"reset_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reels" (
	"code" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"tag" text DEFAULT 'SportON' NOT NULL,
	"tag_tone" text DEFAULT 'blue' NOT NULL,
	"cover" text NOT NULL,
	"video" text,
	"published_on" date,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "sports" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone_verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "error_events_created_idx" ON "error_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "favorites_item_idx" ON "favorites" USING btree ("kind","item_id");--> statement-breakpoint
CREATE INDEX "likes_item_idx" ON "likes" USING btree ("kind","item_id");--> statement-breakpoint
-- Bitta foydalanuvchining bitta majmuaga takroriy sharhlari: eng yangisi qoladi
DELETE FROM "reviews" r USING "reviews" newer
WHERE r."user_id" IS NOT NULL AND r."user_id" = newer."user_id" AND r."complex_id" = newer."complex_id"
	AND (r."created_at", r."id") < (newer."created_at", newer."id");--> statement-breakpoint
CREATE UNIQUE INDEX "reviews_user_complex_uq" ON "reviews" USING btree ("complex_id","user_id") WHERE user_id is not null;--> statement-breakpoint
-- Botga o‘z kontaktini yuborib ulangan hisoblar — raqami tasdiqlangan
UPDATE "users" SET "phone_verified_at" = now() WHERE "telegram_chat_id" IS NOT NULL;--> statement-breakpoint
-- Avval kodda turgan Reels ro‘yxati (endi admin paneldan boshqariladi)
INSERT INTO "reels" ("code", "title", "tag", "tag_tone", "cover", "video", "published_on", "sort_order") VALUES
	('DR_fqnciKP9', '“Rektor Kubogi”: jamoamiz vakili 1-o‘rinni qo‘lga kiritdi! 🏆', 'Musobaqa', 'orange', '/images/sport/reels/ig/DR_fqnciKP9.jpg', NULL, '2025-12-08', 0),
	('DRpWj9ziMcW', 'MMA — faqat kuch emas, xarakter! 🥊', 'Yakkakurash', 'purple', '/images/sport/reels/ig/DRpWj9ziMcW.jpg', NULL, '2025-11-29', 1),
	('DQ13t1OiE75', 'Maxsus ssenariy asosidagi video — xavfsizlikni unutmang!', 'Lavha', 'pink', '/images/sport/reels/ig/DQ13t1OiE75.jpg', NULL, '2025-11-09', 2),
	('DQIgXD4iBAO', 'Trener yoki murabbiymisiz? Bu video aynan siz uchun! 💪', 'Murabbiylar uchun', 'teal', '/images/sport/reels/ig/DQIgXD4iBAO.jpg', NULL, '2025-10-23', 3),
	('DPOznbxCEeA', 'SportON da yangi marralarga qadam qo‘y!', 'SportON', 'blue', '/images/sport/reels/ig/DPOznbxCEeA.jpg', NULL, '2025-09-30', 4)
ON CONFLICT ("code") DO NOTHING;
