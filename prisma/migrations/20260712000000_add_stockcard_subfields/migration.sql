-- CreateTable
CREATE TABLE `stockcard_brand` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(191) NULL,
    `remarks` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stockcard_model` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(191) NULL,
    `remarks` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stockcard_class` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(191) NULL,
    `remarks` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stockcard_location` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(191) NULL,
    `remarks` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stockcard_size` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(191) NULL,
    `remarks` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stockcard_category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(191) NULL,
    `remarks` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stockcard_group` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(191) NULL,
    `remarks` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `stockcard`
    ADD COLUMN `brand_id` INTEGER NULL,
    ADD COLUMN `model_id` INTEGER NULL,
    ADD COLUMN `class_id` INTEGER NULL,
    ADD COLUMN `location_id` INTEGER NULL,
    ADD COLUMN `size_id` INTEGER NULL,
    ADD COLUMN `category_id` INTEGER NULL,
    ADD COLUMN `group_id` INTEGER NULL;

-- CreateIndex
CREATE INDEX `stockcard_brand_id_idx` ON `stockcard`(`brand_id`);
CREATE INDEX `stockcard_model_id_idx` ON `stockcard`(`model_id`);
CREATE INDEX `stockcard_class_id_idx` ON `stockcard`(`class_id`);
CREATE INDEX `stockcard_location_id_idx` ON `stockcard`(`location_id`);
CREATE INDEX `stockcard_size_id_idx` ON `stockcard`(`size_id`);
CREATE INDEX `stockcard_category_id_idx` ON `stockcard`(`category_id`);
CREATE INDEX `stockcard_group_id_idx` ON `stockcard`(`group_id`);

-- DropColumn
ALTER TABLE `stockcard`
    DROP COLUMN `brand`,
    DROP COLUMN `model`,
    DROP COLUMN `class`,
    DROP COLUMN `storeLocation`,
    DROP COLUMN `size`,
    DROP COLUMN `category`,
    DROP COLUMN `group`;

-- AddForeignKey
ALTER TABLE `stockcard` ADD CONSTRAINT `stockcard_brand_id_fkey` FOREIGN KEY (`brand_id`) REFERENCES `stockcard_brand`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `stockcard` ADD CONSTRAINT `stockcard_model_id_fkey` FOREIGN KEY (`model_id`) REFERENCES `stockcard_model`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `stockcard` ADD CONSTRAINT `stockcard_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `stockcard_class`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `stockcard` ADD CONSTRAINT `stockcard_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `stockcard_location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `stockcard` ADD CONSTRAINT `stockcard_size_id_fkey` FOREIGN KEY (`size_id`) REFERENCES `stockcard_size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `stockcard` ADD CONSTRAINT `stockcard_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `stockcard_category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `stockcard` ADD CONSTRAINT `stockcard_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `stockcard_group`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
