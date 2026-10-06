ALTER TABLE "complexes" ADD COLUMN "media" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
UPDATE "complexes" SET "media" = (
  SELECT coalesce(jsonb_agg(jsonb_build_object('type', 'image', 'url', x, 'provider', CASE WHEN x LIKE '/api/v1/files/%' THEN 'file' ELSE 'link' END) ORDER BY i), '[]'::jsonb)
  FROM jsonb_array_elements_text("images") WITH ORDINALITY AS t(x, i)
) WHERE "media" = '[]'::jsonb AND "images" <> '[]'::jsonb;
