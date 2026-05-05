import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''

  if (hostname === 'mylinks-app-mu.vercel.app') {
    const url = request.nextUrl.clone()
    url.hostname = 'www.alllinks.app'
    url.port = ''
    url.protocol = 'https:'
    return NextResponse.redirect(url, 301)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/:path*',
}
