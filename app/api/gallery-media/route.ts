import { NextRequest, NextResponse } from 'next/server'

import { getGalleryMedia } from '@/features/gallery-section/model'

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type')
  const mode = request.nextUrl.searchParams.get('mode')
  const offset = Number.parseInt(request.nextUrl.searchParams.get('offset') ?? '0', 10)
  const limit = Number.parseInt(request.nextUrl.searchParams.get('limit') ?? '0', 10)
  const { photos, videos } = await getGalleryMedia()

  if (type === 'photo') {
    if (mode === 'count') {
      return NextResponse.json({ count: photos.length })
    }

    if (limit > 0) {
      const items = photos.slice(offset, offset + limit)
      return NextResponse.json({
        items,
        total: photos.length,
        offset,
        limit,
        hasMore: offset + items.length < photos.length
      })
    }

    return NextResponse.json({ items: photos, total: photos.length })
  }

  if (type === 'video') {
    if (mode === 'count') {
      return NextResponse.json({ count: videos.length })
    }

    if (limit > 0) {
      const items = videos.slice(offset, offset + limit)
      return NextResponse.json({
        items,
        total: videos.length,
        offset,
        limit,
        hasMore: offset + items.length < videos.length
      })
    }

    return NextResponse.json({ items: videos, total: videos.length })
  }

  return NextResponse.json({ items: [] }, { status: 400 })
}
