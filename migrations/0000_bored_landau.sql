CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` integer NOT NULL,
	`expiresAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `urls` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`unshortened` text NOT NULL,
	`shortened` text NOT NULL,
	`creationDate` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`deletionDate` text,
	`type` text NOT NULL,
	`userId` integer NOT NULL,
	`visits` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text,
	`email` text NOT NULL,
	`hashedPassword` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `urls_shortened_unique` ON `urls` (`shortened`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);