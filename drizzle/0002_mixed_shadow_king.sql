CREATE TABLE `pilot_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`state` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pilot_profiles_email_unique` ON `pilot_profiles` (`email`);--> statement-breakpoint
CREATE TABLE `pilot_sessions` (
	`token` text PRIMARY KEY NOT NULL,
	`profile_id` text NOT NULL,
	`expires` integer NOT NULL
);
