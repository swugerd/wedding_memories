import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_YANDEX_HOSTS = ['yandex.ru', 'yandex.net']

const isAllowedYandexHost = (host: string) =>
  ALLOWED_YANDEX_HOSTS.some((domain) => host === domain || host.endsWith(`.${domain}`))

export async function GET(request: NextRequest) {
  const source = request.nextUrl.searchParams.get('url')

  if (!source) {
    return NextResponse.json({ error: 'Missing "url" query parameter.' }, { status: 400 })
  }

  let sourceUrl: URL

  try {
    sourceUrl = new URL(source)
  } catch {
    return NextResponse.json({ error: 'Invalid source URL.' }, { status: 400 })
  }

  if (!isAllowedYandexHost(sourceUrl.hostname)) {
    return NextResponse.json({ error: 'Host is not allowed.' }, { status: 403 })
  }

  const rangeHeader = request.headers.get('range')
  const upstream = await fetch(sourceUrl, {
    headers: rangeHeader ? { range: rangeHeader } : undefined,
    next: { revalidate: 300 }
  })

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: 'Failed to fetch media file.' }, { status: upstream.status })
  }

  const headers = new Headers()
  const contentType = upstream.headers.get('content-type')
  const cacheControl = upstream.headers.get('cache-control')
  const acceptRanges = upstream.headers.get('accept-ranges')
  const contentRange = upstream.headers.get('content-range')
  const contentLength = upstream.headers.get('content-length')

  if (contentType) {
    headers.set('content-type', contentType)
  }

  headers.set('cache-control', cacheControl ?? 'public, max-age=300, s-maxage=300')

  if (acceptRanges) {
    headers.set('accept-ranges', acceptRanges)
  }

  if (contentRange) {
    headers.set('content-range', contentRange)
  }

  if (contentLength) {
    headers.set('content-length', contentLength)
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers
  })
}
