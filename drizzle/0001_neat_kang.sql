CREATE TABLE `login_limits` (
	`id` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`bucket` integer NOT NULL
);
