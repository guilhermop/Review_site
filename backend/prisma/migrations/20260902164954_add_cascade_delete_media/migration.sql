-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_mediaId_fkey";

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
