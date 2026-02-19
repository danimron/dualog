import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function POST(request: Request) {
  const body = await request.json()

  try {
    const result = await auth.api.signInEmail({
      body: body,
      headers: await headers()
    })

    return Response.json(result)
  } catch (error: any) {
    return Response.json(
      { error: { message: error.message || 'Login failed' } },
      { status: 401 }
    )
  }
}
