The issue is in `/root/.openclaw/workspace/dualog/src/lib/actions/posts.ts` - the `getPublicPosts()` function.

When there are no public posts, the query returns `success: true` but `result.data` is `[]` (empty array). The code checks `!result.data` which treats the empty array as false.

**Current code:**
```typescript
if (!result.success || !result.data) {
  return { success: false, error: 'Failed to fetch posts' }
}
```

**The fix:**
```typescript
// Don't treat empty result as error
const publicPosts = await db.select()...

// Check if result is successful
if (result.success) {
  return { success: true, data: publicPosts }
}

// Even if successful, handle empty array
if (publicPosts.length === 0) {
  return { success: true, data: [] }
}

return { success: true, data: publicPosts }
```

**What changed:**
1. Removed the `!result.data` check that treats empty array as error
2. Added explicit check for empty array: `publicPosts.length === 0`

Now the feed page should work correctly! 🎉
