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
    next: { revalidate: 60 * 60 * 24 }
  })

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: 'Failed to fetch media file.' }, { status: upstream.status })
  }

  const headers = new Headers()
  const contentType = upstream.headers.get('content-type')
  const acceptRanges = upstream.headers.get('accept-ranges')
  const contentRange = upstream.headers.get('content-range')
  const contentLength = upstream.headers.get('content-length')
  const contentDisposition = upstream.headers.get('content-disposition')

  if (contentType) {
    headers.set('content-type', contentType)
  }

  const isImage = contentType?.startsWith('image/') ?? false
  const isVideo = contentType?.startsWith('video/') ?? false

  if (rangeHeader || upstream.status === 206) {
    headers.set('cache-control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400')
  } else if (isImage) {
    // Signed Yandex URLs are effectively content-addressed for our proxy key; cache hard to cut repeated traffic.
    headers.set('cache-control', 'public, max-age=31536000, s-maxage=31536000, immutable')
  } else if (isVideo) {
    headers.set('cache-control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800')
  } else {
    headers.set('cache-control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400')
  }

  if (acceptRanges) {
    headers.set('accept-ranges', acceptRanges)
  }

  if (contentRange) {
    headers.set('content-range', contentRange)
  }

  if (contentLength) {
    headers.set('content-length', contentLength)
  }

  if (contentDisposition) {
    headers.set('content-disposition', contentDisposition)
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers
  })
}
