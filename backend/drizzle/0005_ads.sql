CREATE TABLE "ads" (
	"slot" text PRIMARY KEY NOT NULL,
	"image" text,
	"mobile_image" text,
	"link" text,
	"cta_label" text,
	"alt" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
