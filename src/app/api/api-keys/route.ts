import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { apiKeys } from '@/db/schema'
import { generateApiKey } from '@/lib/api-auth'
import { eq } from 'drizzle-orm'

/**
 * POST /api/api-keys - Create a new API key
 * Requires user authentication (session)
 */
export async function POST(request: NextRequest) {
  // Authenticate user session
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return NextResponse.json(
      {
        error: {
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
        },
      },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()

    // Validate name
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json(
        {
          error: {
            message: 'Name is required and must be a string',
            code: 'INVALID_NAME',
          },
        },
        { status: 400 }
      )
    }

    // Optional: Parse expiration
    let expiresAt: Date | undefined
    if (body.expires_in || body.expiresIn) {
      const expiresIn = body.expires_in || body.expiresIn
      expiresAt = new Date(Date.now() + expiresIn * 1000)
    }

    // Generate API key
    const key = generateApiKey()

    // Create API key record
    const [newApiKey] = await db
      .insert(apiKeys)
      .values({
        id: crypto.randomUUID(),
        key,
        userId: session.user.id,
        name: body.name.trim(),
        expiresAt,
      })
      .returning()

    return NextResponse.json(
      {
        data: {
          id: newApiKey.id,
          name: newApiKey.name,
          key: newApiKey.key, // Only show the full key once!
          last_used: newApiKey.lastUsed,
          created_at: newApiKey.createdAt,
          expires_at: newApiKey.expiresAt,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating API key:', error)
    return NextResponse.json(
      {
        error: {
          message: 'Failed to create API key',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/api-keys - List user's API keys
 * Requires user authentication (session)
 */
export async function GET(request: NextRequest) {
  // Authenticate user session
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return NextResponse.json(
      {
        error: {
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
        },
      },
      { status: 401 }
    )
  }

  try {
    // Fetch user's API keys (with partial key for security)
    const userApiKeys = await db.query.apiKeys.findMany({
      where: eq(apiKeys.userId, session.user.id),
      orderBy: [apiKeys.createdAt],
    })

    // Return only partial key for security
    return NextResponse.json({
      data: userApiKeys.map((apiKey) => ({
        id: apiKey.id,
        name: apiKey.name,
        key: `${apiKey.key.slice(0, 12)}...${apiKey.key.slice(-4)}`, // Show only partial
        last_used: apiKey.lastUsed,
        created_at: apiKey.createdAt,
        expires_at: apiKey.expiresAt,
      })),
    })
  } catch (error) {
    console.error('Error fetching API keys:', error)
    return NextResponse.json(
      {
        error: {
          message: 'Failed to fetch API keys',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    )
  }
}
