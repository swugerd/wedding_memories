## Wedding Gallery

Сайт свадьбы на Next.js с preview и табами `Фото/Видео`.

## Подключение Яндекс.Диска API

Галерея поддерживает 2 режима:
- `Yandex API`: если указаны public key переменные из `.env.local`.
- `Local fallback`: если переменных нет, берутся файлы из `public/img` и `public/video`.

1. Опубликуй папки на Яндекс.Диске и получи `public_key` (или публичную ссылку) отдельно для фото и видео.
2. Создай `.env.local` по образцу `.env.example`.
3. Заполни:
   - `YANDEX_DISK_PHOTOS_PUBLIC_KEY`
   - `YANDEX_DISK_VIDEOS_PUBLIC_KEY`
   - `YANDEX_DISK_PHOTOS_PATH` (обычно `/`)
   - `YANDEX_DISK_VIDEOS_PATH` (обычно `/`)

Медиа проксируются через `/api/yandex-file`, поэтому `next/image` работает без доп. `remotePatterns`.

## Запуск

```bash
npm install
npm run dev
```

Открой [http://localhost:3000](http://localhost:3000).

## Полезно

- Фото: ожидаются файлы `1.webp ... n.webp`
- Видео: ожидаются файлы `1.mp4 ... n.mp4`
- Файлы сортируются по номеру автоматически.

## Build Note

В офлайн-среде `next build` может падать из-за загрузки Google Fonts.

```bash
npm run build
```
