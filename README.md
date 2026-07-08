<div align="center">

![review](apps/web/static/og-image.jpg)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Svelte](https://img.shields.io/badge/Svelte-5-orange.svg)](https://svelte.dev)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-2-black.svg)](https://kit.svelte.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://www.typescriptlang.org)

</div>

# [OSD] Opensophy docs template

**Шаблон документации на SvelteKit для быстрого запуска брендированной технической документации.**

Этот репозиторий предоставляет готовое статическое приложение документации с настраиваемым SEO, навигацией, интерактивным UI, генерацией OG-изображений и структурой контента на mdsvex. Построено на статическом адаптере для деплоя на любой статический хостинг (GitHub Pages, Vercel, Netlify, Cloudflare Pages и др.).

> Данный проект экосистемы opensophy — личная инженерная разработка. Он открыт (open-source), но не предназначен для production-внедрения без кастомизации. Поддержка и SLA не предоставляются, без спонсирования или поддержки в пулл-реквестах.

## Быстрый старт

```bash
npm install
npm run dev
```

Приложение запускается в `apps/web`.

## Настройка под новый проект

Первоочерёдно обновите эти файлы:

- `apps/web/src/lib/config/site.ts` — название сайта, описание, ключевые слова, ссылки, метаданные пакета, canonical URL.
- `apps/web/src/lib/config/branding.ts` — логотип и название бренда в UI.
- `apps/web/src/lib/config/navigation.ts` — ручная структура sidebar и порядок страниц.
- `apps/web/src/lib/config/content-ui.ts` — поиск, TOC, действия, пагинация, табы пакетных менеджеров, настройки темы.

Затем настройте контент:

- `apps/web/src/lib/content/**/*` — страницы контента (`.svx` или `.svelte`) и маршруты.

## Основные команды

```bash
npm run dev      # запуск сервера разработки
npm run check    # проверка типов
npm run lint     # линтер
npm run build    # сборка production
```

## Деплой

Шаблон использует статический адаптер SvelteKit. Собранный вывод — полностью статический сайт в директории `build`, который можно задеплоить на:

- **GitHub Pages** — push директории `build` в ветку `gh-pages`
- **Vercel** — подключите репозиторий и укажите output directory `build`
- **Netlify** — подключите репозиторий и укажите publish directory `build`
- **Cloudflare Pages** — подключите репозиторий и укажите build output directory `build`
- Любой статический файловый сервер

## Лицензия

MIT. См. `LICENSE`.

