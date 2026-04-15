-- Remove name column from judge table (username from user table is used instead)
ALTER TABLE "judge" DROP CONSTRAINT IF EXISTS "judge_name_unique";
ALTER TABLE "judge" DROP COLUMN IF EXISTS "name";

-- Make user_id NOT NULL (all judges must have a user account)
ALTER TABLE "judge" ALTER COLUMN "user_id" SET NOT NULL;

-- Change onDelete from SET NULL to CASCADE
ALTER TABLE "judge" DROP CONSTRAINT IF EXISTS "judge_user_id_user_id_fk";
ALTER TABLE "judge" ADD CONSTRAINT "judge_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;
