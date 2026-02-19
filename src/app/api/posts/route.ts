import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { posts } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  // Validate API key
  const authResult = await validateApiKey(request)

  if (!authResult.success || !authResult.userId) {
    return NextResponse.json(
      {
        error: {
          message: authResult.error || 'Authentication failed',
          code: 'UNAUTHORIZED',
        },
      },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()

    // Validate request body
    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json(
        {
          error: {
            message: 'Title is required and must be a string',
            code: 'INVALID_TITLE',
          },
        },
        { status: 400 }
      )
    }

    if (!body.content || typeof body.content !== 'string') {
      return NextResponse.json(
        {
          error: {
            message: 'Content is required and must be a string',
            code: 'INVALID_CONTENT',
          },
        },
        { status: 400 }
      )
    }

    // Optional: Validate is_public field
    const isPublic = body.is_public === true || body.isPublic === true

    // Create post
    const [newPost] = await db
      .insert(posts)
      .values({
        id: crypto.randomUUID(),
        title: body.title.trim(),
        content: body.content.trim(),
        isPublic,
        userId: authResult.userId,
      })
      .returning()

    return NextResponse.json(
      {
        data: {
          id: newPost.id,
          title: newPost.title,
          content: newPost.content,
          is_public: newPost.isPublic,
          created_at: newPost.createdAt,
          updated_at: newPost.updatedAt,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating post via API:', error)
    return NextResponse.json(
      {
        error: {
          message: 'Failed to create post',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve user's posts via API
export async function GET(request: NextRequest) {
  // Validate API key
  const authResult = await validateApiKey(request)

  if (!authResult.success || !authResult.userId) {
    return NextResponse.json(
      {
        error: {
          message: authResult.error || 'Authentication failed',
          code: 'UNAUTHORIZED',
        },
      },
      { status: 401 }
    )
  }

  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Validate limit
    if (limit > 100 || limit < 1) {
      return NextResponse.json(
        {
          error: {
            message: 'Limit must be between 1 and 100',
            code: 'INVALID_LIMIT',
          },
        },
        { status: 400 }
      )
    }

    // Fetch posts
    const userPosts = await db.query.posts.findMany({
      where: eq(posts.userId, authResult.userId),
      orderBy: [posts.createdAt],
      limit,
      offset,
    })

    return NextResponse.json({
      data: userPosts.map((post) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        is_public: post.isPublic,
        created_at: post.createdAt,
        updated_at: post.updatedAt,
      })),
      meta: {
        limit,
        offset,
        count: userPosts.length,
      },
    })
  } catch (error) {
    console.error('Error fetching posts via API:', error)
    return NextResponse.json(
      {
        error: {
          message: 'Failed to fetch posts',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    )
  }
}
