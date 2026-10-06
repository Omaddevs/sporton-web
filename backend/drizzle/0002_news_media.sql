ALTER TABLE "news" ADD COLUMN "image_caption" text;--> statement-breakpoint
ALTER TABLE "news" ADD COLUMN "gallery" jsonb DEFAULT '[]'::jsonb NOT NULL;