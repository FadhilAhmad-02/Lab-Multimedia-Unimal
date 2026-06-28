/*
  Warnings:

  - You are about to drop the column `group` on the `setting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `designtemplate` MODIFY `image` TEXT NOT NULL,
    MODIFY `link` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `setting` DROP COLUMN `group`;

-- CreateTable
CREATE TABLE `BackupLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `filename` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
