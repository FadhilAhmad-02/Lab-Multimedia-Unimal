-- AlterTable
ALTER TABLE `order` ADD COLUMN `confirmedAt` DATETIME(3) NULL,
    ADD COLUMN `paymentStatus` ENUM('unpaid', 'paid', 'rejected') NOT NULL DEFAULT 'unpaid';
