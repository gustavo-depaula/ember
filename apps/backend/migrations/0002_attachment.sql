CREATE TABLE `attachment` (
	`id` text PRIMARY KEY NOT NULL,
	`church_id` text NOT NULL,
	`content_type` text NOT NULL,
	`data` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `attachment_church_idx` ON `attachment` (`church_id`);