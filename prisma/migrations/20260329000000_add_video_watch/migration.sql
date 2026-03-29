-- Add video watch tracking fields to progress table
ALTER TABLE "progress" ADD COLUMN "videoExitSeconds" INTEGER;
ALTER TABLE "progress" ADD COLUMN "videoMaxSeconds" INTEGER;
ALTER TABLE "progress" ADD COLUMN "videoDuration" INTEGER;
