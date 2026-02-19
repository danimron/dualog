'use server'

import { db } from '@/lib/db'
import { posts, user } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'

export async function getPublicPosts() {
  try {
    // Query posts with user info using a raw query to avoid Drizzle relation issues
    const result = await db.execute(`
      SELECT 
        p.id, 
        p.title, 
        p.content, 
        p.is_public as "isPublic",
        p.created_at as "createdAt",
        p.updated_at as "updatedAt",
        u.name as "authorName",
        u.email as "authorEmail"
      FROM posts p
      INNER JOIN "user" u ON p.user_id = u.id
      WHERE p.is_public = true
      ORDER BY p.created_at DESC
    `)

    const postsWithAuthors = result.map((row: any) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      isPublic: row.isPublic,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      author: {
        name: row.authorName || 'Unknown',
        email: row.authorEmail || '',
      },
    }))

    return { success: true, data: postsWithAuthors }
  } catch (error) {
    console.error('Error fetching public posts:', error)
    return { success: false, error: 'Failed to fetch posts' }
  }
}

export async function getPostById(id: string) {
  try {
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, id),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        tags: {
          with: {
            tag: true,
          },
        },
      },
    })

    if (!post) {
      return { success: false, error: 'Post not found' }
    }

    // Check if post is public or user is authenticated
    if (!post.isPublic) {
      return { success: false, error: 'Post is private' }
    }

    return { success: true, data: post }
  } catch (error) {
    console.error('Error fetching post:', error)
    return { success: false, error: 'Failed to fetch post' }
  }
}

export async function getUserPosts(userId: string) {
  try {
    const userPosts = await db.query.posts.findMany({
      where: eq(posts.userId, userId),
      orderBy: [desc(posts.createdAt)],
      with: {
        tags: {
          with: {
            tag: true,
          },
        },
      },
    })

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
    // Verify post belongs to user
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, id),
    })

    if (!post || post.userId !== userId) {
      return { success: false, error: 'Post not found or unauthorized' }
    }

    const [updatedPost] = await db
      .update(posts)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id))
      .returning()

    return { success: true, data: updatedPost }
  } catch (error) {
    console.error('Error updating post:', error)
    return { success: false, error: 'Failed to update post' }
  }
}

export async function deletePost(id: string, userId: string) {
  try {
    // Verify post belongs to user
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, id),
    })

    if (!post || post.userId !== userId) {
      return { success: false, error: 'Post not found or unauthorized' }
    }

    await db.delete(posts).where(eq(posts.id, id))

    return { success: true }
  } catch (error) {
    console.error('Error deleting post:', error)
    return { success: false, error: 'Failed to delete post' }
  }
}
