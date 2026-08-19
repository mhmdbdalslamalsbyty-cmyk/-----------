CREATE TABLE `certificates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`certificateId` varchar(40) NOT NULL,
	`learnerName` varchar(120) NOT NULL,
	`courseTitle` varchar(160) NOT NULL,
	`completedLessons` int NOT NULL,
	`totalLessons` int NOT NULL,
	`finalReviewScore` int NOT NULL,
	`status` enum('valid','revoked') NOT NULL DEFAULT 'valid',
	`revokedAt` timestamp,
	`revocationReason` varchar(240),
	`issuedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `certificates_id` PRIMARY KEY(`id`),
	CONSTRAINT `certificates_certificateId_unique` UNIQUE(`certificateId`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
