'use server'

import { db } from '@/lib/db'
import { posts, user, tags, postsToTags } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'

// Import table directly to avoid schema issues
const postsTable = posts

export async function getPublicPosts() {
  try {
    console.log('[DEBUG] Fetching public posts...')
    
    // Simple query without relations - using select instead of query API
    const publicPosts = await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.isPublic, true))
      .orderBy(desc(postsTable.createdAt))
    
    console.log('[DEBUG] Found posts:', publicPosts.length)

    // Fetch user info separately for each post
    const postsWithAuthors = await Promise.all(
      publicPosts.map(async (post) => {
        console.log('[DEBUG] Fetching author for post:', post.id)
        const authorRows = await db
          .select({ name: user.name, email: user.email })
          .from(user)
          .where(eq(user.id, post.userId))
          .limit(1)
        
        const author = authorRows[0]
        console.log('[DEBUG] Author found:', author?.name || 'Unknown')
        
        return {
          id: post.id,
          title: post.title,
          content: post.content,
          isPublic: post.isPublic,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          author: {
            name: author?.name ?? 'Unknown',
            email: author?.email ?? '',
          },
        }
      })
    )
    
    console.log('[DEBUG] Returning posts with authors:', postsWithAuthors.length)
    return { success: true, data: postsWithAuthors }
  } catch (error) {
    return { 
      success: false, 
      error: 'Failed to fetch posts',
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack?.split('\n')[0] : 'No stack',
      errorType: error?.constructor?.name || typeof error
    }
  }
}

export async function getPostById(id: string) {
  try {
    const [post] = await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.id, id))
      .limit(1)

    if (!post) {
      return { success: false, error: 'Post not found' }
    }

    if (!post.isPublic) {
      return { success: false, error: 'Post is private' }
    }

    // Fetch author info
    const [author] = await db
      .select({ name: user.name, email: user.email })
      .from(user)
      .where(eq(user.id, post.userId))
      .limit(1)

    // Fetch tags for this post
    const postTags = await db
      .select({
        tagId: tags.id,
        tagName: tags.name,
      })
      .from(postsToTags)
      .innerJoin(tags, eq(postsToTags.tagId, tags.id))
      .where(eq(postsToTags.postId, id))

    // Format tags as expected by the page component
    const formattedTags = postTags.map((pt) => ({
      tag: {
        id: pt.tagId,
        name: pt.tagName,
      },
    }))

    return {
      success: true,
      data: {
        ...post,
        user: {
          name: author?.name ?? 'Unknown',
          email: author?.email ?? '',
        },
        tags: formattedTags,
      },
    }
  } catch (error) {
    console.error('Error fetching post:', error)
    return { success: false, error: 'Failed to fetch post' }
  }
}

export async function getUserPosts(userId: string) {
  try {
    const userPosts = await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.userId, userId))
      .orderBy(desc(postsTable.createdAt))

    return { success: true, data: userPosts }
  } catch (error) {
    console.error('Error fetching user posts:', error)
    return { success: false, error: 'Failed to fetch posts' }
  }
}

export async function createPost(data: {
  title: string
  content: string
  isPublic: boolean
  userId: string
}) {
  try {
    const [newPost] = await db
      .insert(posts)
      .values({
        id: crypto.randomUUID(),
        title: data.title,
        content: data.content,
        isPublic: data.isPublic,
        userId: data.userId,
      })
      .returning()

    return { success: true, data: newPost }
  } catch (error) {
    console.error('Error creating post:', error)
    return { success: false, error: 'Failed to create post' }
  }
}

export async function updatePost(
  id: string,
  userId: string,
  data: { title?: string; content?: string; isPublic?: boolean }
) {
  try {
    const [post] = await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.id, id))
      .limit(1)

    if (!post || post.userId !== userId) {
      return { success: false, error: 'Post not found or unauthorized' }
    }

    const [updatedPost] = await db
      .update(postsTable)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(postsTable.id, id))
      .returning()

    return { success: true, data: updatedPost }
  } catch (error) {
    console.error('Error updating post:', error)
    return { success: false, error: 'Failed to update post' }
  }
}

export async function deletePost(id: string, userId: string) {
  try {
    const [post] = await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.id, id))
      .limit(1)

    if (!post || post.userId !== userId) {
      return { success: false, error: 'Post not found or unauthorized' }
    }

    await db.delete(postsTable).where(eq(postsTable.id, id))

    return { success: true }
  } catch (error) {
    console.error('Error deleting post:', error)
    return { success: false, error: 'Failed to delete post' }
  }
}
