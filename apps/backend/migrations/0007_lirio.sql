CREATE TABLE `lirio_church` (
	`lirio_id` integer PRIMARY KEY NOT NULL,
	`record` text NOT NULL,
	`updated` text,
	`church_id` text
);
--> statement-breakpoint
CREATE TABLE `lirio_item` (
	`id` text PRIMARY KEY NOT NULL,
	`lirio_id` integer NOT NULL,
	`church_id` text,
	`status` text NOT NULL,
	`before` text,
	`after` text,
	`created_at` text NOT NULL,
	`settled_at` text,
	`change_id` text
);
--> statement-breakpoint
CREATE INDEX `lirio_item_status_idx` ON `lirio_item` (`status`,`lirio_id`);
