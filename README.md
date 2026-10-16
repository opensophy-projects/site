# Opensophy Site

Основной сайт проекта Opensophy. Содержит главную страницу, страницы услуг и продуктов, новости, базу знаний, библиотеку UI-компонентов и служебные страницы.

## Структура сайта

```text
site/
├── README.md
├── package.json                 # Корневые команды и npm workspaces
├── apps/
│   └── web/                     # Основное веб-приложение (SvelteKit)
│       └── src/
│           ├── routes/          # Страницы и URL-маршруты сайта
│           │   ├── +page.svelte # Главная страница
│           │   ├── +layout.svelte
│           │   ├── (custom-pages)/
│           │   │   ├── news/    # Новости
│           │   │   ├── status/  # Статус проектов
│           │   │   └── ...      # Другие пользовательские страницы
│           │   ├── llms.txt/    # Маршрут генерации llms.txt
│           │   └── ...          # Остальные страницы и endpoints
│           └── lib/
│               ├── config/      # Конфигурация сайта и брендинга
│               ├── components/
│               │   └── ui-registry/ # UI-компоненты, меню и элементы интерфейса
│               ├── content/     # Контент страниц, статей и документации
│               └── stores/      # Состояние интерфейса
└── packages/                    # Общие пакеты workspace (если используются)
```

> Это обзорная карта основных частей проекта, а не полный список каждого файла. Для актуального дерева см. каталоги репозитория.

## Разделы сайта

### os.ui

Библиотека готовых UI-компонентов с примерами, живым превью и настройками.

- **Где находится в коде:** `apps/web/src/lib/content/[N]Библиотека компонентов{components}/` — статьи и страницы каталога компонентов.
- **Компоненты интерфейса сайта:** `apps/web/src/lib/components/ui-registry/`.
- **Страница в сайте:** [`/components/overview`](https://opensophy.com/components/overview).
- **Навигация:** описание ссылки на os.ui находится в `apps/web/src/lib/components/ui-registry/SiteMenu.svelte`.

### База знаний

Статьи и практические руководства по DevSecOps, инфраструктуре и смежным темам.

- **Где находится контент:** `apps/web/src/lib/content/[N]База Знаний{article}/`.
- **Страница в сайте:** [`/article/general`](https://opensophy.com/article/general).
- **Навигация:** ссылка и описание раздела задаются в `apps/web/src/lib/components/ui-registry/SiteMenu.svelte`.

### Другие разделы

| Раздел | Назначение | Где искать |
| --- | --- | --- |
| Главная | Обзор Opensophy и продуктов | `apps/web/src/routes/+page.svelte` |
| Новости | Публикации об изменениях проекта | `apps/web/src/routes/(custom-pages)/news/` |
| Статус проектов | Состояние и прогресс продуктов | `apps/web/src/routes/(custom-pages)/status/` |
| Услуги и решения | Описание услуг и условий работы | `apps/web/src/routes/` и `apps/web/src/lib/content/` |
| os.docs | Платформа документации и публикации контента | Ссылка в `apps/web/src/lib/components/ui-registry/SiteMenu.svelte` |
| os.mtls | Инструмент управления mTLS-сертификатами для Traefik | Ссылка в `apps/web/src/lib/components/ui-registry/SiteMenu.svelte` |
| NPMOS | Проект управления обратным прокси на базе Nginx | Информация о продукте в страницах сайта |

## Основные файлы

- `package.json` — корневые npm-скрипты и настройка workspaces.
- `apps/web/package.json` — зависимости и команды веб-приложения.
- `apps/web/src/lib/config/site.ts` — название сайта, канонический URL, SEO-метаданные и внешние ссылки.
- `apps/web/src/lib/components/ui-registry/SiteMenu.svelte` — пункты навигации, ссылки на продукты, решения и ресурсы.
- `apps/web/src/routes/+layout.svelte` — общий layout сайта и связанные метаданные.
- `apps/web/src/lib/content/` — контентные страницы и статьи.

## Разработка

Запускайте команды из корня репозитория:

```bash
npm install
npm run dev
```

Другие команды:

```bash
npm run build       # Сборка
npm run preview     # Просмотр собранного приложения
npm run check       # Проверка Svelte/TypeScript
npm run test        # Тесты
npm run lint        # ESLint
npm run format      # Форматирование
npm run format:check
```
