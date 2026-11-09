import { pgTable, pgEnum, uuid, text, timestamp, integer, boolean, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["reader", "creator", "admin"]);
export const accountStatus = pgEnum("account_status", ["active", "suspended"]);
export const publisherKind = pgEnum("publisher_kind", ["official", "independent"]);
export const subStatus = pgEnum("sub_status", ["pending", "active", "cancelled", "past_due", "expired"]);
export const payStatus = pgEnum("pay_status", ["pending", "success", "failed", "refunded"]);
export const seriesStatus = pgEnum("series_status", ["draft", "ongoing", "completed", "hiatus", "removed"]);
export const chapterStatus = pgEnum("chapter_status", ["draft", "scheduled", "published", "unpublished"]);
export const readerMode = pgEnum("reader_mode", ["vertical", "paged"]);

const id = () => uuid("id").primaryKey().defaultRandom();
const stamps = { createdAt: timestamp("created_at").notNull().defaultNow(), updatedAt: timestamp("updated_at").notNull().defaultNow() };

export const users = pgTable("users", {
  id: id(), email: text("email").notNull(), name: text("name"), passwordHash: text("password_hash"),
  role: userRole("role").notNull().default("reader"),
  status: accountStatus("status").notNull().default("active"), ...stamps,
}, (t) => [uniqueIndex("users_email_uq").on(t.email)]);

// One publisher per creator, plus exactly one "official" row for the studio.
export const publishers = pgTable("publishers", {
  id: id(), kind: publisherKind("kind").notNull(),
  ownerUserId: uuid("owner_user_id").notNull().references(() => users.id),
  slug: text("slug").notNull(), displayName: text("display_name").notNull(),
  feeExempt: boolean("fee_exempt").notNull().default(false), // explicit entitlement, changed only by audited admin/seed action
  bio: text("bio"), avatarUrl: text("avatar_url"), bannerUrl: text("banner_url"),
  socialLinks: jsonb("social_links").notNull().default([]), ...stamps,
}, (t) => [uniqueIndex("publishers_slug_uq").on(t.slug), index("publishers_owner_idx").on(t.ownerUserId)]);

// Prices and intervals are data, not code. Amounts in minor units (kobo).
export const plans = pgTable("plans", {
  id: id(), code: text("code").notNull(), name: text("name").notNull(),
  interval: text("interval").notNull(), amountMinor: integer("amount_minor").notNull(),
  currency: text("currency").notNull().default("NGN"), providerPlanCode: text("provider_plan_code"),
  benefits: jsonb("benefits").notNull().default([]), maxSeries: integer("max_series"), storageQuotaMb: integer("storage_quota_mb"), active: boolean("active").notNull().default(true),
}, (t) => [uniqueIndex("plans_code_uq").on(t.code)]);

export const subscriptions = pgTable("subscriptions", {
  id: id(), publisherId: uuid("publisher_id").notNull().references(() => publishers.id),
  planId: uuid("plan_id").notNull().references(() => plans.id),
  status: subStatus("status").notNull().default("pending"),
  providerRef: text("provider_ref"), startedAt: timestamp("started_at"),
  currentPeriodEnd: timestamp("current_period_end"), cancelledAt: timestamp("cancelled_at"), ...stamps,
}, (t) => [index("subs_publisher_idx").on(t.publisherId)]);

// Only written by the verified webhook handler. No card data is ever stored.
export const payments = pgTable("payments", {
  id: id(), subscriptionId: uuid("subscription_id").references(() => subscriptions.id),
  publisherId: uuid("publisher_id").notNull().references(() => publishers.id),
  reference: text("reference").notNull(), amountMinor: integer("amount_minor").notNull(),
  currency: text("currency").notNull(), status: payStatus("status").notNull(),
  paidAt: timestamp("paid_at"), feesMinor: integer("fees_minor"), createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [uniqueIndex("payments_ref_uq").on(t.reference)]);

export const series = pgTable("series", {
  id: id(), publisherId: uuid("publisher_id").notNull().references(() => publishers.id),
  slug: text("slug").notNull(), title: text("title").notNull(), synopsis: text("synopsis"),
  description: text("description"), coverUrl: text("cover_url"), genres: jsonb("genres").notNull().default([]),
  tags: jsonb("tags").notNull().default([]), credits: jsonb("credits").notNull().default({}),
  status: seriesStatus("status").notNull().default("draft"), mode: readerMode("mode").notNull().default("vertical"),
  featured: boolean("featured").notNull().default(false), ...stamps,
}, (t) => [uniqueIndex("series_slug_uq").on(t.slug), index("series_publisher_idx").on(t.publisherId)]);

export const chapters = pgTable("chapters", {
  id: id(), seriesId: uuid("series_id").notNull().references(() => series.id),
  number: integer("number").notNull(), title: text("title").notNull(), description: text("description"),
  status: chapterStatus("status").notNull().default("draft"),
  publishAt: timestamp("publish_at"), publishedAt: timestamp("published_at"), ...stamps,
}, (t) => [uniqueIndex("chapters_series_num_uq").on(t.seriesId, t.number), index("chapters_status_idx").on(t.status, t.publishedAt)]);

// Files live in object storage; only the URL and metadata are stored here.
export const chapterPages = pgTable("chapter_pages", {
  id: id(), chapterId: uuid("chapter_id").notNull().references(() => chapters.id, { onDelete: "cascade" }),
  position: integer("position").notNull(), url: text("url").notNull(), storageKey: text("storage_key").notNull(),
  width: integer("width").notNull(), height: integer("height").notNull(), bytes: integer("bytes").notNull(),
}, (t) => [uniqueIndex("pages_chapter_pos_uq").on(t.chapterId, t.position)]);

export const follows = pgTable("follows", {
  userId: uuid("user_id").notNull().references(() => users.id),
  seriesId: uuid("series_id").references(() => series.id), publisherId: uuid("publisher_id").references(() => publishers.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [index("follows_user_idx").on(t.userId), uniqueIndex("follows_series_uq").on(t.userId, t.seriesId), uniqueIndex("follows_pub_uq").on(t.userId, t.publisherId)]);

export const readingHistory = pgTable("reading_history", {
  userId: uuid("user_id").notNull().references(() => users.id), chapterId: uuid("chapter_id").notNull().references(() => chapters.id),
  readAt: timestamp("read_at").notNull().defaultNow(),
}, (t) => [uniqueIndex("history_uq").on(t.userId, t.chapterId)]);

export const reports = pgTable("reports", {
  id: id(), reporterId: uuid("reporter_id").references(() => users.id),
  seriesId: uuid("series_id").references(() => series.id), chapterId: uuid("chapter_id").references(() => chapters.id),
  kind: text("kind").notNull().default("content"), reason: text("reason").notNull(), resolution: text("resolution"), resolvedBy: uuid("resolved_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(), resolvedAt: timestamp("resolved_at"),
});

// Shared fixed-window rate limiter state (works across serverless instances).
export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(), windowStart: timestamp("window_start").notNull().defaultNow(), count: integer("count").notNull().default(0),
});

// Only the SHA-256 hash of a reset token is stored.
export const passwordResets = pgTable("password_resets", {
  id: id(), userId: uuid("user_id").notNull().references(() => users.id), tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at").notNull(), usedAt: timestamp("used_at"), createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [uniqueIndex("password_resets_hash_uq").on(t.tokenHash)]);

export const auditLog = pgTable("audit_log", {
  id: id(), actorId: uuid("actor_id").references(() => users.id), action: text("action").notNull(),
  targetType: text("target_type").notNull(), targetId: text("target_id"), details: jsonb("details").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [index("audit_created_idx").on(t.createdAt)]);

export const termsAcceptances = pgTable("terms_acceptances", {
  id: id(), userId: uuid("user_id").notNull().references(() => users.id), version: text("version").notNull(),
  ownershipConfirmed: boolean("ownership_confirmed").notNull(), acceptedAt: timestamp("accepted_at").notNull().defaultNow(),
}, (t) => [index("terms_user_idx").on(t.userId)]);
