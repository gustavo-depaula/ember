CREATE TABLE `church` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`long_name` text,
	`address` text,
	`city` text,
	`region` text,
	`postal_code` text,
	`country` text,
	`country_code` text,
	`lat` real NOT NULL,
	`lng` real NOT NULL,
	`geohash` text NOT NULL,
	`timezone` text NOT NULL,
	`phone_e164` text,
	`email` text,
	`status` text,
	`featured` integer,
	`administration` text,
	`institute` text,
	`canonical_status` text,
	`note` text,
	`has_structured_schedule` integer,
	`last_verified_at` text,
	`verified_source` text,
	`updated_at` text
);
--> statement-breakpoint
CREATE INDEX `church_geohash_idx` ON `church` (`geohash`);--> statement-breakpoint
CREATE INDEX `church_country_city_idx` ON `church` (`country_code`,`city`);--> statement-breakpoint
CREATE TABLE `church_link` (
	`church_id` text NOT NULL,
	`kind` text NOT NULL,
	`url` text NOT NULL,
	PRIMARY KEY(`church_id`, `kind`),
	FOREIGN KEY (`church_id`) REFERENCES `church`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `church_text` (
	`church_id` text NOT NULL,
	`kind` text NOT NULL,
	`raw_text` text,
	`source_updated_at` text,
	PRIMARY KEY(`church_id`, `kind`),
	FOREIGN KEY (`church_id`) REFERENCES `church`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `correction` (
	`id` text PRIMARY KEY NOT NULL,
	`church_id` text NOT NULL,
	`service_id` text,
	`kind` text NOT NULL,
	`payload` text NOT NULL,
	`fingerprint` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`reviewed_at` text,
	`reviewed_by` text
);
--> statement-breakpoint
CREATE INDEX `correction_church_idx` ON `correction` (`church_id`);--> statement-breakpoint
CREATE INDEX `correction_status_idx` ON `correction` (`status`);--> statement-breakpoint
CREATE TABLE `service` (
	`id` text PRIMARY KEY NOT NULL,
	`church_id` text NOT NULL,
	`kind` text NOT NULL,
	`rite` text,
	`language` text,
	`rrule` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text,
	`exdate` text,
	`rdate` text,
	`location_note` text,
	`note` text,
	`source` text,
	`confidence` real,
	FOREIGN KEY (`church_id`) REFERENCES `church`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `service_church_idx` ON `service` (`church_id`);--> statement-breakpoint
CREATE TABLE `verification_event` (
	`id` text PRIMARY KEY NOT NULL,
	`church_id` text NOT NULL,
	`service_id` text,
	`fingerprint` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verification_church_fp_idx` ON `verification_event` (`church_id`,`fingerprint`);