-- ============================================================================
-- Dualog Database Setup & Seed Data
-- ============================================================================
-- This script sets up the complete database schema and inserts sample data
-- for development purposes.
--
-- Usage:
--   docker exec -i dualog-db psql -U dualog -d dualog < scripts/seed-data.sql
-- ============================================================================

-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS posts_to_tags CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS session CASCADE;
DROP TABLE IF EXISTS account CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;

-- ============================================================================
-- TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- USER TABLE (Better Auth requires singular 'user')
-- ----------------------------------------------------------------------------
CREATE TABLE "user" (
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  email_verified boolean DEFAULT false NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

-- ----------------------------------------------------------------------------
-- SESSION TABLE (Better Auth for session management)
-- ----------------------------------------------------------------------------
CREATE TABLE session (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  expires_at timestamp NOT NULL,
  token text NOT NULL UNIQUE,
  ip_address text,
  user_agent text,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

-- ----------------------------------------------------------------------------
-- ACCOUNT TABLE (Better Auth for credentials)
-- ----------------------------------------------------------------------------
CREATE TABLE account (
  id text PRIMARY KEY,
  account_id text NOT NULL,
  provider_id text NOT NULL,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  access_token text,
  refresh_token text,
  id_token text,
  access_token_expires_at timestamp,
  refresh_token_expires_at timestamp,
  scope text,
  password text,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

-- ----------------------------------------------------------------------------
-- TAGS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE tags (
  id serial PRIMARY KEY,
  name text NOT NULL UNIQUE
);

-- ----------------------------------------------------------------------------
-- POSTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE posts (
  id text PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  is_public boolean DEFAULT false NOT NULL,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

-- ----------------------------------------------------------------------------
-- POSTS TO TAGS JUNCTION TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE posts_to_tags (
  post_id text NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id serial NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- ----------------------------------------------------------------------------
-- API KEYS TABLE (Agent Authentication)
-- ----------------------------------------------------------------------------
CREATE TABLE api_keys (
  id text PRIMARY KEY,
  key text NOT NULL UNIQUE,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  name text NOT NULL,
  last_used timestamp,
  created_at timestamp DEFAULT now() NOT NULL,
  expires_at timestamp
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_is_public ON posts(is_public);
CREATE INDEX idx_session_user_id ON session(user_id);
CREATE INDEX idx_session_token ON session(token);
CREATE INDEX idx_account_user_id ON account(user_id);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key ON api_keys(key);

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- ----------------------------------------------------------------------------
-- USERS
-- ----------------------------------------------------------------------------
INSERT INTO "user" (id, email, name, email_verified, created_at, updated_at) VALUES
  ('FpW3ZfnCvGbHlsejTiGK2q80J2bpzVFW', 'test@dualog.com', 'Test User', true, NOW(), NOW());

-- ----------------------------------------------------------------------------
-- ACCOUNTS (with bcrypt hashed passwords - password: 'testpassword123')
-- ----------------------------------------------------------------------------
INSERT INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at) VALUES
  ('39ZZ0DJgsnan6l8NkkxSxPiEeJ4kE5Bi', 'FpW3ZfnCvGbHlsejTiGK2q80J2bpzVFW', 'credential', 'FpW3ZfnCvGbHlsejTiGK2q80J2bpzVFW', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lewd5bC9q2Fl2K', NOW(), NOW());

-- ----------------------------------------------------------------------------
-- TAGS
-- ----------------------------------------------------------------------------
INSERT INTO tags (name) VALUES
  ('technology'),
  ('personal'),
  ('ideas'),
  ('learning'),
  ('nextjs'),
  ('ai'),
  ('productivity');

-- ----------------------------------------------------------------------------
-- POSTS
-- ----------------------------------------------------------------------------
INSERT INTO posts (id, title, content, is_public, user_id, created_at, updated_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Getting Started with Dualog', E'# Welcome to Dualog!

This is your first journal entry. Dualog is a powerful **AI-powered journaling platform**.

## Example Code Block

```javascript
function greet(name) {
  console.log('Hello World');
}
```

Start writing your thoughts!', true, 'FpW3ZfnCvGbHlsejTiGK2q80J2bpzVFW', NOW(), NOW()),

  ('550e8400-e29b-41d4-a716-446655440002', 'Today Learning Journey', E'# What I Learned Today

Today was an incredible learning experience!

### React Server Components
- Server Components render on the server
- They reduce JavaScript bundle size

### Better Auth Integration
- Simple authentication setup
- Built-in session management

Looking forward to tomorrow!', true, 'FpW3ZfnCvGbHlsejTiGK2q80J2bpzVFW', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

  ('550e8400-e29b-41d4-a716-446655440003', 'My Private Thoughts', E'# Private Reflections

This is a **private post** - only I can see it.

## Goals for This Week

1. Complete the Dualog project
2. Learn more about AI integration
3. Deploy to production

*Note: Private posts will not appear on the public feed.*', false, 'FpW3ZfnCvGbHlsejTiGK2q80J2bpzVFW', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

  ('550e8400-e29b-41d4-a716-446655440004', 'Building with Next.js 16', E'# Next.js 16 Experience

I have been building Dualog with **Next.js 16**!

## Features I Love

- **Turbopack** - Super fast builds
- **App Router** - Intuitive routing
- **Server Actions** - No more API routes
- **Server Components** - Better performance

The future of web development is here!', true, 'FpW3ZfnCvGbHlsejTiGK2q80J2bpzVFW', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

  ('550e8400-e29b-41d4-a716-446655440005', 'Markdown Power', E'# The Power of Markdown

Markdown is incredible!

## Text Formatting

- **Bold text** with double asterisks
- *Italic text* with single asterisks
- `inline code` with backticks

## Lists

### Unordered Lists
- Item 1
- Item 2
- Item 3

Simple yet powerful!', true, 'FpW3ZfnCvGbHlsejTiGK2q80J2bpzVFW', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),

  ('550e8400-e29b-41d4-a716-446655440006', 'Weekend Project Ideas', E'# Weekend Project Ideas

Here are some projects I want to tackle:

## High Priority

1. Dualog API - Add REST API for AI agents
2. Tag System - Implement post tagging
3. Search - Full-text search functionality

## Medium Priority

- Dark mode support
- Email notifications
- Export to PDF

Ready to build!', true, 'FpW3ZfnCvGbHlsejTiGK2q80J2bpzVFW', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),

  ('550e8400-e29b-41d4-a716-446655440007', 'AI Integration Plans', E'# AI Agent Integration

One of the core features of Dualog is allowing AI agents to post journal entries.

## API Design

### Authentication
- API keys (Bearer tokens)
- Scoped permissions
- Rate limiting

## Use Cases

1. Daily Reports - Agents can post daily summaries
2. Error Logs - Automatic error logging
3. Metrics - Performance tracking

The possibilities are endless!', true, 'FpW3ZfnCvGbHlsejTiGK2q80J2bpzVFW', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days');

-- ----------------------------------------------------------------------------
-- POST TAGS (Optional - for testing tag functionality)
-- ----------------------------------------------------------------------------
INSERT INTO posts_to_tags (post_id, tag_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440004', 5), -- Next.js tag
  ('550e8400-e29b-41d4-a716-446655440007', 6), -- AI tag
  ('550e8400-e29b-41d4-a716-446655440006', 7); -- Productivity tag

-- ----------------------------------------------------------------------------
-- API KEYS (For testing the API)
-- ----------------------------------------------------------------------------
INSERT INTO api_keys (id, key, user_id, name, created_at) VALUES
  ('test-key-001', 'dualog_sk_test123456789abcdef', 'FpW3ZfnCvGbHlsejTiGK2q80J2bpzVFW', 'Test API Key for Development', NOW());

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify the setup:

-- Check tables
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Count records
-- SELECT 'users' as table_name, COUNT(*) FROM "user"
-- UNION ALL
-- SELECT 'posts', COUNT(*) FROM posts
-- UNION ALL
-- SELECT 'tags', COUNT(*) FROM tags
-- UNION ALL
-- SELECT 'api_keys', COUNT(*) FROM api_keys;

-- View sample data
-- SELECT id, email, name FROM "user";
-- SELECT id, title, is_public, created_at FROM posts ORDER BY created_at DESC;
-- SELECT id, name FROM tags;
-- SELECT id, name FROM api_keys;

-- ============================================================================
-- NOTES
-- ============================================================================
--
-- Test User Credentials:
--   Email: test@dualog.com
--   Password: testpassword123
--
-- Test API Key:
--   Key: dualog_sk_test123456789abcdef
--   (Use this key to test the REST API endpoints)
--
-- To reset the database:
--   docker exec dualog-db psql -U dualog -d dualog -c "TRUNCATE \"user\", account, session, posts, tags, posts_to_tags, api_keys CASCADE;"
--
-- ============================================================================
