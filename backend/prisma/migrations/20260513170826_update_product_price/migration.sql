/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `product` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `product` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `product` DROP COLUMN `updatedAt`,
    MODIFY `price` INTEGER NOT NULL;
