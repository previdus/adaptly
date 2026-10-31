CREATE TABLE `families` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`salt` text NOT NULL,
	`password` text NOT NULL,
	`state` text NOT NULL,
	`session` text,
	`expires` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `families_email_unique` ON `families` (`email`);