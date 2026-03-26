CREATE TABLE `budgets` (
	`id` text PRIMARY KEY NOT NULL,
	`total_amount` integer NOT NULL,
	`month` integer NOT NULL,
	`year` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `budget_allocations` (
	`id` text PRIMARY KEY NOT NULL,
	`budget_id` text NOT NULL,
	`category_id` text NOT NULL,
	`allocated_amount` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
