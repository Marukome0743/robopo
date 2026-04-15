-- Rename umpire table to judge
ALTER TABLE "umpire" RENAME TO "judge";
ALTER TABLE "competition_umpire" RENAME TO "competition_judge";
ALTER TABLE "challenge" RENAME COLUMN "umpire_id" TO "judge_id";
ALTER TABLE "competition_judge" RENAME COLUMN "umpire_id" TO "judge_id";
ALTER SEQUENCE "umpire_id_seq" RENAME TO "judge_id_seq";

-- Rename result columns in challenge table
ALTER TABLE "challenge" RENAME COLUMN "result1" TO "first_result";
ALTER TABLE "challenge" RENAME COLUMN "result2" TO "retry_result";

-- Rename foreign key constraints
ALTER TABLE "challenge" RENAME CONSTRAINT "challenge_umpire_id_umpire_id_fk" TO "challenge_judge_id_judge_id_fk";
ALTER TABLE "competition_judge" RENAME CONSTRAINT "competition_umpire_umpire_id_umpire_id_fk" TO "competition_judge_judge_id_judge_id_fk";

-- Rename zekken column in player table
ALTER TABLE "player" RENAME COLUMN "zekken" TO "bib_number";
