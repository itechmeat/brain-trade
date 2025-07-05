# План реализации блокчейнового маркетплейса экспертов

## Обзор проекта

Текущее состояние:

- ✅ Главная страница с маркетплейсом экспертов (С БЛОКЧЕЙНОМ!)
- ✅ Страница tokenized-chat с полной блокчейн функциональностью
- ✅ Обычные чаты экспертов `/chat/[expert]/[id]`
- ✅ Marketplace чаты экспертов `/marketplace-chat/[expert]/[id]`
- ✅ Отображение реальных балансов токенов на главной странице
- ✅ Интеграция с существующей блокчейн инфраструктурой

**Цель**: ✅ ДОСТИГНУТА! Блокчейн функциональность успешно интегрирована в главную страницу без нарушения работы tokenized-chat.

## Архитектурные принципы

### 1. Дублирование компонентов

- **ЗАПРЕЩЕНО**: Редактировать существующие компоненты tokenized-chat
- **ОБЯЗАТЕЛЬНО**: Создавать новые версии компонентов для главной страницы
- **ОБЯЗАТЕЛЬНО**: Вести файл-библиотеку дубликатов для последующей очистки

### 2. Соблюдение development_guidelines.md

- Использовать единообразную структуру API
- Применять базовые обработчики API
- Следовать принципам DRY через утилиты
- Типизировать все компоненты

### 3. Поэтапная реализация

- Небольшие итерации с возможностью тестирования
- Сохранение работоспособности существующего функционала
- Постепенная интеграция блокчейн компонентов

---

## ✅ Фаза 1: Подготовка и анализ архитектуры (ЗАВЕРШЕНА)

### Задача 1.1: Создание файла-библиотеки дубликатов

- [x] Создать `docs/component_duplicates_registry.md`
- [x] Определить стратегию именования дубликатов
- [x] Задокументировать все будущие дубликаты

### Задача 1.2: Анализ компонентов для дублирования

- [x] Проанализировать `TokenizedChatInterface`
- [x] Проанализировать `ExpertSelector`
- [x] Проанализировать blockchain hooks (`useTokenizedChat`, `useContracts`)
- [x] Определить какие компоненты можно переиспользовать

### Задача 1.3: Создание типов для главной страницы

- [x] Создать `src/types/marketplace.ts`
- [x] Определить интерфейсы для marketplace-специфичных типов
- [x] Создать адаптеры между `InvestmentExpert` и `ExpertInfo`

---

## ✅ Фаза 2: Создание базовых компонентов маркетплейса (ЗАВЕРШЕНА)

### Задача 2.1: Дублирование ExpertSelector

- [x] Создать `src/components/experts/MarketplaceExpertSelector/`
- [x] Создать `MarketplaceExpertSelector.tsx`
- [x] Создать `MarketplaceExpertSelector.module.scss`
- [x] Адаптировать для работы с `InvestmentExpert[]`
- [x] Интегрировать с blockchain hooks

### Задача 2.2: Создание компонента MarketplaceExpertCard

- [x] Создать карточки экспертов внутри MarketplaceExpertSelector
- [x] Добавить отображение токен балансов
- [x] Добавить тикеры токенов
- [x] Добавить стоимость сообщений
- [x] Добавить иконки монеток

### Задача 2.3: Интеграция с главной страницей

- [x] Интегрировать MarketplaceExpertSelector в главную страницу
- [x] Заменить ExpertSelectionGrid на MarketplaceExpertSelector
- [x] Сохранить responsive дизайн
- [x] Добавить белый фон карточек

---

## ✅ Фаза 3: Интеграция blockchain функциональности (ЗАВЕРШЕНА)

### Задача 3.1: Интеграция существующих hooks

- [x] Использовать существующие useContracts и useTokenBalances
- [x] Адаптировать для работы с главной страницей
- [x] Обеспечить совместимость с существующими hooks
- [x] Загрузка реальных блокчейн экспертов и балансов

### Задача 3.2: Создание адаптеров данных

- [x] Создать `src/lib/marketplace-adapter.ts`
- [x] Функции конвертации `InvestmentExpert` → `ExpertInfo`
- [x] Функции конвертации данных для blockchain
- [x] Утилиты для работы с токенами

### Задача 3.3: Интеграция Privy в главную страницу

- [x] Главная страница уже использует PrivyProvider
- [x] Wallet connection работает через существующую систему
- [x] Проверка сети интегрирована
- [x] Отображение реальных балансов токенов

---

## ✅ Фаза 4: Создание tokenized chat для главной страницы (ЗАВЕРШЕНА)

### Задача 4.1: Создание MarketplaceTokenizedChatInterface

- [x] Создать `src/components/chat/MarketplaceTokenizedChatInterface/`
- [x] Создать `MarketplaceTokenizedChatInterface.tsx`
- [x] Создать `MarketplaceTokenizedChatInterface.module.scss`
- [x] Адаптировать для работы с marketplace данными

### Задача 4.2: Создание новых страниц чата

- [x] Создать `src/app/marketplace-chat/[expert]/[id]/page.tsx`
- [x] Создать `src/app/marketplace-chat/[expert]/[id]/layout.tsx`
- [x] Создать соответствующие стили
- [x] Интегрировать MarketplaceTokenizedChatInterface

### Задача 4.3: Обновление маршрутизации

- [x] Обновить `handleExpertSelect` в `src/app/page.tsx`
- [x] Направлять на `/marketplace-chat/[expert]/[id]`
- [x] Обеспечить передачу необходимых параметров

---

## Фаза 5: API endpoints для marketplace

### Задача 5.1: Создание marketplace API endpoints

- [ ] Создать `src/app/api/marketplace/experts/route.ts`
- [ ] Создать `src/app/api/marketplace/chats/route.ts`
- [ ] Создать `src/app/api/marketplace/chats/[id]/route.ts`
- [ ] Создать `src/app/api/marketplace/chats/[id]/messages/route.ts`

### Задача 5.2: Адаптация существующих API

- [ ] Создать middleware для marketplace requests
- [ ] Обеспечить совместимость с tokenized-chat API
- [ ] Добавить поддержку marketplace-специфичных параметров

---

## Фаза 6: UI/UX интеграция

### Задача 6.1: Обновление главной страницы

- [ ] Интегрировать wallet connection
- [ ] Добавить переключатель между режимами
- [ ] Добавить отображение токен балансов
- [ ] Сохранить существующий дизайн

### Задача 6.2: Создание компонентов состояния

- [ ] Создать `MarketplaceWalletStatus`
- [ ] Создать `MarketplaceNetworkStatus`
- [ ] Создать `MarketplaceTokenBalance`
- [ ] Создать `MarketplaceConnectionGuard`

### Задача 6.3: Адаптация существующих UI компонентов

- [ ] Создать marketplace версии Button, Card, Dialog
- [ ] Обеспечить консистентность дизайна
- [ ] Добавить marketplace-специфичные стили

---

## Фаза 7: Тестирование и оптимизация

### Задача 7.1: Функциональное тестирование

- [ ] Тестирование wallet connection
- [ ] Тестирование expert selection
- [ ] Тестирование tokenized chat flow
- [ ] Тестирование token purchase

### Задача 7.2: Интеграционное тестирование

- [ ] Проверка совместимости с tokenized-chat
- [ ] Проверка API endpoints
- [ ] Проверка blockchain interactions
- [ ] Проверка error handling

### Задача 7.3: Performance оптимизация

- [ ] Оптимизация загрузки компонентов
- [ ] Кэширование blockchain данных
- [ ] Оптимизация re-renders
- [ ] Lazy loading для тяжелых компонентов

---

## Фаза 8: Финализация и документация

### Задача 8.1: Код cleanup

- [ ] Удаление неиспользуемого кода
- [ ] Оптимизация imports
- [ ] Консистентность naming conventions
- [ ] Добавление JSDoc комментариев

### Задача 8.2: Обновление документации

- [ ] Обновить README.md
- [ ] Создать marketplace user guide
- [ ] Документировать API endpoints
- [ ] Создать troubleshooting guide

### Задача 8.3: Подготовка к деплою

- [ ] Проверка environment variables
- [ ] Тестирование в production-like окружении
- [ ] Создание deployment checklist
- [ ] Настройка monitoring

---

## Структура файлов после реализации

```
src/
├── app/
│   ├── page.tsx                                    # Обновленная главная страница
│   ├── marketplace-chat/
│   │   └── [expert]/
│   │       └── [id]/
│   │           ├── page.tsx                        # Новая страница чата
│   │           └── layout.tsx                      # Layout для чата
│   ├── api/
│   │   └── marketplace/                            # Новые API endpoints
│   │       ├── experts/
│   │       └── chats/
│   └── tokenized-chat/                             # Без изменений
├── components/
│   ├── experts/
│   │   ├── MarketplaceExpertSelector/              # Новый компонент
│   │   ├── MarketplaceExpertCard/                  # Новый компонент
│   │   ├── MarketplaceExpertGrid/                  # Новый компонент
│   │   └── ExpertSelector/                         # Без изменений
│   ├── chat/
│   │   ├── MarketplaceTokenizedChatInterface/      # Новый компонент
│   │   └── TokenizedChatInterface/                 # Без изменений
│   └── marketplace/                                # Новые компоненты
│       ├── MarketplaceWalletStatus/
│       ├── MarketplaceNetworkStatus/
│       └── MarketplaceConnectionGuard/
├── hooks/
│   ├── useMarketplaceTokenizedChat.ts              # Новый hook
│   ├── useMarketplaceContracts.ts                  # Новый hook
│   └── useTokenizedChat.ts                         # Без изменений
├── lib/
│   ├── marketplace-adapter.ts                      # Новый адаптер
│   └── expert-adapter.ts                           # Существующий
├── types/
│   └── marketplace.ts                              # Новые типы
└── docs/
    └── component_duplicates_registry.md            # Реестр дубликатов
```

---

## Критерии успеха

### Функциональные требования

- [ ] Главная страница поддерживает blockchain функциональность
- [ ] Сохранен существующий дизайн главной страницы
- [ ] tokenized-chat работает без изменений
- [ ] Все blockchain операции работают корректно

### Технические требования

- [ ] Код соответствует development_guidelines.md
- [ ] Нет дублирования логики между компонентами
- [ ] Все компоненты типизированы
- [ ] API endpoints следуют единой структуре

### Качественные требования

- [ ] Код легко поддерживается
- [ ] Компоненты переиспользуемы
- [ ] Производительность не ухудшилась
- [ ] Документация актуальна

---

## Риски и митигация

### Риск 1: Поломка tokenized-chat

**Митигация**: Строгое правило не редактировать существующие компоненты

### Риск 2: Дублирование кода

**Митигация**: Использование shared utilities и базовых компонентов

### Риск 3: Сложность интеграции

**Митигация**: Поэтапная реализация с тестированием на каждом этапе

### Риск 4: Производительность

**Митигация**: Lazy loading и мемоизация компонентов

---

## Примечания

1. **Приоритет**: Сохранение работоспособности tokenized-chat
2. **Качество**: Следование development guidelines обязательно
3. **Тестирование**: После каждой фазы проверка работоспособности
4. **Документация**: Ведение реестра дубликатов для будущего рефакторинга

Этот план обеспечивает безопасную интеграцию blockchain функциональности в главную страницу без нарушения существующего функционала.
