ALTER TABLE "judge" ADD COLUMN "user_id" text REFERENCES "user"("id") ON DELETE SET NULL;
