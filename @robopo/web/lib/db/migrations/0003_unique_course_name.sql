-- Add unique constraint to course name
ALTER TABLE "course" ADD CONSTRAINT "course_name_unique" UNIQUE("name");