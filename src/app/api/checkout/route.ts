import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Mock checkout - bypass payment for prototype
    return NextResponse.json({ url: null, success: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
