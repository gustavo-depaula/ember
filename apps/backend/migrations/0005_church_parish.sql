ALTER TABLE `church` ADD `parish_id` text;
--> statement-breakpoint
CREATE INDEX `church_parish_idx` ON `church` (`parish_id`);
