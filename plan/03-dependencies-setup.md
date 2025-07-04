# Этап 3: Установка и настройка зависимостей

## Установка NPM пакетов и настройка окружения

### Шаг 3.1: Основные зависимости Next.js и React
- [ ] Установить основные пакеты:
  ```bash
  npm install next@15.3.4 react@^19.0.0 react-dom@^19.0.0
  ```
- [ ] Установить TypeScript зависимости:
  ```bash
  npm install -D typescript @types/node @types/react @types/react-dom
  ```

### Шаг 3.2: UI библиотеки и компоненты
- [ ] Установить Radix UI компоненты:
  ```bash
  npm install @radix-ui/themes @radix-ui/colors @radix-ui/react-avatar @radix-ui/react-icons @radix-ui/react-navigation-menu @radix-ui/react-toast @radix-ui/react-toggle
  ```
- [ ] Установить SASS для стилей:
  ```bash
  npm install sass
  ```

### Шаг 3.3: LLM и AI зависимости
- [ ] Установить OpenAI SDK:
  ```bash
  npm install openai@^4.104.0
  ```
- [ ] Установить LangChain для работы с различными LLM:
  ```bash
  npm install langchain@^0.3.29 @langchain/community@^0.3.47
  ```
- [ ] Установить tiktoken для токенизации:
  ```bash
  npm install tiktoken@^1.0.21
  ```

### Шаг 3.4: RAG и векторная база данных
- [ ] Установить Qdrant клиент:
  ```bash
  npm install @qdrant/js-client-rest@^1.14.1
  ```

### Шаг 3.5: Управление состоянием и HTTP запросы
- [ ] Установить TanStack Query для управления состоянием:
  ```bash
  npm install @tanstack/react-query@^5.81.2 @tanstack/react-query-devtools@^5.81.2
  ```

### Шаг 3.6: Утилиты и вспомогательные библиотеки
- [ ] Установить утилиты для работы с данными:
  ```bash
  npm install date-fns@^4.1.0 zod@^3.25.67
  ```
- [ ] Установить react-markdown для отображения markdown:
  ```bash
  npm install react-markdown@^10.1.0
  ```
- [ ] Установить dotenv для переменных окружения:
  ```bash
  npm install dotenv@^16.6.0
  ```

### Шаг 3.7: Инструменты разработки
- [ ] Установить ESLint и Prettier:
  ```bash
  npm install -D eslint@^9 eslint-config-next@15.3.4 @eslint/eslintrc@^3 eslint-config-prettier@^10.1.5 prettier@^3.6.0
  ```

### Шаг 3.8: Проверка установки
- [ ] Проверить, что все пакеты установлены корректно:
  ```bash
  npm list
  ```
- [ ] Запустить проект для проверки:
  ```bash
  npm run dev
  ```
- [ ] Убедиться, что нет ошибок компиляции TypeScript
- [ ] Проверить работу ESLint:
  ```bash
  npm run lint
  ```

### Шаг 3.9: Создание индексных файлов
- [ ] Создать `src/components/index.ts` для экспорта компонентов
- [ ] Создать `src/hooks/index.ts` для экспорта хуков
- [ ] Создать `src/types/index.ts` для экспорта типов
- [ ] Создать `src/utils/index.ts` для экспорта утилит
- [ ] Создать `src/lib/index.ts` для экспорта библиотек

### Шаг 3.10: Настройка package.json скриптов
- [ ] Обновить скрипты в `package.json`:
  ```json
  {
    "scripts": {
      "dev": "next dev --turbopack --port 3100",
      "build": "next build",
      "start": "next start --port ${PORT:-8080}",
      "lint": "next lint",
      "type-check": "tsc --noEmit",
      "format": "prettier --write ."
    }
  }
  ```

## Результат этапа
После завершения этого этапа у вас будет:
- ✅ Все необходимые NPM пакеты установлены
- ✅ Настроенная среда разработки
- ✅ Работающий проект без ошибок компиляции
- ✅ Готовность к разработке функционала
- ✅ Индексные файлы для удобного импорта