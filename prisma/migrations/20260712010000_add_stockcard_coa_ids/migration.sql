-- AlterTable: chart-of-accounts id placeholders (FK later)
ALTER TABLE `stockcard`
    ADD COLUMN `assets_id` INTEGER NULL,
    ADD COLUMN `liabilities_id` INTEGER NULL,
    ADD COLUMN `revenue_id` INTEGER NULL,
    ADD COLUMN `expense_id` INTEGER NULL;

CREATE INDEX `stockcard_assets_id_idx` ON `stockcard`(`assets_id`);
CREATE INDEX `stockcard_liabilities_id_idx` ON `stockcard`(`liabilities_id`);
CREATE INDEX `stockcard_revenue_id_idx` ON `stockcard`(`revenue_id`);
CREATE INDEX `stockcard_expense_id_idx` ON `stockcard`(`expense_id`);
