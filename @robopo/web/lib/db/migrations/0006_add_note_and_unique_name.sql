ALTER TABLE "player" ADD COLUMN "note" text;
ALTER TABLE "judge" ADD COLUMN "note" text;
ALTER TABLE "player" ADD CONSTRAINT "player_name_unique" UNIQUE("name");
ALTER TABLE "judge" ADD CONSTRAINT "judge_name_unique" UNIQUE("name");
