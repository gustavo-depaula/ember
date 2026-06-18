DROP INDEX IF EXISTS `church_country_city_idx`;--> statement-breakpoint
DROP TABLE `church_link`;--> statement-breakpoint
DROP TABLE `church_text`;--> statement-breakpoint
DROP TABLE `service`;--> statement-breakpoint
ALTER TABLE `church` ADD `services` text;--> statement-breakpoint
ALTER TABLE `church` ADD `texts` text;--> statement-breakpoint
ALTER TABLE `church` ADD `links` text;