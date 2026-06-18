-- AlterTable
ALTER TABLE `product` ADD COLUMN `specifications` JSON NULL,
    ALTER COLUMN `updatedAt` DROP DEFAULT;
