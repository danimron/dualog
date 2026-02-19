import { db } from '@/lib/db'
import { apiKeys, users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest } from 'next/server'

export interface ApiAuthResult {
  success: boolean
  userId?: string
  apiKeyId?: string
  error?: string
}

/**
 * Validates an API key from the Authorization header
 * Format: Authorization: Bearer dualog_sk_xxx
 */
export async function validateApiKey(request: NextRequest): Promise<ApiAuthResult> {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return {
        success: false,
        error: 'Missing Authorization header',
      }
    }

    // Check if it's a Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        error: 'Invalid authorization format. Use: Bearer <api_key>',
      }
    }

    const apiKey = authHeader.slice(7) // Remove 'Bearer ' prefix

    // Validate API key format
    if (!apiKey.startsWith('dualog_sk_')) {
      return {
        success: false,
        error: 'Invalid API key format. Keys should start with dualog_sk_',
      }
    }

    // Look up API key in database
    const keyRecord = await db.query.apiKeys.findFirst({
      where: eq(apiKeys.key, apiKey),
      with: {
        user: true,
      },
    })

    if (!keyRecord) {
      return {
        success: false,
        error: 'Invalid API key',
      }
    }

    // Check if API key has expired
    if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
      return {
        success: false,
        error: 'API key has expired',
      }
    }

    // Update last used timestamp
    await db
      .update(apiKeys)
      .set({ lastUsed: new Date() })
      .where(eq(apiKeys.id, keyRecord.id))

    return {
      success: true,
      userId: keyRecord.userId,
      apiKeyId: keyRecord.id,
    }
  } catch (error) {
    console.error('Error validating API key:', error)
    return {
      success: false,
      error: 'Internal server error',
    }
  }
}

/**
 * Generates a new API key
 * Format: dualog_sk_<random>
 */
export function generateApiKey(): string {
  const randomString = crypto.randomUUID().replace(/-/g, '')
  return `dualog_sk_${randomString}`
}
