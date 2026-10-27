ALTER TABLE "promo_slides" ADD COLUMN "mobile_image" text;--> statement-breakpoint
UPDATE "promo_slides" SET "image" = '/images/promo/sporton-telegram-wide.png', "mobile_image" = '/images/promo/sporton-telegram-mobile.png' WHERE "image" = '/images/promo/sporton-telegram.png';--> statement-breakpoint
UPDATE "promo_slides" SET "image" = '/images/promo/sporton-instagram-wide.png', "mobile_image" = '/images/promo/sporton-instagram-mobile.png' WHERE "image" = '/images/promo/sporton-instagram.png';
