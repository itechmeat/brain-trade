# Этап 10: Хуки и провайдеры состояния

## Создание React хуков и провайдеров для управления состоянием

### Шаг 10.1: Провайдер для React Query
- [ ] Скопировать и адаптировать `src/providers/QueryProvider.tsx`
- [ ] Настроить конфигурацию React Query:
  - Время кеширования
  - Retry стратегии
  - Devtools для разработки

### Шаг 10.2: Провайдер состояния приложения
- [ ] Создать `src/providers/AppProvider.tsx`:
  ```typescript
  interface AppContextType {
    chats: Chat[];
    activeChat: Chat | null;
    availableExperts: Expert[];
    selectedExperts: Expert[];
    isLoading: boolean;
    error: string | null;
  }
  ```
- [ ] Реализовать Context API для глобального состояния
- [ ] Добавить reducer для управления сложными обновлениями

### Шаг 10.3: Провайдер для чатов
- [ ] Создать `src/providers/ChatProvider.tsx`:
  ```typescript
  interface ChatContextType {
    messages: Message[];
    isTyping: Record<string, boolean>;
    ragSources: RAGSource[];
    sendMessage: (content: string) => Promise<void>;
    clearChat: () => void;
    addExpert: (expertId: string) => void;
    removeExpert: (expertId: string) => void;
  }
  ```

### Шаг 10.4: Хук для управления чатами
- [ ] Создать `src/hooks/useChats.ts`:
  - Загрузка списка чатов
  - Создание нового чата
  - Удаление чатов
  - Обновление метаданных чата
- [ ] Интеграция с React Query для кеширования

### Шаг 10.5: Хук для отправки сообщений
- [ ] Создать `src/hooks/useChatMessages.ts`:
  - Отправка сообщений
  - Получение ответов от экспертов
  - Управление состоянием загрузки
  - Обработка ошибок

### Шаг 10.6: Хук для streaming сообщений
- [ ] Создать `src/hooks/useStreamingChat.ts`:
  - Подключение к SSE потоку
  - Обработка incoming сообщений
  - Управление состоянием подключения
  - Автоматическое переподключение

### Шаг 10.7: Хук для управления экспертами
- [ ] Создать `src/hooks/useExperts.ts`:
  - Загрузка списка экспертов
  - Выбор/отмена выбора экспертов
  - Управление активными экспертами
  - Сохранение предпочтений

### Шаг 10.8: Хук для RAG поиска
- [ ] Создать `src/hooks/useRAGSearch.ts`:
  - Поиск релевантной информации
  - Кеширование результатов поиска
  - Фильтрация по экспертам
  - Управление состоянием поиска

### Шаг 10.9: Хук для настроек
- [ ] Создать `src/hooks/useSettings.ts`:
  - Управление настройками приложения
  - Выбор LLM моделей
  - Конфигурация экспертов
  - Сохранение в localStorage

### Шаг 10.10: Хук для WebSocket соединений
- [ ] Создать `src/hooks/useWebSocket.ts`:
  - Управление WebSocket подключениями
  - Обработка различных типов сообщений
  - Автоматическое переподключение
  - Heartbeat для поддержания соединения

### Шаг 10.11: Хук для оптимистичных обновлений
- [ ] Создать `src/hooks/useOptimisticUpdates.ts`:
  - Оптимистичное добавление сообщений
  - Rollback при ошибках
  - Синхронизация с сервером

### Шаг 10.12: Хук для бесконечной прокрутки
- [ ] Создать `src/hooks/useInfiniteScroll.ts`:
  - Загрузка истории сообщений
  - Пагинация чатов
  - Оптимизация производительности

### Шаг 10.13: Хук для локального хранилища
- [ ] Создать `src/hooks/useLocalStorage.ts`:
  - Сохранение состояния приложения
  - Восстановление после перезагрузки
  - Синхронизация между вкладками

### Шаг 10.14: Хук для обработки ошибок
- [ ] Создать `src/hooks/useErrorHandler.ts`:
  - Централизованная обработка ошибок
  - Показ уведомлений об ошибках
  - Логирование ошибок
  - Retry механизмы

### Шаг 10.15: Хук для анимаций и переходов
- [ ] Создать `src/hooks/useAnimations.ts`:
  - Анимация появления сообщений
  - Переходы между состояниями
  - Smooth scrolling

### Шаг 10.16: Хук для мониторинга производительности
- [ ] Создать `src/hooks/usePerformance.ts`:
  - Мониторинг времени ответа
  - Отслеживание использования памяти
  - Метрики пользовательского опыта

### Шаг 10.17: Создание составного провайдера
- [ ] Создать `src/providers/AppProviders.tsx`:
  ```typescript
  export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
      <QueryProvider>
        <AppProvider>
          <ChatProvider>
            {children}
          </ChatProvider>
        </AppProvider>
      </QueryProvider>
    );
  }
  ```

### Шаг 10.18: Обновление индексных файлов
- [ ] Обновить `src/hooks/index.ts`:
  ```typescript
  export { default as useChats } from './useChats';
  export { default as useChatMessages } from './useChatMessages';
  export { default as useStreamingChat } from './useStreamingChat';
  export { default as useExperts } from './useExperts';
  export { default as useRAGSearch } from './useRAGSearch';
  // ... остальные экспорты
  ```

### Шаг 10.19: Тестирование хуков
- [ ] Создать тесты для каждого хука
- [ ] Использовать React Testing Library
- [ ] Тестировать edge cases и error handling

## Результат этапа
После завершения этого этапа у вас будет:
- ✅ Провайдеры для управления глобальным состоянием
- ✅ Хуки для работы с чатами и сообщениями
- ✅ Streaming хуки для реального времени
- ✅ Хуки для управления экспертами и RAG
- ✅ Хуки для настроек и локального хранения
- ✅ Оптимистичные обновления и error handling
- ✅ Хуки для производительности и анимаций
- ✅ Полное покрытие тестами