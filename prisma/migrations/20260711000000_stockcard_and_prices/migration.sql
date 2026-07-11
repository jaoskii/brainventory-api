-- RenameTable
RENAME TABLE `items` TO `stockcard`;

-- AlterTable: remove inline price columns (moved to stockcard_prices)
ALTER TABLE `stockcard`
    DROP COLUMN `retailPrice`,
    DROP COLUMN `retailDiscount`,
    DROP COLUMN `wholesalePrice`,
    DROP COLUMN `wholesaleDiscount`,
    DROP COLUMN `group1Price`,
    DROP COLUMN `group1Discount`,
    DROP COLUMN `group2Price`,
    DROP COLUMN `group2Discount`,
    DROP COLUMN `group3Price`,
    DROP COLUMN `group3Discount`,
    DROP COLUMN `group4Price`,
    DROP COLUMN `group4Discount`,
    DROP COLUMN `group5Price`,
    DROP COLUMN `group5Discount`,
    DROP COLUMN `group6Price`,
    DROP COLUMN `group6Discount`,
    DROP COLUMN `group7Price`,
    DROP COLUMN `group7Discount`,
    DROP COLUMN `group8Price`,
    DROP COLUMN `group8Discount`,
    DROP COLUMN `group9Price`,
    DROP COLUMN `group9Discount`,
    DROP COLUMN `group10Price`,
    DROP COLUMN `group10Discount`;

-- CreateTable
CREATE TABLE `stockcard_prices` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `itemid` INTEGER NOT NULL,
    `pricegrp` VARCHAR(50) NOT NULL,
    `price` DECIMAL(18, 4) NULL,

    INDEX `stockcard_prices_itemid_idx`(`itemid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `stockcard_prices` ADD CONSTRAINT `stockcard_prices_itemid_fkey` FOREIGN KEY (`itemid`) REFERENCES `stockcard`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
