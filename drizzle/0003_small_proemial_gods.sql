CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`transaction_date` text NOT NULL,
	`transaction_type` text NOT NULL,
	`spending_type` text NOT NULL,
	`amount` integer NOT NULL,
	`description` text,
	`category_id` text,
	`vendor_id` text
);
