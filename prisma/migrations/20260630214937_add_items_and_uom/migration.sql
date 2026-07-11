-- CreateTable
CREATE TABLE `items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `barcode` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `defaultUom` VARCHAR(50) NULL,
    `model` VARCHAR(191) NULL,
    `class` VARCHAR(191) NULL,
    `brand` VARCHAR(191) NULL,
    `storeLocation` VARCHAR(191) NULL,
    `size` VARCHAR(191) NULL,
    `category` VARCHAR(191) NULL,
    `group` VARCHAR(191) NULL,
    `itemRem` TEXT NULL,
    `daysToExpiry` INTEGER NULL,
    `maximum` DECIMAL(18, 4) NULL,
    `minimum` DECIMAL(18, 4) NULL,
    `inactive` BOOLEAN NOT NULL DEFAULT false,
    `imported` BOOLEAN NOT NULL DEFAULT false,
    `assets` VARCHAR(191) NULL,
    `liabilities` VARCHAR(191) NULL,
    `revenue` VARCHAR(191) NULL,
    `expense` VARCHAR(191) NULL,
    `retailPrice` DECIMAL(18, 4) NULL,
    `retailDiscount` DECIMAL(18, 4) NULL,
    `wholesalePrice` DECIMAL(18, 4) NULL,
    `wholesaleDiscount` DECIMAL(18, 4) NULL,
    `group1Price` DECIMAL(18, 4) NULL,
    `group1Discount` DECIMAL(18, 4) NULL,
    `group2Price` DECIMAL(18, 4) NULL,
    `group2Discount` DECIMAL(18, 4) NULL,
    `group3Price` DECIMAL(18, 4) NULL,
    `group3Discount` DECIMAL(18, 4) NULL,
    `group4Price` DECIMAL(18, 4) NULL,
    `group4Discount` DECIMAL(18, 4) NULL,
    `group5Price` DECIMAL(18, 4) NULL,
    `group5Discount` DECIMAL(18, 4) NULL,
    `group6Price` DECIMAL(18, 4) NULL,
    `group6Discount` DECIMAL(18, 4) NULL,
    `group7Price` DECIMAL(18, 4) NULL,
    `group7Discount` DECIMAL(18, 4) NULL,
    `group8Price` DECIMAL(18, 4) NULL,
    `group8Discount` DECIMAL(18, 4) NULL,
    `group9Price` DECIMAL(18, 4) NULL,
    `group9Discount` DECIMAL(18, 4) NULL,
    `group10Price` DECIMAL(18, 4) NULL,
    `group10Discount` DECIMAL(18, 4) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `uom` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `itemid` INTEGER NOT NULL,
    `uom` VARCHAR(50) NOT NULL,
    `factor` DECIMAL(18, 4) NULL,
    `amt` DECIMAL(18, 4) NULL,
    `kg` DECIMAL(18, 4) NULL,
    `desc` TEXT NULL,

    INDEX `uom_itemid_idx`(`itemid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `uom` ADD CONSTRAINT `uom_itemid_fkey` FOREIGN KEY (`itemid`) REFERENCES `items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
