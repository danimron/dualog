import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { apiKeys } from '@/db/schema'
import { eq } from 'drizzle-orm'

/**
 * DELETE /api/api-keys/[id] - Delete an API key
 * Requires user authentication (session)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    // Verify the API key belongs to the user
    const apiKey = await db.query.apiKeys.findFirst({
      where: eq(apiKeys.id, params.id),
    })

    if (!apiKey) {
      return NextResponse.json(
        {
          error: {
            message: 'API key not found',
            code: 'NOT_FOUND',
          },
        },
        { status: 404 }
      )
    }

    if (apiKey.userId !== session.user.id) {
      return NextResponse.json(
        {
          error: {
            message: 'You do not have permission to delete this API key',
            code: 'FORBIDDEN',
          },
        },
        { status: 403 }
      )
    }

    // Delete the API key
    await db.delete(apiKeys).where(eq(apiKeys.id, params.id))

    return NextResponse.json(
      {
        data: {
          message: 'API key deleted successfully',
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting API key:', error)
    return NextResponse.json(
      {
        error: {
          message: 'Failed to delete API key',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    )
  }
}
