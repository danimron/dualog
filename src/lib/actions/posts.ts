'use server'

import { db } from '@/lib/db'
import { posts, user } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'

export async function getPublicPosts() {
  try {
    // Use Drizzle ORM with relations to fetch public posts with author info
    const publicPosts = await db.query.posts.findMany({
      where: eq(posts.isPublic, true),
      orderBy: [desc(posts.createdAt)],
      with: {
        user: {
          columns: {
            name: true,
            email: true,
          },
        },
      },
    })

    // Transform the result to match the expected format
    const formattedPosts = publicPosts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      isPublic: post.isPublic,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.user || { name: 'Unknown', email: '' },
    }))

    return { success: true, data: formattedPosts }
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
