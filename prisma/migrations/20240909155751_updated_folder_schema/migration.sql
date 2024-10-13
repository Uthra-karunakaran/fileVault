-- DropForeignKey
ALTER TABLE "Folder" DROP CONSTRAINT "Folder_libraryId_fkey";

-- AlterTable
ALTER TABLE "Folder" ADD COLUMN     "parentFolderId" INTEGER,
ALTER COLUMN "libraryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_parentFolderId_fkey" FOREIGN KEY ("parentFolderId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
