import { pgTable, text, boolean, timestamp, serial } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ============================================================================
// USER TABLE (Better Auth requires singular 'user')
// ============================================================================
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(), // Better Auth requires name
  emailVerified: boolean('email_verified').notNull().default(false), // Better Auth requires
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ============================================================================
// SESSION TABLE (Better Auth for session management)
// ============================================================================
export const session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, {
    onDelete: 'cascade',
  }),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ============================================================================
// ACCOUNT TABLE (Better Auth for credentials)
// ============================================================================
export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, {
    onDelete: 'cascade',
  }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'), // Bcrypt hash for email/password auth
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ============================================================================
// POSTS TABLE
// ============================================================================
export const posts = pgTable('posts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  content: text('content').notNull(), // Raw markdown
  isPublic: boolean('is_public').notNull().default(false),
  userId: text('user_id').notNull().references(() => user.id, {
    onDelete: 'cascade',
  }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ============================================================================
// TAGS TABLE
// ============================================================================
export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
})

// ============================================================================
// POSTS TO TAGS JUNCTION TABLE
// ============================================================================
export const postsToTags = pgTable('posts_to_tags', {
  postId: text('post_id').notNull().references(() => posts.id, {
    onDelete: 'cascade',
  }),
  tagId: serial('tag_id').notNull().references(() => tags.id, {
    onDelete: 'cascade',
  }),
})

// ============================================================================
// API KEYS TABLE (Agent Authentication)
// ============================================================================
export const apiKeys = pgTable('api_keys', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  key: text('key').notNull().unique(), // Bearer token (e.g., dualog_sk_xxx)
  userId: text('user_id').notNull().references(() => user.id, {
    onDelete: 'cascade',
  }),
  name: text('name').notNull(), // User-defined name (e.g., "My Claude Agent")
  lastUsed: timestamp('last_used'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  expiresAt: timestamp('expires_at'), // Optional: nullable for non-expiring keys
})

// Legacy alias for compatibility
export const users = user

// ============================================================================
// RELATIONSHIPS
// ============================================================================
export const userRelations = relations(user, ({ many }) => ({
  posts: many(posts),
  apiKeys: many(apiKeys),
  accounts: many(account),
  sessions: many(session),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(user, {
    fields: [posts.userId],
    references: [user.id],
  }),
  tags: many(postsToTags),
}))

export const tagsRelations = relations(tags, ({ many }) => ({
  posts: many(postsToTags),
}))

export const postsToTagsRelations = relations(postsToTags, ({ one }) => ({
  post: one(posts, {
    fields: [postsToTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postsToTags.tagId],
    references: [tags.id],
  }),
}))

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(user, {
    fields: [apiKeys.userId],
    references: [user.id],
  }),
}))
