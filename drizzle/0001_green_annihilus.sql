CREATE TABLE `learner_accounts` (
	`userId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`displayName` varchar(120) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastLoginAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `learner_accounts_userId` PRIMARY KEY(`userId`),
	CONSTRAINT `learner_accounts_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `learner_progress` (
	`userId` int NOT NULL,
	`completedLessonsJson` text NOT NULL,
	`watchedVideosJson` text NOT NULL,
	`quizAttemptsJson` text NOT NULL,
	`lastLessonId` varchar(80),
	`finalReviewJson` text NOT NULL,
	`importedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `learner_progress_userId` PRIMARY KEY(`userId`)
);
--> statement-breakpoint
ALTER TABLE `certificates` ADD `ownerUserId` int;