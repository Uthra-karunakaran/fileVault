/*
  Warnings:

  - Added the required column `fileId` to the `SharedLink` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SharedLink" ADD COLUMN     "fileId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "SharedLink" ADD CONSTRAINT "SharedLink_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;
