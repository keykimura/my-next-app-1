-- AlterTable
ALTER TABLE "Room" ADD COLUMN "genre" TEXT NOT NULL DEFAULT '',
                   ADD COLUMN "maxMembers" INTEGER NOT NULL DEFAULT 5;
