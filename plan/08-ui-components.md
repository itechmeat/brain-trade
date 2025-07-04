# Этап 8: UI компоненты для чатов

## Создание интерфейса для чатов с несколькими экспертами

### Шаг 8.1: Компонент селектора экспертов
- [ ] Создать `src/components/ExpertSelector/`:
  - `ExpertSelector.tsx` - основной компонент
  - `ExpertSelector.module.scss` - стили
- [ ] Функциональность:
  - Отображение доступных экспертов с аватарами
  - Множественный выбор экспертов
  - Поиск и фильтрация экспертов
  - Индикация выбранных экспертов

### Шаг 8.2: Компонент чата с множественными экспертами
- [ ] Создать `src/components/ChatInterface/`:
  - `ChatInterface.tsx` - основной интерфейс чата
  - `ChatInterface.module.scss` - стили
  - `MessagesList.tsx` - список сообщений
  - `ChatInput.tsx` - поле ввода сообщений
- [ ] Функциональность:
  - Отображение сообщений от разных экспертов
  - Различение сообщений по экспертам (цвета, аватары)
  - Индикация набора текста от экспертов
  - Поддержка markdown в сообщениях

### Шаг 8.3: Компонент сообщения
- [ ] Создать `src/components/ChatMessage/`:
  - `ChatMessage.tsx` - отдельное сообщение
  - `ChatMessage.module.scss` - стили
  - `ExpertAvatar.tsx` - аватар эксперта
  - `MessageContent.tsx` - контент сообщения
- [ ] Функциональность:
  - Отображение автора сообщения
  - Timestamp сообщений
  - Метаданные (модель, время обработки)
  - Действия с сообщением (копировать, лайк/дизлайк)

### Шаг 8.4: Компонент карточки эксперта
- [ ] Создать `src/components/ExpertCard/`:
  - `ExpertCard.tsx` - карточка эксперта
  - `ExpertCard.module.scss` - стили
- [ ] Функциональность:
  - Аватар и имя эксперта
  - Описание экспертизы
  - Статус активности
  - Выбор/отмена выбора эксперта

### Шаг 8.5: Компонент панели экспертов
- [ ] Создать `src/components/ExpertsPanel/`:
  - `ExpertsPanel.tsx` - боковая панель с экспертами
  - `ExpertsPanel.module.scss` - стили
  - `ActiveExperts.tsx` - активные эксперты в чате
- [ ] Функциональность:
  - Список выбранных экспертов
  - Возможность добавления/удаления экспертов
  - Индикация статуса каждого эксперта

### Шаг 8.6: Компонент списка чатов
- [ ] Создать `src/components/ChatsList/`:
  - `ChatsList.tsx` - список всех чатов
  - `ChatsList.module.scss` - стили
  - `ChatPreview.tsx` - превью чата
- [ ] Функциональность:
  - Отображение истории чатов
  - Превью последнего сообщения
  - Участники чата (эксперты)
  - Создание нового чата

### Шаг 8.7: Компонент настроек чата
- [ ] Создать `src/components/ChatSettings/`:
  - `ChatSettings.tsx` - настройки чата
  - `ChatSettings.module.scss` - стили
  - `ModelSelector.tsx` - выбор модели AI
- [ ] Функциональность:
  - Выбор LLM модели для каждого эксперта
  - Настройки RAG (включить/выключить)
  - Параметры генерации (температура, max tokens)

### Шаг 8.8: Компонент индикаторов загрузки
- [ ] Создать `src/components/LoadingIndicators/`:
  - `TypingIndicator.tsx` - индикатор набора текста
  - `ProcessingSpinner.tsx` - спиннер обработки
  - `ExpertThinking.tsx` - индикация "эксперт думает"
- [ ] Функциональность:
  - Анимированные индикаторы для каждого эксперта
  - Различные состояния загрузки
  - Красивые анимации

### Шаг 8.9: Компонент RAG источников
- [ ] Создать `src/components/RAGSources/`:
  - `RAGSources.tsx` - отображение источников
  - `RAGSources.module.scss` - стили
  - `SourceCard.tsx` - карточка источника
- [ ] Функциональность:
  - Показ релевантных источников для ответа
  - Ссылки на источники
  - Оценка релевантности

### Шаг 8.10: Главный layout приложения
- [ ] Создать `src/components/Layout/`:
  - `AppLayout.tsx` - основной layout
  - `AppLayout.module.scss` - стили
  - `Header.tsx` - шапка приложения
  - `Sidebar.tsx` - боковая панель
- [ ] Функциональность:
  - Responsive дизайн
  - Навигация между разделами
  - Мобильная адаптация

### Шаг 8.11: Модальные окна и диалоги
- [ ] Создать `src/components/Modals/`:
  - `ConfirmDialog.tsx` - диалог подтверждения
  - `ExpertInfoModal.tsx` - информация об эксперте
  - `ChatSettingsModal.tsx` - настройки чата
- [ ] Функциональность:
  - Overlay с затемнением
  - Анимации появления/исчезновения
  - Управление с клавиатуры

### Шаг 8.12: Компоненты уведомлений
- [ ] Создать `src/components/Notifications/`:
  - `Toast.tsx` - всплывающие уведомления
  - `ErrorBoundary.tsx` - обработка ошибок
- [ ] Интеграция с Radix UI Toast
- [ ] Различные типы уведомлений (success, error, info)

### Шаг 8.13: Обновление индексного файла компонентов
- [ ] Обновить `src/components/index.ts`:
  ```typescript
  export { default as ExpertSelector } from './ExpertSelector/ExpertSelector';
  export { default as ChatInterface } from './ChatInterface/ChatInterface';
  export { default as ChatMessage } from './ChatMessage/ChatMessage';
  export { default as ExpertCard } from './ExpertCard/ExpertCard';
  export { default as ExpertsPanel } from './ExpertsPanel/ExpertsPanel';
  export { default as ChatsList } from './ChatsList/ChatsList';
  export { default as ChatSettings } from './ChatSettings/ChatSettings';
  export { default as AppLayout } from './Layout/AppLayout';
  // ... остальные экспорты
  ```

## Результат этапа
После завершения этого этапа у вас будет:
- ✅ Полный набор UI компонентов для чатов
- ✅ Селектор экспертов с множественным выбором
- ✅ Интерфейс чата с поддержкой множественных экспертов
- ✅ Компоненты для отображения сообщений и статусов
- ✅ Панель управления экспертами
- ✅ Настройки чата и выбор моделей
- ✅ Индикаторы загрузки и уведомления
- ✅ Responsive дизайн для всех устройств