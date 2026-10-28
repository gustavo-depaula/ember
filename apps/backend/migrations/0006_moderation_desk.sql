CREATE TABLE `moderation_review` (
	`church_id` text PRIMARY KEY NOT NULL,
	`proposal` text NOT NULL,
	`session_id` text NOT NULL,
	`suggestion_ids` text NOT NULL,
	`reviewed_at` text NOT NULL,
	`cost_usd` real,
	`brief` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `moderation_run` (
	`church_id` text PRIMARY KEY NOT NULL,
	`id` text NOT NULL,
	`status` text NOT NULL,
	`suggestion_ids` text NOT NULL,
	`activity` text NOT NULL,
	`error` text,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `moderation_change` (
	`id` text PRIMARY KEY NOT NULL,
	`church_id` text NOT NULL,
	`church_name` text NOT NULL,
	`applied_at` text NOT NULL,
	`summary` text NOT NULL,
	`records` text NOT NULL,
	`resolution` text NOT NULL,
	`basis` text,
	`undone_at` text,
	`shared_at` text
);
--> statement-breakpoint
CREATE INDEX `moderation_change_applied_idx` ON `moderation_change` (`applied_at`);
