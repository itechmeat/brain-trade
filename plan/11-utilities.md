# Этап 11: Утилиты и вспомогательные функции

## Реализация утилит для форматирования и обработки данных

### Шаг 11.1: Утилиты для работы с API
- [ ] Скопировать и адаптировать `src/utils/api.ts` из venture-agent
- [ ] Добавить функции для:
  - Обработки HTTP запросов
  - Обработки ошибок API
  - Retry логики
  - Timeout обработки

### Шаг 11.2: Утилиты форматирования
- [ ] Скопировать и адаптировать `src/utils/formatters.ts`
- [ ] Добавить функции для:
  ```typescript
  // Форматирование времени
  formatTimestamp(date: Date): string;
  formatRelativeTime(date: Date): string;
  formatDuration(ms: number): string;
  
  // Форматирование текста
  truncateText(text: string, maxLength: number): string;
  highlightSearchTerms(text: string, searchTerm: string): string;
  parseMarkdown(text: string): string;
  
  // Форматирование данных экспертов
  formatExpertName(expert: Expert): string;
  formatExpertise(expertise: string[]): string;
  ```

### Шаг 11.3: Утилиты для работы с чатами
- [ ] Создать `src/utils/chat-utils.ts`:
  ```typescript
  // Управление чатами
  generateChatId(): string;
  generateMessageId(): string;
  createEmptyChat(expertIds: string[]): Chat;
  
  // Обработка сообщений
  groupMessagesByExpert(messages: Message[]): Record<string, Message[]>;
  findLastUserMessage(messages: Message[]): Message | null;
  calculateChatStatistics(chat: Chat): ChatStats;
  
  // Поиск и фильтрация
  searchMessagesInChat(messages: Message[], query: string): Message[];
  filterChatsByExpert(chats: Chat[], expertId: string): Chat[];
  ```

### Шаг 11.4: Утилиты для работы с экспертами
- [ ] Создать `src/utils/experts-utils.ts`:
  ```typescript
  // Управление экспертами
  getAvailableExperts(): Expert[];
  getExpertById(id: string): Expert | null;
  validateExpertSelection(expertIds: string[]): boolean;
  
  // Логика экспертов
  getOptimalExpertsForQuery(query: string): Expert[];
  calculateExpertWorkload(expertId: string, chats: Chat[]): number;
  getExpertPerformanceMetrics(expertId: string): ExpertMetrics;
  ```

### Шаг 11.5: Утилиты для валидации
- [ ] Создать `src/utils/validation.ts`:
  ```typescript
  // Валидация данных
  validateChatMessage(message: string): ValidationResult;
  validateExpertIds(expertIds: string[]): ValidationResult;
  validateApiResponse(response: any, schema: ZodSchema): ValidationResult;
  
  // Sanitization
  sanitizeUserInput(input: string): string;
  escapeHtml(text: string): string;
  removeScriptTags(html: string): string;
  ```

### Шаг 11.6: Утилиты для работы с localStorage
- [ ] Создать `src/utils/storage.ts`:
  ```typescript
  // LocalStorage wrapper
  setItem<T>(key: string, value: T): void;
  getItem<T>(key: string): T | null;
  removeItem(key: string): void;
  clearStorage(): void;
  
  // Специфичные для приложения функции
  saveChatDraft(chatId: string, draft: string): void;
  getChatDraft(chatId: string): string | null;
  saveExpertPreferences(preferences: ExpertPreferences): void;
  getExpertPreferences(): ExpertPreferences | null;
  ```

### Шаг 11.7: Утилиты для обработки ошибок
- [ ] Создать `src/utils/error-handling.ts`:
  ```typescript
  // Типы ошибок
  enum ErrorType {
    NETWORK_ERROR = 'network_error',
    API_ERROR = 'api_error',
    VALIDATION_ERROR = 'validation_error',
    EXPERT_ERROR = 'expert_error'
  }
  
  // Обработка ошибок
  createErrorMessage(error: unknown): string;
  logError(error: Error, context?: Record<string, any>): void;
  shouldRetry(error: Error): boolean;
  getErrorSeverity(error: Error): 'low' | 'medium' | 'high';
  ```

### Шаг 11.8: Утилиты для работы с URL и навигацией
- [ ] Создать `src/utils/navigation.ts`:
  ```typescript
  // URL утилиты
  generateChatUrl(chatId: string): string;
  parseUrlParams(url: string): Record<string, string>;
  buildApiUrl(endpoint: string, params?: Record<string, any>): string;
  
  // Навигация
  navigateToChat(chatId: string): void;
  openExpertProfile(expertId: string): void;
  shareChat(chatId: string): string;
  ```

### Шаг 11.9: Утилиты для работы с производительностью
- [ ] Создать `src/utils/performance.ts`:
  ```typescript
  // Измерение производительности
  measureExecutionTime<T>(fn: () => T): { result: T; time: number };
  debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T;
  throttle<T extends (...args: any[]) => any>(fn: T, delay: number): T;
  
  // Мониторинг
  trackUserAction(action: string, metadata?: Record<string, any>): void;
  measureApiResponseTime(endpoint: string, duration: number): void;
  ```

### Шаг 11.10: Утилиты для работы с устройствами
- [ ] Создать `src/utils/device.ts`:
  ```typescript
  // Определение устройства
  isMobile(): boolean;
  isTablet(): boolean;
  isDesktop(): boolean;
  getScreenSize(): 'small' | 'medium' | 'large';
  
  // Возможности браузера
  supportsWebSocket(): boolean;
  supportsLocalStorage(): boolean;
  supportsNotifications(): boolean;
  ```

### Шаг 11.11: Утилиты для работы с датами
- [ ] Создать `src/utils/date.ts`:
  ```typescript
  // Форматирование дат
  formatChatDate(date: Date): string;
  getTimeAgo(date: Date): string;
  isToday(date: Date): boolean;
  isYesterday(date: Date): boolean;
  
  // Сравнение дат
  isSameDay(date1: Date, date2: Date): boolean;
  daysBetween(date1: Date, date2: Date): number;
  ```

### Шаг 11.12: Утилиты для работы с текстом
- [ ] Создать `src/utils/text.ts`:
  ```typescript
  // Обработка текста
  countWords(text: string): number;
  extractEmails(text: string): string[];
  extractUrls(text: string): string[];
  removeExtraSpaces(text: string): string;
  
  // Поиск и выделение
  highlightText(text: string, highlight: string): string;
  searchInText(text: string, query: string): boolean;
  ```

### Шаг 11.13: Утилиты для константы и конфигурации
- [ ] Скопировать и адаптировать `src/lib/constants/`:
  - `config.ts` - конфигурация приложения
  - `routes.ts` - маршруты API
  - `index.ts` - экспорт констант

### Шаг 11.14: Создание индексного файла утилит
- [ ] Обновить `src/utils/index.ts`:
  ```typescript
  export * from './api';
  export * from './formatters';
  export * from './chat-utils';
  export * from './experts-utils';
  export * from './validation';
  export * from './storage';
  export * from './error-handling';
  export * from './navigation';
  export * from './performance';
  export * from './device';
  export * from './date';
  export * from './text';
  ```

### Шаг 11.15: Тестирование утилит
- [ ] Создать unit тесты для каждой утилиты
- [ ] Проверить edge cases
- [ ] Добавить тесты производительности для критичных функций

## Результат этапа
После завершения этого этапа у вас будет:
- ✅ Полный набор утилит для работы с API
- ✅ Функции форматирования для всех типов данных
- ✅ Специализированные утилиты для чатов и экспертов
- ✅ Валидация и sanitization пользовательских данных
- ✅ Обработка ошибок и производительности
- ✅ Утилиты для работы с устройствами и браузером
- ✅ Функции для работы с текстом и датами
- ✅ Полное покрытие тестами