import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME ?? 'brainventory_dev',
});

const prisma = new PrismaClient({ adapter });

const LOOKUPS = {
  brands: [
    { description: 'SteelPro', remarks: 'PH supplier' },
    { description: 'IronWorks', remarks: 'US supplier' },
    { description: 'FixIt', remarks: 'JP supplier' },
  ],
  models: [
    { description: 'Standard Bolt Kit', remarks: null },
    { description: 'Heavy Duty Rod', remarks: null },
    { description: 'Compact Washer Set', remarks: null },
  ],
  classes: [
    { description: 'Raw Materials', remarks: 'Unprocessed inventory items' },
    { description: 'Finished Goods', remarks: 'Ready for sale' },
    { description: 'Consumables', remarks: 'Office and shop supplies' },
  ],
  locations: [
    { description: 'Aisle 1 — Shelf A', remarks: 'WH-MAIN' },
    { description: 'Aisle 1 — Shelf B', remarks: 'WH-MAIN' },
    { description: 'Aisle 2 — Shelf A', remarks: 'WH-MAIN' },
    { description: 'Aisle 3 — Rack 1', remarks: 'WH-NORTH' },
    { description: 'Aisle 4 — Shelf C', remarks: 'WH-MAIN' },
    { description: 'Aisle 5 — Floor', remarks: 'WH-MAIN' },
    { description: 'Aisle 6 — Shelf D', remarks: 'WH-MAIN' },
    { description: 'Cold Room 3', remarks: 'WH-COLD' },
    { description: 'Aisle 7 — Shelf E', remarks: 'WH-MAIN' },
    { description: 'Aisle 8 — Clearance', remarks: 'WH-MAIN' },
  ],
  sizes: [
    { description: 'M10', remarks: 'pcs' },
    { description: '6mm', remarks: 'pcs' },
    { description: '2.5mm', remarks: 'roll' },
    { description: '1/2 inch', remarks: 'pcs' },
    { description: 'Large', remarks: 'pair' },
    { description: '1L', remarks: 'bottle' },
    { description: '9W', remarks: 'pcs' },
    { description: '1 gallon', remarks: 'can' },
  ],
  categories: [
    { description: 'Fasteners', remarks: 'Hardware subcategory' },
    { description: 'Hardware', remarks: null },
    { description: 'Electrical', remarks: null },
    { description: 'Plumbing', remarks: null },
    { description: 'Safety', remarks: null },
    { description: 'Lubricants', remarks: null },
    { description: 'Paint', remarks: null },
  ],
  groups: [
    { description: 'Group A — Retail', remarks: 'Standard retail pricing' },
    { description: 'Group B — Wholesale', remarks: 'Bulk buyers' },
    { description: 'Group C — VIP', remarks: 'Preferred customers' },
  ],
};

type LookupIds = {
  brands: Record<string, number>;
  models: Record<string, number>;
  classes: Record<string, number>;
  locations: Record<string, number>;
  sizes: Record<string, number>;
  categories: Record<string, number>;
  groups: Record<string, number>;
};

const STOCKCARDS = [
  {
    barcode: '8901000000001',
    description: 'Steel Bolt M10 x 50mm',
    defaultUom: 'pcs',
    model: 'Standard Bolt Kit',
    className: 'Raw Materials',
    brand: 'SteelPro',
    storeLocation: 'Aisle 1 — Shelf A',
    size: 'M10',
    category: 'Fasteners',
    groupName: 'Group A — Retail',
    itemRem: 'High-demand fastener',
    daysToExpiry: null,
    maximum: 500,
    minimum: 50,
    uoms: [{ uom: 'pcs', factor: 1 }, { uom: 'box', factor: 100 }],
    prices: [{ pricegrp: 'R', price: 2.5 }, { pricegrp: 'W', price: 2.0 }, { pricegrp: 'A', price: 2.2 }],
  },
  {
    barcode: '8901000000002',
    description: 'Hex Nut M10',
    defaultUom: 'pcs',
    model: 'Heavy Duty Rod',
    className: 'Raw Materials',
    brand: 'IronWorks',
    storeLocation: 'Aisle 1 — Shelf B',
    size: 'M10',
    category: 'Fasteners',
    groupName: 'Group A — Retail',
    daysToExpiry: null,
    maximum: 400,
    minimum: 40,
    uoms: [{ uom: 'pcs', factor: 1 }],
    prices: [{ pricegrp: 'R', price: 1.2 }, { pricegrp: 'W', price: 1.0 }],
  },
  {
    barcode: '8901000000003',
    description: 'Flat Washer M10',
    defaultUom: 'pcs',
    model: 'Compact Washer Set',
    className: 'Raw Materials',
    brand: 'FixIt',
    storeLocation: 'Aisle 2 — Shelf A',
    size: 'M10',
    category: 'Fasteners',
    groupName: 'Group B — Wholesale',
    maximum: 1000,
    minimum: 100,
    uoms: [{ uom: 'pcs', factor: 1 }, { uom: 'kg', factor: 0.05 }],
    prices: [{ pricegrp: 'R', price: 0.8 }, { pricegrp: 'W', price: 0.65 }, { pricegrp: 'B', price: 0.7 }],
  },
  {
    barcode: '8901000000004',
    description: 'Steel Rod 6mm x 1m',
    defaultUom: 'pcs',
    model: 'Heavy Duty Rod',
    className: 'Finished Goods',
    brand: 'IronWorks',
    storeLocation: 'Aisle 3 — Rack 1',
    size: '6mm',
    category: 'Hardware',
    groupName: 'Group B — Wholesale',
    maximum: 200,
    minimum: 20,
    uoms: [{ uom: 'pcs', factor: 1 }, { uom: 'm', factor: 1 }],
    prices: [{ pricegrp: 'R', price: 45.0 }, { pricegrp: 'W', price: 38.0 }],
  },
  {
    barcode: '8901000000005',
    description: 'Copper Wire 2.5mm (100m roll)',
    defaultUom: 'roll',
    model: 'Standard Bolt Kit',
    className: 'Finished Goods',
    brand: 'SteelPro',
    storeLocation: 'Aisle 4 — Shelf C',
    size: '2.5mm',
    category: 'Electrical',
    groupName: 'Group C — VIP',
    maximum: 80,
    minimum: 10,
    imported: true,
    uoms: [{ uom: 'roll', factor: 1 }, { uom: 'm', factor: 0.01 }],
    prices: [{ pricegrp: 'R', price: 1250.0 }, { pricegrp: 'W', price: 1100.0 }, { pricegrp: 'C', price: 1150.0 }],
  },
  {
    barcode: '8901000000006',
    description: 'PVC Pipe 1/2 inch (3m)',
    defaultUom: 'pcs',
    className: 'Consumables',
    brand: 'FixIt',
    storeLocation: 'Aisle 5 — Floor',
    size: '1/2 inch',
    category: 'Plumbing',
    groupName: 'Group A — Retail',
    maximum: 150,
    minimum: 15,
    uoms: [{ uom: 'pcs', factor: 1 }],
    prices: [{ pricegrp: 'R', price: 85.0 }, { pricegrp: 'W', price: 72.0 }],
  },
  {
    barcode: '8901000000007',
    description: 'Safety Gloves (pair)',
    defaultUom: 'pair',
    className: 'Consumables',
    brand: 'SteelPro',
    storeLocation: 'Aisle 6 — Shelf D',
    size: 'Large',
    category: 'Safety',
    groupName: 'Group A — Retail',
    maximum: 300,
    minimum: 30,
    uoms: [{ uom: 'pair', factor: 1 }, { uom: 'box', factor: 12 }],
    prices: [{ pricegrp: 'R', price: 35.0 }, { pricegrp: 'W', price: 28.0 }],
  },
  {
    barcode: '8901000000008',
    description: 'Machine Oil 1L',
    defaultUom: 'bottle',
    className: 'Consumables',
    brand: 'IronWorks',
    storeLocation: 'Cold Room 3',
    size: '1L',
    category: 'Lubricants',
    groupName: 'Group B — Wholesale',
    daysToExpiry: 365,
    maximum: 120,
    minimum: 12,
    uoms: [{ uom: 'bottle', factor: 1 }, { uom: 'box', factor: 12 }],
    prices: [{ pricegrp: 'R', price: 180.0 }, { pricegrp: 'W', price: 155.0 }],
  },
  {
    barcode: '8901000000009',
    description: 'LED Bulb 9W Warm White',
    defaultUom: 'pcs',
    className: 'Finished Goods',
    brand: 'FixIt',
    storeLocation: 'Aisle 7 — Shelf E',
    size: '9W',
    category: 'Electrical',
    groupName: 'Group C — VIP',
    maximum: 250,
    minimum: 25,
    inactive: false,
    uoms: [{ uom: 'pcs', factor: 1 }],
    prices: [{ pricegrp: 'R', price: 95.0 }, { pricegrp: 'W', price: 80.0 }, { pricegrp: 'C', price: 85.0 }],
  },
  {
    barcode: '8901000000010',
    description: 'Discontinued Paint — Red Oxide (discontinued)',
    defaultUom: 'can',
    className: 'Consumables',
    brand: 'SteelPro',
    storeLocation: 'Aisle 8 — Clearance',
    size: '1 gallon',
    category: 'Paint',
    groupName: 'Group A — Retail',
    maximum: 20,
    minimum: 5,
    inactive: true,
    uoms: [{ uom: 'can', factor: 1 }],
    prices: [{ pricegrp: 'R', price: 320.0 }],
  },
];

async function seedLookups(): Promise<LookupIds> {
  const ids: LookupIds = {
    brands: {},
    models: {},
    classes: {},
    locations: {},
    sizes: {},
    categories: {},
    groups: {},
  };

  for (const row of LOOKUPS.brands) {
    const created = await prisma.stockcardBrand.create({ data: row });
    ids.brands[row.description] = created.id;
  }
  for (const row of LOOKUPS.models) {
    const created = await prisma.stockcardModel.create({ data: row });
    ids.models[row.description] = created.id;
  }
  for (const row of LOOKUPS.classes) {
    const created = await prisma.stockcardClass.create({ data: row });
    ids.classes[row.description] = created.id;
  }
  for (const row of LOOKUPS.locations) {
    const created = await prisma.stockcardLocation.create({ data: row });
    ids.locations[row.description] = created.id;
  }
  for (const row of LOOKUPS.sizes) {
    const created = await prisma.stockcardSize.create({ data: row });
    ids.sizes[row.description] = created.id;
  }
  for (const row of LOOKUPS.categories) {
    const created = await prisma.stockcardCategory.create({ data: row });
    ids.categories[row.description] = created.id;
  }
  for (const row of LOOKUPS.groups) {
    const created = await prisma.stockcardGroup.create({ data: row });
    ids.groups[row.description] = created.id;
  }

  return ids;
}

async function main() {
  console.log('Seeding stockcard subfield lookups and stockcards...');

  await prisma.stockcardPrice.deleteMany();
  await prisma.uom.deleteMany();
  await prisma.stockcard.deleteMany();
  await prisma.stockcardBrand.deleteMany();
  await prisma.stockcardModel.deleteMany();
  await prisma.stockcardClass.deleteMany();
  await prisma.stockcardLocation.deleteMany();
  await prisma.stockcardSize.deleteMany();
  await prisma.stockcardCategory.deleteMany();
  await prisma.stockcardGroup.deleteMany();

  const lookupIds = await seedLookups();

  for (const item of STOCKCARDS) {
    const {
      uoms,
      prices,
      model,
      className,
      brand,
      storeLocation,
      size,
      category,
      groupName,
      ...data
    } = item;

    await prisma.stockcard.create({
      data: {
        ...data,
        isActive: !data.inactive,
        brandId: brand ? lookupIds.brands[brand] : undefined,
        modelId: model ? lookupIds.models[model] : undefined,
        classId: className ? lookupIds.classes[className] : undefined,
        locationId: storeLocation ? lookupIds.locations[storeLocation] : undefined,
        sizeId: size ? lookupIds.sizes[size] : undefined,
        categoryId: category ? lookupIds.categories[category] : undefined,
        groupId: groupName ? lookupIds.groups[groupName] : undefined,
        uoms: { create: uoms },
        prices: { create: prices },
      },
    });
  }

  const count = await prisma.stockcard.count();
  console.log(`Seeded ${count} stockcard records with subfield lookups.`);

  await seedCoa(prisma);
  const coaCount = await prisma.coa.count();
  console.log(`Seeded ${coaCount} chart of accounts records.`);
}

export async function seedCoa(client: PrismaClient = prisma) {
  console.log('Seeding full chart of accounts...');

  // Delete deepest nodes first (parent_code FK is RESTRICT)
  const existing = await client.coa.findMany({
    select: { id: true, level: true },
    orderBy: { level: 'desc' },
  });
  for (const row of existing) {
    await client.coa.delete({ where: { id: row.id } });
  }

  type CoaSeed = {
    code: string;
    description: string;
    level: number;
    alias: string;
    parentCode: string | null;
    category: string;
  };

  const accounts: CoaSeed[] = [
    // ── Assets ──────────────────────────────────────────────
    { code: '1000', description: 'Assets', level: 1, alias: 'AST', parentCode: null, category: 'A' },

    { code: '1100', description: 'Current Assets', level: 2, alias: 'CA', parentCode: '1000', category: 'A' },
    { code: '1110', description: 'Cash and Cash Equivalents', level: 3, alias: 'CASH', parentCode: '1100', category: 'A' },
    { code: '1111', description: 'Cash on Hand', level: 4, alias: 'COH', parentCode: '1110', category: 'A' },
    { code: '1112', description: 'Petty Cash', level: 4, alias: 'PETTY', parentCode: '1110', category: 'A' },
    { code: '1113', description: 'Cash in Bank — Operating', level: 4, alias: 'CIB-OP', parentCode: '1110', category: 'A' },
    { code: '1114', description: 'Cash in Bank — Payroll', level: 4, alias: 'CIB-PR', parentCode: '1110', category: 'A' },
    { code: '1115', description: 'Cash in Bank — Savings', level: 4, alias: 'CIB-SV', parentCode: '1110', category: 'A' },

    { code: '1120', description: 'Accounts Receivable', level: 3, alias: 'AR', parentCode: '1100', category: 'A' },
    { code: '1121', description: 'Trade Receivables', level: 4, alias: 'AR-TR', parentCode: '1120', category: 'A' },
    { code: '1122', description: 'Other Receivables', level: 4, alias: 'AR-OT', parentCode: '1120', category: 'A' },
    { code: '1123', description: 'Employee Advances', level: 4, alias: 'AR-EA', parentCode: '1120', category: 'A' },
    { code: '1129', description: 'Allowance for Doubtful Accounts', level: 4, alias: 'AR-ADA', parentCode: '1120', category: 'A' },

    { code: '1130', description: 'Inventory', level: 3, alias: 'INV', parentCode: '1100', category: 'A' },
    { code: '1131', description: 'Merchandise Inventory', level: 4, alias: 'INV-MER', parentCode: '1130', category: 'A' },
    { code: '1132', description: 'Raw Materials', level: 4, alias: 'INV-RM', parentCode: '1130', category: 'A' },
    { code: '1133', description: 'Work in Process', level: 4, alias: 'INV-WIP', parentCode: '1130', category: 'A' },
    { code: '1134', description: 'Finished Goods', level: 4, alias: 'INV-FG', parentCode: '1130', category: 'A' },

    { code: '1140', description: 'Prepaid Expenses', level: 3, alias: 'PRE', parentCode: '1100', category: 'A' },
    { code: '1141', description: 'Prepaid Rent', level: 4, alias: 'PRE-RNT', parentCode: '1140', category: 'A' },
    { code: '1142', description: 'Prepaid Insurance', level: 4, alias: 'PRE-INS', parentCode: '1140', category: 'A' },
    { code: '1143', description: 'Prepaid Supplies', level: 4, alias: 'PRE-SUP', parentCode: '1140', category: 'A' },

    { code: '1150', description: 'Other Current Assets', level: 3, alias: 'OCA', parentCode: '1100', category: 'A' },
    { code: '1151', description: 'Input VAT', level: 4, alias: 'VAT-IN', parentCode: '1150', category: 'A' },
    { code: '1152', description: 'Deposits and Guarantees', level: 4, alias: 'DEP', parentCode: '1150', category: 'A' },

    { code: '1200', description: 'Non-Current Assets', level: 2, alias: 'NCA', parentCode: '1000', category: 'A' },
    { code: '1210', description: 'Property, Plant & Equipment', level: 3, alias: 'PPE', parentCode: '1200', category: 'A' },
    { code: '1211', description: 'Land', level: 4, alias: 'LAND', parentCode: '1210', category: 'A' },
    { code: '1212', description: 'Buildings', level: 4, alias: 'BLDG', parentCode: '1210', category: 'A' },
    { code: '1213', description: 'Machinery & Equipment', level: 4, alias: 'M&E', parentCode: '1210', category: 'A' },
    { code: '1214', description: 'Furniture & Fixtures', level: 4, alias: 'F&F', parentCode: '1210', category: 'A' },
    { code: '1215', description: 'Vehicles', level: 4, alias: 'VEH', parentCode: '1210', category: 'A' },
    { code: '1216', description: 'Computer Equipment', level: 4, alias: 'IT-EQ', parentCode: '1210', category: 'A' },
    { code: '1219', description: 'Accumulated Depreciation — PPE', level: 4, alias: 'ACCDEP', parentCode: '1210', category: 'A' },

    { code: '1220', description: 'Intangible Assets', level: 3, alias: 'INT', parentCode: '1200', category: 'A' },
    { code: '1221', description: 'Software Licenses', level: 4, alias: 'SFT', parentCode: '1220', category: 'A' },
    { code: '1222', description: 'Goodwill', level: 4, alias: 'GW', parentCode: '1220', category: 'A' },
    { code: '1229', description: 'Accumulated Amortization', level: 4, alias: 'ACCAMT', parentCode: '1220', category: 'A' },

    { code: '1230', description: 'Long-term Investments', level: 3, alias: 'LTI', parentCode: '1200', category: 'A' },
    { code: '1231', description: 'Investment in Securities', level: 4, alias: 'SEC', parentCode: '1230', category: 'A' },

    // ── Liabilities ─────────────────────────────────────────
    { code: '2000', description: 'Liabilities', level: 1, alias: 'LIA', parentCode: null, category: 'L' },

    { code: '2100', description: 'Current Liabilities', level: 2, alias: 'CL', parentCode: '2000', category: 'L' },
    { code: '2110', description: 'Accounts Payable', level: 3, alias: 'AP', parentCode: '2100', category: 'L' },
    { code: '2111', description: 'Trade Payables', level: 4, alias: 'AP-TR', parentCode: '2110', category: 'L' },
    { code: '2112', description: 'Other Payables', level: 4, alias: 'AP-OT', parentCode: '2110', category: 'L' },

    { code: '2120', description: 'Accrued Expenses', level: 3, alias: 'ACC', parentCode: '2100', category: 'L' },
    { code: '2121', description: 'Accrued Salaries and Wages', level: 4, alias: 'ACC-SAL', parentCode: '2120', category: 'L' },
    { code: '2122', description: 'Accrued Interest', level: 4, alias: 'ACC-INT', parentCode: '2120', category: 'L' },
    { code: '2123', description: 'Accrued Utilities', level: 4, alias: 'ACC-UTL', parentCode: '2120', category: 'L' },

    { code: '2130', description: 'Short-term Loans Payable', level: 3, alias: 'STL', parentCode: '2100', category: 'L' },
    { code: '2131', description: 'Bank Overdraft', level: 4, alias: 'OD', parentCode: '2130', category: 'L' },
    { code: '2132', description: 'Notes Payable — Current', level: 4, alias: 'NP-C', parentCode: '2130', category: 'L' },

    { code: '2140', description: 'Taxes Payable', level: 3, alias: 'TAX', parentCode: '2100', category: 'L' },
    { code: '2141', description: 'Output VAT', level: 4, alias: 'VAT-OUT', parentCode: '2140', category: 'L' },
    { code: '2142', description: 'Income Tax Payable', level: 4, alias: 'ITP', parentCode: '2140', category: 'L' },
    { code: '2143', description: 'Withholding Tax Payable', level: 4, alias: 'WHT', parentCode: '2140', category: 'L' },

    { code: '2150', description: 'Unearned Revenue', level: 3, alias: 'UR', parentCode: '2100', category: 'L' },
    { code: '2151', description: 'Customer Deposits', level: 4, alias: 'CDEP', parentCode: '2150', category: 'L' },

    { code: '2160', description: 'Other Current Liabilities', level: 3, alias: 'OCL', parentCode: '2100', category: 'L' },
    { code: '2161', description: 'SSS / PhilHealth / Pag-IBIG Payable', level: 4, alias: 'STAT', parentCode: '2160', category: 'L' },

    { code: '2200', description: 'Non-Current Liabilities', level: 2, alias: 'NCL', parentCode: '2000', category: 'L' },
    { code: '2210', description: 'Long-term Loans Payable', level: 3, alias: 'LTL', parentCode: '2200', category: 'L' },
    { code: '2211', description: 'Bank Loans — Long-term', level: 4, alias: 'BL-LT', parentCode: '2210', category: 'L' },
    { code: '2212', description: 'Notes Payable — Long-term', level: 4, alias: 'NP-LT', parentCode: '2210', category: 'L' },
    { code: '2220', description: 'Bonds Payable', level: 3, alias: 'BOND', parentCode: '2200', category: 'L' },
    { code: '2230', description: 'Lease Liabilities — Non-Current', level: 3, alias: 'LEASE', parentCode: '2200', category: 'L' },

    // ── Equity ──────────────────────────────────────────────
    { code: '3000', description: 'Equity', level: 1, alias: 'EQY', parentCode: null, category: 'E' },

    { code: '3100', description: 'Owner / Share Capital', level: 2, alias: 'CAP', parentCode: '3000', category: 'E' },
    { code: '3110', description: 'Common Stock / Owner Capital', level: 3, alias: 'CS', parentCode: '3100', category: 'E' },
    { code: '3120', description: 'Additional Paid-in Capital', level: 3, alias: 'APIC', parentCode: '3100', category: 'E' },

    { code: '3200', description: 'Retained Earnings', level: 2, alias: 'RE', parentCode: '3000', category: 'E' },
    { code: '3210', description: 'Retained Earnings — Beginning', level: 3, alias: 'RE-BEG', parentCode: '3200', category: 'E' },
    { code: '3220', description: 'Current Year Earnings', level: 3, alias: 'CYE', parentCode: '3200', category: 'E' },

    { code: '3300', description: 'Drawings / Dividends', level: 2, alias: 'DRW', parentCode: '3000', category: 'E' },
    { code: '3310', description: 'Owner Drawings', level: 3, alias: 'DRAW', parentCode: '3300', category: 'E' },
    { code: '3320', description: 'Dividends Declared', level: 3, alias: 'DIV', parentCode: '3300', category: 'E' },

    // ── Revenue ─────────────────────────────────────────────
    { code: '4000', description: 'Revenue', level: 1, alias: 'REV', parentCode: null, category: 'R' },

    { code: '4100', description: 'Sales Revenue', level: 2, alias: 'SALES', parentCode: '4000', category: 'R' },
    { code: '4110', description: 'Product Sales', level: 3, alias: 'S-PROD', parentCode: '4100', category: 'R' },
    { code: '4120', description: 'Wholesale Sales', level: 3, alias: 'S-WHL', parentCode: '4100', category: 'R' },
    { code: '4130', description: 'Retail Sales', level: 3, alias: 'S-RTL', parentCode: '4100', category: 'R' },

    { code: '4200', description: 'Service Revenue', level: 2, alias: 'SVC', parentCode: '4000', category: 'R' },
    { code: '4210', description: 'Professional Fees', level: 3, alias: 'FEE', parentCode: '4200', category: 'R' },
    { code: '4220', description: 'Service Contracts', level: 3, alias: 'CONT', parentCode: '4200', category: 'R' },

    { code: '4300', description: 'Other Income', level: 2, alias: 'OI', parentCode: '4000', category: 'R' },
    { code: '4310', description: 'Interest Income', level: 3, alias: 'INT-INC', parentCode: '4300', category: 'R' },
    { code: '4320', description: 'Gain on Sale of Assets', level: 3, alias: 'GAIN', parentCode: '4300', category: 'R' },
    { code: '4330', description: 'Miscellaneous Income', level: 3, alias: 'MISC-INC', parentCode: '4300', category: 'R' },

    { code: '4400', description: 'Sales Returns and Allowances', level: 2, alias: 'SRA', parentCode: '4000', category: 'R' },
    { code: '4410', description: 'Sales Returns', level: 3, alias: 'SRET', parentCode: '4400', category: 'R' },
    { code: '4420', description: 'Sales Allowances', level: 3, alias: 'SALL', parentCode: '4400', category: 'R' },

    { code: '4500', description: 'Sales Discounts', level: 2, alias: 'SDISC', parentCode: '4000', category: 'R' },
    { code: '4510', description: 'Trade Discounts', level: 3, alias: 'TDISC', parentCode: '4500', category: 'R' },
    { code: '4520', description: 'Cash Discounts', level: 3, alias: 'CDISC', parentCode: '4500', category: 'R' },

    // ── Expenses ────────────────────────────────────────────
    { code: '5000', description: 'Expenses', level: 1, alias: 'EXP', parentCode: null, category: 'X' },

    { code: '5100', description: 'Cost of Goods Sold', level: 2, alias: 'COGS', parentCode: '5000', category: 'X' },
    { code: '5110', description: 'Purchases', level: 3, alias: 'PUR', parentCode: '5100', category: 'X' },
    { code: '5120', description: 'Freight In', level: 3, alias: 'FRTIN', parentCode: '5100', category: 'X' },
    { code: '5130', description: 'Purchase Returns and Allowances', level: 3, alias: 'PRA', parentCode: '5100', category: 'X' },
    { code: '5140', description: 'Purchase Discounts', level: 3, alias: 'PDISC', parentCode: '5100', category: 'X' },
    { code: '5150', description: 'Direct Labor', level: 3, alias: 'DLAB', parentCode: '5100', category: 'X' },
    { code: '5160', description: 'Manufacturing Overhead', level: 3, alias: 'MOH', parentCode: '5100', category: 'X' },

    { code: '5200', description: 'Selling Expenses', level: 2, alias: 'SELL', parentCode: '5000', category: 'X' },
    { code: '5210', description: 'Sales Salaries and Commissions', level: 3, alias: 'S-SAL', parentCode: '5200', category: 'X' },
    { code: '5220', description: 'Advertising and Promotion', level: 3, alias: 'AD', parentCode: '5200', category: 'X' },
    { code: '5230', description: 'Delivery / Freight Out', level: 3, alias: 'FRTOUT', parentCode: '5200', category: 'X' },
    { code: '5240', description: 'Sales Travel', level: 3, alias: 'S-TRV', parentCode: '5200', category: 'X' },
    { code: '5250', description: 'Packaging Materials', level: 3, alias: 'PKG', parentCode: '5200', category: 'X' },

    { code: '5300', description: 'Administrative Expenses', level: 2, alias: 'ADMIN', parentCode: '5000', category: 'X' },
    { code: '5310', description: 'Office Salaries and Wages', level: 3, alias: 'O-SAL', parentCode: '5300', category: 'X' },
    { code: '5320', description: 'Rent Expense', level: 3, alias: 'RENT', parentCode: '5300', category: 'X' },
    { code: '5330', description: 'Utilities Expense', level: 3, alias: 'UTIL', parentCode: '5300', category: 'X' },
    { code: '5331', description: 'Electricity', level: 4, alias: 'ELEC', parentCode: '5330', category: 'X' },
    { code: '5332', description: 'Water', level: 4, alias: 'WTR', parentCode: '5330', category: 'X' },
    { code: '5333', description: 'Internet and Communications', level: 4, alias: 'COMMS', parentCode: '5330', category: 'X' },
    { code: '5340', description: 'Office Supplies', level: 3, alias: 'SUPP', parentCode: '5300', category: 'X' },
    { code: '5350', description: 'Insurance Expense', level: 3, alias: 'INS', parentCode: '5300', category: 'X' },
    { code: '5360', description: 'Depreciation Expense', level: 3, alias: 'DEP-EXP', parentCode: '5300', category: 'X' },
    { code: '5370', description: 'Amortization Expense', level: 3, alias: 'AMT-EXP', parentCode: '5300', category: 'X' },
    { code: '5380', description: 'Professional Fees', level: 3, alias: 'PROF', parentCode: '5300', category: 'X' },
    { code: '5381', description: 'Legal Fees', level: 4, alias: 'LEGAL', parentCode: '5380', category: 'X' },
    { code: '5382', description: 'Accounting and Audit Fees', level: 4, alias: 'AUDIT', parentCode: '5380', category: 'X' },
    { code: '5390', description: 'Repairs and Maintenance', level: 3, alias: 'R&M', parentCode: '5300', category: 'X' },
    { code: '5391', description: 'Bad Debt Expense', level: 3, alias: 'BDE', parentCode: '5300', category: 'X' },
    { code: '5392', description: 'Taxes and Licenses', level: 3, alias: 'T&L', parentCode: '5300', category: 'X' },
    { code: '5393', description: 'Training and Development', level: 3, alias: 'TRN', parentCode: '5300', category: 'X' },
    { code: '5394', description: 'Miscellaneous Expense', level: 3, alias: 'MISC-EXP', parentCode: '5300', category: 'X' },

    { code: '5400', description: 'Financial Expenses', level: 2, alias: 'FIN', parentCode: '5000', category: 'X' },
    { code: '5410', description: 'Interest Expense', level: 3, alias: 'INT-EXP', parentCode: '5400', category: 'X' },
    { code: '5420', description: 'Bank Charges', level: 3, alias: 'BANK', parentCode: '5400', category: 'X' },
    { code: '5430', description: 'Foreign Exchange Loss', level: 3, alias: 'FX-LOSS', parentCode: '5400', category: 'X' },
    { code: '5440', description: 'Loss on Sale of Assets', level: 3, alias: 'LOSS', parentCode: '5400', category: 'X' },
  ];

  // Insert by level so parent_code FK always resolves
  const maxLevel = Math.max(...accounts.map((a) => a.level));
  for (let level = 1; level <= maxLevel; level++) {
    const batch = accounts.filter((a) => a.level === level);
    for (const row of batch) {
      await client.coa.create({ data: row });
    }
  }

  console.log(`Inserted ${accounts.length} COA accounts across ${maxLevel} levels.`);
}

const isDirectRun =
  typeof require !== 'undefined' &&
  require.main === module;

if (isDirectRun) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
