# Реестр дубликатов компонентов

## Назначение

Этот файл отслеживает все дубликаты компонентов, созданные для интеграции blockchain функциональности в главную страницу. После завершения проекта эти дубликаты должны быть проанализированы и по возможности объединены.

## Стратегия именования

- **Prefix**: `Marketplace` - для компонентов главной страницы
- **Suffix**: оригинальное имя компонента
- **Пример**: `TokenizedChatInterface` → `MarketplaceTokenizedChatInterface`

---

## Дубликаты компонентов

### 1. Expert Components

#### MarketplaceExpertSelector

- **Оригинал**: `src/components/experts/ExpertSelector/ExpertSelector.tsx`
- **Дубликат**: `src/components/experts/MarketplaceExpertSelector/MarketplaceExpertSelector.tsx`
- **Статус**: ✅ Готов
- **Различия**:
  - Работает с `InvestmentExpert[]` вместо `ExpertInfo[]`
  - Интегрирован с marketplace hooks
  - Адаптирован для главной страницы
- **Причина дублирования**: Разные типы данных и контекст использования

#### MarketplaceExpertCard

- **Оригинал**: `src/components/experts/ExpertCard/ExpertCard.tsx`
- **Дубликат**: `src/components/experts/MarketplaceExpertCard/MarketplaceExpertCard.tsx`
- **Статус**: 🔄 Планируется
- **Различия**:
  - Отображение blockchain информации
  - Кнопка "Start Tokenized Chat"
  - Интеграция с token balances
- **Причина дублирования**: Разная функциональность и UI

#### MarketplaceExpertGrid

- **Оригинал**: `src/components/experts/ExpertSelectionGrid/ExpertSelectionGrid.tsx`
- **Дубликат**: `src/components/experts/MarketplaceExpertGrid/MarketplaceExpertGrid.tsx`
- **Статус**: 🔄 Планируется
- **Различия**:
  - Использует MarketplaceExpertCard
  - Интегрирован с blockchain состоянием
- **Причина дублирования**: Разные дочерние компоненты

### 2. Chat Components

#### MarketplaceTokenizedChatInterface

- **Оригинал**: `src/components/chat/TokenizedChatInterface.tsx`
- **Дубликат**: `src/components/chat/MarketplaceTokenizedChatInterface/MarketplaceTokenizedChatInterface.tsx`
- **Статус**: ✅ Готов
- **Различия**:
  - Работает с marketplace данными (MarketplaceExpert)
  - Адаптирован для новых страниц чата
  - Интегрирован с marketplace hooks
  - Конвертация данных через marketplace-adapter
- **Причина дублирования**: Разные источники данных и контекст

### 3. Blockchain Components

#### MarketplaceWalletStatus

- **Оригинал**: Нет прямого аналога
- **Дубликат**: `src/components/marketplace/MarketplaceWalletStatus/MarketplaceWalletStatus.tsx`
- **Статус**: 🔄 Планируется
- **Различия**: Специфичен для главной страницы
- **Причина создания**: Уникальный компонент для marketplace

#### MarketplaceNetworkStatus

- **Оригинал**: Нет прямого аналога
- **Дубликат**: `src/components/marketplace/MarketplaceNetworkStatus/MarketplaceNetworkStatus.tsx`
- **Статус**: 🔄 Планируется
- **Различия**: Специфичен для главной страницы
- **Причина создания**: Уникальный компонент для marketplace

#### MarketplaceConnectionGuard

- **Оригинал**: Нет прямого аналога
- **Дубликат**: `src/components/marketplace/MarketplaceConnectionGuard/MarketplaceConnectionGuard.tsx`
- **Статус**: 🔄 Планируется
- **Различия**: Специфичен для главной страницы
- **Причина создания**: Уникальный компонент для marketplace

---

## Дубликаты hooks

### 1. Blockchain Hooks

#### useMarketplaceTokenizedChat

- **Оригинал**: `src/hooks/useTokenizedChat.ts`
- **Дубликат**: `src/hooks/useMarketplaceTokenizedChat.ts`
- **Статус**: 🔄 Планируется
- **Различия**:
  - Адаптирован для marketplace данных
  - Работает с `InvestmentExpert` типами
  - Интегрирован с marketplace API
- **Причина дублирования**: Разные типы данных и API endpoints

#### useMarketplaceContracts

- **Оригинал**: `src/hooks/useContracts.ts`
- **Дубликат**: `src/hooks/useMarketplaceContracts.ts`
- **Статус**: 🔄 Планируется
- **Различия**:
  - Адаптирован для marketplace контекста
  - Интегрирован с marketplace адаптерами
- **Причина дублирования**: Разный контекст использования

---

## Дубликаты страниц

### 1. Chat Pages

#### marketplace-chat/[expert]/[id]/page.tsx

- **Оригинал**: `src/app/chat/[expert]/[id]/page.tsx`
- **Дубликат**: `src/app/marketplace-chat/[expert]/[id]/page.tsx`
- **Статус**: 🔄 Планируется
- **Различия**:
  - Использует MarketplaceTokenizedChatInterface
  - Интегрирован с blockchain функциональностью
  - Разные URL patterns
- **Причина дублирования**: Разная функциональность (tokenized vs regular)

#### marketplace-chat/[expert]/[id]/layout.tsx

- **Оригинал**: `src/app/chat/[expert]/[id]/layout.tsx`
- **Дубликат**: `src/app/marketplace-chat/[expert]/[id]/layout.tsx`
- **Статус**: 🔄 Планируется
- **Различия**:
  - Адаптирован для marketplace чатов
  - Интегрирован с blockchain providers
- **Причина дублирования**: Разные требования к layout

---

## Дубликаты API endpoints

### 1. Marketplace API

#### api/marketplace/experts/route.ts

- **Оригинал**: `src/app/api/experts/route.ts`
- **Дубликат**: `src/app/api/marketplace/experts/route.ts`
- **Статус**: 🔄 Планируется
- **Различия**:
  - Адаптирован для marketplace контекста
  - Интегрирован с blockchain данными
- **Причина дублирования**: Разные требования к данным

#### api/marketplace/chats/route.ts

- **Оригинал**: `src/app/api/chats/route.ts`
- **Дубликат**: `src/app/api/marketplace/chats/route.ts`
- **Статус**: 🔄 Планируется
- **Различия**:
  - Поддержка marketplace-специфичных параметров
  - Интеграция с blockchain операциями
- **Причина дублирования**: Разная бизнес-логика

#### api/marketplace/chats/[id]/route.ts

- **Оригинал**: `src/app/api/chats/[id]/route.ts`
- **Дубликат**: `src/app/api/marketplace/chats/[id]/route.ts`
- **Статус**: 🔄 Планируется
- **Различия**: Адаптирован для marketplace чатов
- **Причина дублирования**: Разные требования к данным

#### api/marketplace/chats/[id]/messages/route.ts

- **Оригинал**: `src/app/api/chats/[id]/messages/route.ts`
- **Дубликат**: `src/app/api/marketplace/chats/[id]/messages/route.ts`
- **Статус**: 🔄 Планируется
- **Различия**:
  - Интеграция с blockchain транзакциями
  - Поддержка marketplace metadata
- **Причина дублирования**: Разная обработка сообщений

---

## Дубликаты утилит

### 1. Data Adapters

#### marketplace-adapter.ts

- **Оригинал**: `src/lib/expert-adapter.ts`
- **Дубликат**: `src/lib/marketplace-adapter.ts`
- **Статус**: ✅ Готов
- **Различия**:
  - Конвертация `InvestmentExpert` → `ExpertInfo`
  - Marketplace-специфичные трансформации
- **Причина дублирования**: Разные типы данных

---

## Дубликаты типов

### 1. Marketplace Types

#### marketplace.ts

- **Оригинал**: `src/types/contracts.ts`, `src/types/expert.ts`
- **Дубликат**: `src/types/marketplace.ts`
- **Статус**: ✅ Готов
- **Различия**:
  - Marketplace-специфичные интерфейсы
  - Адаптеры типов
- **Причина создания**: Специфичные требования к типам

---

## План рефакторинга (для будущего)

### Этап 1: Анализ дубликатов

- [ ] Проанализировать все созданные дубликаты
- [ ] Выявить общую функциональность
- [ ] Определить возможности для объединения

### Этап 2: Создание базовых компонентов

- [ ] Создать базовые компоненты с props для кастомизации
- [ ] Выделить общие hooks и утилиты
- [ ] Создать единые API endpoints с параметрами

### Этап 3: Миграция

- [ ] Постепенно заменить дубликаты на базовые компоненты
- [ ] Обновить все импорты и зависимости
- [ ] Удалить неиспользуемые файлы

### Этап 4: Тестирование

- [ ] Протестировать все функциональности
- [ ] Убедиться в сохранении работоспособности
- [ ] Обновить документацию

---

## Статусы

- 🔄 **Планируется** - Компонент запланирован к созданию
- ⚠️ **В разработке** - Компонент в процессе создания
- ✅ **Готов** - Компонент создан и протестирован
- 🔧 **Требует доработки** - Компонент нуждается в изменениях
- ❌ **Отменен** - Компонент не будет создан

---

## Примечания

1. **Приоритет**: Сохранение работоспособности tokenized-chat
2. **Качество**: Все дубликаты должны соответствовать development_guidelines.md
3. **Документация**: Каждый дубликат должен быть задокументирован
4. **Тестирование**: Все дубликаты должны быть протестированы
5. **Рефакторинг**: После завершения проекта провести анализ для объединения

Этот реестр поможет отслеживать все создаваемые дубликаты и планировать их будущее объединение.
