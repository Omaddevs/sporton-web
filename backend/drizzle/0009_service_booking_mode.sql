ALTER TABLE "services" ADD COLUMN "booking_mode" text DEFAULT 'slot' NOT NULL;--> statement-breakpoint
-- Mavjud xizmatlar: src/lib/booking-mode.ts dagi inferBookingMode bilan bir xil qoida
UPDATE "services" SET "booking_mode" = CASE
	WHEN "type" = 'remote' THEN 'request'
	WHEN lower("price") ~ '/\s*oy|kelishiladi' THEN 'call'
	WHEN coalesce(trim("hours"), '') !~ '^([0-9]{1,2}:[0-9]{2}\s*-|24/7)' THEN 'call'
	WHEN lower("price") ~ '/\s*(soat|seans)' THEN 'slot'
	ELSE 'request'
END;
