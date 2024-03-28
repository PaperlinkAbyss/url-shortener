CREATE TABLE `github` (
	`githubId` text PRIMARY KEY NOT NULL,
	`githubUsername` text,
	`userId` integer,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` integer NOT NULL,
	`expiresAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `urls` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`unshortened` text NOT NULL,
	`shortened` text NOT NULL,
	`creationDate` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`deletionDate` text,
	`type` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`displayName` text,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`hashedPassword` text NOT NULL,
	`qrId` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `urls_shortened_unique` ON `urls` (`shortened`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_qrId_unique` ON `users` (`qrId`);