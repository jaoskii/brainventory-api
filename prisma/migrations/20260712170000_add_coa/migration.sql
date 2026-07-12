-- CreateTable
CREATE TABLE `coa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `level` INTEGER NULL,
    `alias` VARCHAR(191) NULL,
    `parent_code` VARCHAR(191) NULL,
    `category` VARCHAR(50) NULL,

    UNIQUE INDEX `coa_code_key`(`code`),
    INDEX `coa_parent_code_idx`(`parent_code`),
    INDEX `coa_category_idx`(`category`),
    INDEX `coa_level_idx`(`level`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `coa` ADD CONSTRAINT `coa_parent_code_fkey` FOREIGN KEY (`parent_code`) REFERENCES `coa`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;
