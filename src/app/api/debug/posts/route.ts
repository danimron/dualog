import { NextResponse } from 'next/server'
import { getPublicPosts } from '@/lib/actions/posts'

export async function GET() {
  try {
    const result = await getPublicPosts()
    return NextResponse.json({ 
      success: result.success, 
      data: result.data,
      error: result.error,
      dataLength: result.data?.length 
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
