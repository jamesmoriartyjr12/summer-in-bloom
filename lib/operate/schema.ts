import { bigint, boolean, integer, jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";

export const deals = pgTable("deals", {
  id: uuid("id").primaryKey().defaultRandom(),
  token: text("token").notNull().unique(),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name").notNull().default(""),
  contactRole: text("contact_role").notNull().default(""),
  linkedinUrl: text("linkedin_url"),
  avatarUrl: text("avatar_url"),
  companyLogoUrl: text("company_logo_url"),
  companyUrl: text("company_url"),
  letterBlocks: jsonb("letter_blocks"),
  equityEnabled: boolean("equity_enabled").notNull().default(false),
  ratesOverridden: boolean("rates_overridden").notNull().default(false),
  termLength: text("term_length").notNull().default("six-month"),
  round: text("round"),
  valuationDollars: bigint("valuation_dollars", { mode: "bigint" }),
  valuationBasis: text("valuation_basis").notNull().default("post"),
  equityBasis: text("equity_basis"),
  equityMultiplierTenths: integer("equity_multiplier_tenths"),
  cashFloorCents: integer("cash_floor_cents"),
  hourlyCostCents: integer("hourly_cost_cents"),
  selectedPackageId: uuid("selected_package_id"),
  selectedTerm: text("selected_term"),
  selectedEquityCents: integer("selected_equity_cents"),
  hubspotContactId: text("hubspot_contact_id"),
  hubspotDealId: text("hubspot_deal_id"),
});

export const baseRates = pgTable("base_rates", {
  id: uuid("id").primaryKey().defaultRandom(),
  serviceName: text("service_name").notNull(),
  hoursPerWeek: integer("hours_per_week").notNull(),
  listRateCents: integer("list_rate_cents").notNull(),
  cashRateCents: integer("cash_rate_cents").notNull(),
  sortOrder: integer("sort_order").notNull(),
});

export const packages = pgTable("packages", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealId: uuid("deal_id")
    .notNull()
    .references(() => deals.id, { onDelete: "cascade" }),
  serviceName: text("service_name").notNull(),
  hoursPerWeek: integer("hours_per_week").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  listRateCents: integer("list_rate_cents").notNull(),
  cashRateCents: integer("cash_rate_cents").notNull(),
  yearListRateCents: integer("year_list_rate_cents"),
  yearCashRateCents: integer("year_cash_rate_cents"),
  sortOrder: integer("sort_order").notNull().default(0),
});
