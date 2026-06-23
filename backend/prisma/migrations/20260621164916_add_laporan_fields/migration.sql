-- AlterTable
ALTER TABLE `order` ADD COLUMN `completedAt` DATETIME(3) NULL,
    ADD COLUMN `dueAt` DATETIME(3) NULL,
    ADD COLUMN `handledAt` DATETIME(3) NULL,
    ADD COLUMN `operatorId` INTEGER NULL;

-- CreateTable
CREATE TABLE `OrderStageLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `stage` ENUM('verifikasi_file', 'pracetak', 'sedang_dicetak', 'finishing', 'qc', 'siap_kirim') NOT NULL,
    `startAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_operatorId_fkey` FOREIGN KEY (`operatorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderStageLog` ADD CONSTRAINT `OrderStageLog_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
