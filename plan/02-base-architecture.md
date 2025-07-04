# Этап 2: Базовая архитектура и конфигурация

## Настройка Next.js, TypeScript и базовых конфигураций

### Шаг 2.1: Конфигурация Next.js
- [ ] Скопировать и адаптировать `next.config.ts` из venture-agent
- [ ] Настроить `next-env.d.ts` для TypeScript
- [ ] Добавить поддержку SASS: установить `sass` пакет
- [ ] Настроить модульные стили (CSS Modules) в конфигурации

### Шаг 2.2: Настройка TypeScript
- [ ] Скопировать `tsconfig.json` из venture-agent
- [ ] Адаптировать пути и алиасы под новую структуру проекта
- [ ] Настроить строгую типизацию (strict mode)
- [ ] Добавить path mapping для удобного импорта

### Шаг 2.3: Конфигурация ESLint и Prettier
- [ ] Скопировать `eslint.config.mjs` из venture-agent
- [ ] Установить и настроить Prettier для форматирования кода
- [ ] Создать `.prettierrc` с правилами форматирования
- [ ] Добавить интеграцию ESLint с Prettier
- [ ] Настроить pre-commit хуки (опционально)

### Шаг 2.4: Настройка переменных окружения
- [ ] Определить необходимые переменные окружения:
  - `OPENAI_API_KEY` - для OpenAI
  - `ANTHROPIC_API_KEY` - для Claude
  - `GOOGLE_API_KEY` - для Gemini
  - `QDRANT_URL` - URL Qdrant сервера
  - `QDRANT_API_KEY` - API ключ для Qdrant
  - `NODE_ENV` - окружение разработки
- [ ] Добавить переменные в `.env.example`
- [ ] Создать `.env.local` с реальными значениями

### Шаг 2.5: Создание базовых конфигурационных файлов
- [ ] Создать `src/config/app.ts` с основными настройками приложения
- [ ] Создать `src/config/api.ts` с настройками API
- [ ] Создать `src/config/constants.ts` с константами приложения
- [ ] Создать индексный файл `src/config/index.ts` для экспорта

### Шаг 2.6: Настройка глобальных стилей
- [ ] Скопировать и адаптировать `src/app/globals.css`
- [ ] Настроить базовые CSS переменные для темы
- [ ] Добавить базовые стили для чатов и сообщений
- [ ] Настроить responsive дизайн

### Шаг 2.7: Настройка манифеста приложения
- [ ] Создать `src/app/manifest.json` для PWA поддержки
- [ ] Добавить иконки приложения в `public/`
- [ ] Настроить метатеги в `layout.tsx`

## Результат этапа
После завершения этого этапа у вас будет:
- ✅ Полностью настроенная Next.js архитектура
- ✅ Конфигурация TypeScript с строгой типизацией
- ✅ ESLint и Prettier для качества кода
- ✅ Настроенные переменные окружения
- ✅ Базовые конфигурационные файлы
- ✅ Глобальные стили и манифест PWA