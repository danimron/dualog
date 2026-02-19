import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return Response.json(
        { error: { message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    return Response.json({ data: session })
  } catch (error: any) {
    return Response.json(
      { error: { message: error.message || 'Session check failed' } },
      { status: 500 }
    )
  }
}
