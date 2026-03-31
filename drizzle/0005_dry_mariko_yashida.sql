CREATE TABLE `savings_goals` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`target_amount` integer NOT NULL,
	`current_balance` integer NOT NULL,
	`target_date` text,
	`month` integer NOT NULL,
	`year` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
