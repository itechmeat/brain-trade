# План реализации реальных LLM интеграций для Venture Chat

## Обзор текущего состояния

### ✅ Что уже реализовано и готово к использованию

**Frontend UI (100% готов)**
- Полный интерфейс чата с мультиэкспертной поддержкой
- Двухпанельный layout (чат + документ)
- Система реакций и применения рекомендаций
- Все компоненты UI стилизованы и работают с моками

**Инфраструктура AI из предыдущего проекта (100% готова)**
- **LLM интеграции**: OpenRouter, Google Gemini, OpenAI (`/src/lib/api/ai-utils.ts`)
- **RAG система**: Qdrant + OpenAI embeddings (`/src/lib/rag/`)
- **Типизация**: Полные TypeScript типы для AI провайдеров
- **Конфигурация**: Настройки для всех LLM сервисов

**State Management (100% готов)**
- React Query провайдер
- Хук useChat с полной логикой управления чатом
- TypeScript типы для всех сущностей

### ❌ Что отсутствует и требует реализации

**API слой (полностью отсутствует)**
- Нет ни одного реального API endpoint
- Вся логика работает на моках
- Нет связи между frontend и AI инфраструктурой

**Интеграция LLM в chat flow**
- AI инфраструктура не подключена к чату
- Нет реальных вызовов к LLM моделям
- Отсутствует обработка streaming ответов

## Фазы реализации

## Фаза 1: Базовая LLM интеграция (MVP)

### 1.1 Создание API endpoints

**Приоритет: ВЫСОКИЙ**

Создать основные API endpoints для замены моков:

```typescript
// Нужно создать:
/src/app/api/chats/route.ts              // POST создание сессии
/src/app/api/chats/[id]/messages/route.ts // POST отправка сообщения с LLM ответами  
/src/app/api/experts/route.ts            // GET список экспертов
/src/app/api/ideas/analyze/route.ts      // POST анализ идеи и создание документа
```

**Техническая реализация:**
- Использовать существующие AI утилиты из `/src/lib/api/ai-utils.ts`
- Подключить OpenRouter для мультимодельных ответов экспертов
- Реализовать промпт-систему из `/src/lib/prompts.ts`

### 1.2 Модификация useChat хука

**Файл:** `/src/hooks/useChat.ts`

Заменить mock функции на реальные API вызовы:

```typescript
// Заменить:
const mockResponse = await mockUtils.simulateExpertResponse(message, expert);

// На:
const response = await fetch(`/api/chats/${sessionId}/messages`, {
  method: 'POST',
  body: JSON.stringify({ message, expertId: expert.id })
});
```

### 1.3 Интеграция системы промптов

**Файлы для модификации:**
- `/src/lib/prompts.ts` - уже содержит промпты для экспертов
- Создать API endpoint для генерации ответов с правильными промптами
- Использовать существующую логику подстановки переменных

### 1.4 Обработка реальных документов

**Создать endpoint:** `/src/app/api/documents/generate/route.ts`

Реализовать:
- Генерацию структурированного MD документа из пользовательской идеи
- Использование AI для создания Executive Summary, Problem Statement etc.
- Обновление документа на основе рекомендаций экспертов

## Фаза 2: RAG интеграция и улучшенные ответы

### 2.1 Подключение RAG системы

**Приоритет: СРЕДНИЙ**

Использовать готовую RAG инфраструктуру:

```typescript
// Файлы уже готовы:
/src/lib/rag/qdrant-service.ts     // Векторная БД
/src/lib/rag/embeddings-service.ts // OpenAI embeddings  
/src/lib/rag/rag-analyzer.ts       // RAG анализ
```

**Создать endpoint:** `/src/app/api/rag/search/route.ts`

Интегрировать RAG в генерацию ответов экспертов:
- Поиск релевантного контекста для каждого эксперта
- Обогащение промптов найденными знаниями
- Создание более контекстуальных ответов

### 2.2 Streaming ответы

Реализовать real-time ответы экспертов:
- Использовать Server-Sent Events или WebSocket
- Показывать typing indicator во время генерации
- Поддержка параллельных ответов от нескольких экспертов

### 2.3 Система Apply Recommendations

**Файл для доработки:** `/src/components/chat/MessageReactions.tsx`

Реализовать реальную логику в `handleApplyRecommendations`:
- API вызов для анализа рекомендаций
- Обновление документа на основе рекомендаций
- UI обратная связь о применении изменений

## Фаза 3: Продакшн готовность

### 3.1 Error Handling и Fallbacks

- Обработка сбоев LLM API
- Fallback на alternative провайдеры
- Graceful degradation к mock ответам при необходимости

### 3.2 Кэширование и оптимизация

- Кэширование частых запросов
- Оптимизация RAG поиска
- Rate limiting для API calls

### 3.3 Мониторинг

- Логирование AI вызовов
- Метрики использования
- Error tracking

## Технический план реализации

### Шаг 1: Environment setup

Проверить наличие всех необходимых переменных окружения:

```bash
# В .env должны быть:
NEXT_PUBLIC_APP_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_key
OPENROUTER_API_KEY=your_openrouter_key  
QDRANT_CLOUDE_URL=your_qdrant_url
QDRANT_CLOUDE_API_KEY=your_qdrant_key
OPENAI_API_KEY=your_openai_key
```

### Шаг 2: API Endpoints Creation

**Порядок создания:**

1. `/src/app/api/chats/route.ts` - создание сессий
2. `/src/app/api/chats/[id]/messages/route.ts` - основной endpoint для сообщений
3. `/src/app/api/ideas/analyze/route.ts` - анализ идей и создание документов
4. `/src/app/api/experts/route.ts` - конфигурация экспертов

### Шаг 3: Frontend Integration

1. Модификация `useChat.ts` для использования реальных API
2. Обновление error handling
3. Добавление loading states для real API calls

### Шаг 4: Testing & Verification

1. Тестирование каждого эксперта отдельно
2. Проверка генерации документов
3. Тестирование Apply Recommendations функционала

## Файлы для изучения и использования

### Готовые утилиты из предыдущего проекта:

**AI интеграции:**
- `/src/lib/api/ai-utils.ts` - основные LLM вызовы
- `/src/types/ai.ts` - типы для AI провайдеров
- `/src/config/rag-config.ts` - конфигурация RAG

**RAG система:**
- `/src/lib/rag/qdrant-service.ts`
- `/src/lib/rag/embeddings-service.ts`  
- `/src/lib/rag/rag-analyzer.ts`

**Утилиты:**
- `/src/utils/format.ts` - форматирование данных
- `/src/utils/validation.ts` - валидация

### Файлы для модификации:

**Frontend:**
- `/src/hooks/useChat.ts` - заменить моки на API вызовы
- `/src/components/chat/MessageReactions.tsx` - реализовать Apply Recommendations

**Backend (создать):**
- `/src/app/api/**` - все API endpoints

## Критерии готовности

### MVP готов когда:
- ✅ Эксперты дают реальные AI ответы вместо моков
- ✅ Документы генерируются через AI
- ✅ Все основные UI сценарии работают с реальными данными

### Полная версия готова когда:
- ✅ RAG система интегрирована
- ✅ Streaming ответы работают
- ✅ Apply Recommendations полностью функционально
- ✅ Error handling и fallbacks реализованы

## Оценка времени

**Фаза 1 (MVP):** 2-3 дня
- 1 день - создание API endpoints
- 1 день - интеграция с frontend  
- 0.5 дня - тестирование и отладка

**Фаза 2 (RAG + Advanced):** 2-3 дня
- 1 день - RAG интеграция
- 1 день - Streaming и Apply Recommendations
- 1 день - оптимизация и улучшения

**Фаза 3 (Production):** 1-2 дня
- Error handling, мониторинг, оптимизация

**Итого:** 5-8 дней для полной реализации

---

## Следующие шаги

1. **Начать с Фазы 1** - создание API endpoints и базовая LLM интеграция
2. **Протестировать MVP** - убедиться что основной flow работает
3. **Добавить RAG и advanced функции** - Фаза 2
4. **Подготовить к продакшену** - Фаза 3

Вся необходимая инфраструктура уже готова, нужно только связать frontend с AI бэкендом через API слой.