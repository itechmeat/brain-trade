# Этап 12: Стили и UI/UX

## Создание стилей и настройка пользовательского интерфейса

### Шаг 12.1: Настройка глобальных стилей
- [ ] Обновить `src/app/globals.css`:
  - CSS переменные для цветовой палитры
  - Базовые стили для типографики
  - Responsive breakpoints
  - CSS Grid и Flexbox utilities

### Шаг 12.2: Интеграция с Radix UI Themes
- [ ] Настроить Radix UI Theme в `src/app/layout.tsx`:
  ```typescript
  import { Theme } from '@radix-ui/themes';
  
  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="ru">
        <body>
          <Theme appearance="light" accentColor="blue" grayColor="slate">
            {children}
          </Theme>
        </body>
      </html>
    );
  }
  ```

### Шаг 12.3: Создание дизайн-системы
- [ ] Создать `src/styles/` структуру:
  - `variables.scss` - SCSS переменные
  - `mixins.scss` - SCSS миксины
  - `components.scss` - базовые стили компонентов
  - `utilities.scss` - utility классы

### Шаг 12.4: Стили для чат-интерфейса
- [ ] Создать стили для основных компонентов чата:
  ```scss
  // Чат-контейнер
  .chat-container {
    display: grid;
    grid-template-columns: 300px 1fr 250px;
    height: 100vh;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
  
  // Сообщения
  .message {
    padding: 12px 16px;
    margin: 8px 0;
    border-radius: 8px;
    
    &--user {
      background: var(--accent-color);
      color: white;
      margin-left: auto;
      max-width: 80%;
    }
    
    &--expert {
      background: var(--gray-2);
      max-width: 80%;
    }
  }
  ```

### Шаг 12.5: Стили для экспертов
- [ ] Создать стили для компонентов экспертов:
  ```scss
  .expert-card {
    padding: 16px;
    border: 1px solid var(--gray-6);
    border-radius: 8px;
    transition: all 0.2s ease;
    
    &:hover {
      border-color: var(--accent-color);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    &--selected {
      border-color: var(--accent-color);
      background: var(--accent-2);
    }
  }
  
  .expert-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }
  ```

### Шаг 12.6: Анимации и переходы
- [ ] Создать `src/styles/animations.scss`:
  ```scss
  // Анимация появления сообщений
  @keyframes messageSlideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  // Индикатор набора текста
  @keyframes typingDots {
    0%, 60%, 100% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-10px);
    }
  }
  
  // Пульсация для загрузки
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  ```

### Шаг 12.7: Responsive дизайн
- [ ] Создать адаптивные стили для всех устройств:
  ```scss
  // Мобильные устройства
  @media (max-width: 768px) {
    .chat-container {
      grid-template-columns: 1fr;
    }
    
    .expert-selector {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      border-top: 1px solid var(--gray-6);
    }
  }
  
  // Планшеты
  @media (min-width: 769px) and (max-width: 1024px) {
    .chat-container {
      grid-template-columns: 250px 1fr;
    }
  }
  ```

### Шаг 12.8: Темная тема
- [ ] Добавить поддержку темной темы:
  ```scss
  [data-theme="dark"] {
    --background: #0d1117;
    --text-primary: #f0f6fc;
    --text-secondary: #8b949e;
    --border: #30363d;
    --surface: #161b22;
  }
  
  .theme-toggle {
    background: none;
    border: 1px solid var(--border);
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
  }
  ```

### Шаг 12.9: Стили для состояний загрузки
- [ ] Создать стили для различных состояний:
  ```scss
  .loading-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid var(--gray-6);
    border-top-color: var(--accent-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  .typing-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
    
    .dot {
      width: 8px;
      height: 8px;
      background: var(--gray-9);
      border-radius: 50%;
      animation: typingDots 1.4s infinite;
      
      &:nth-child(2) { animation-delay: 0.2s; }
      &:nth-child(3) { animation-delay: 0.4s; }
    }
  }
  ```

### Шаг 12.10: Стили для уведомлений и модальных окон
- [ ] Создать стили для Toast уведомлений:
  ```scss
  .toast {
    padding: 12px 16px;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    animation: messageSlideIn 0.3s ease;
    
    &--success {
      background: var(--green-3);
      border-left: 4px solid var(--green-9);
    }
    
    &--error {
      background: var(--red-3);
      border-left: 4px solid var(--red-9);
    }
  }
  
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  ```

### Шаг 12.11: Кастомизация скроллбаров
- [ ] Создать красивые скроллбары:
  ```scss
  .custom-scrollbar {
    &::-webkit-scrollbar {
      width: 8px;
    }
    
    &::-webkit-scrollbar-track {
      background: var(--gray-3);
      border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: var(--gray-8);
      border-radius: 4px;
      
      &:hover {
        background: var(--gray-9);
      }
    }
  }
  ```

### Шаг 12.12: Стили для markdown контента
- [ ] Создать стили для отображения markdown:
  ```scss
  .markdown-content {
    line-height: 1.6;
    
    h1, h2, h3 {
      margin: 16px 0 8px 0;
      color: var(--text-primary);
    }
    
    code {
      background: var(--gray-3);
      padding: 2px 4px;
      border-radius: 3px;
      font-family: 'Monaco', 'Menlo', monospace;
    }
    
    pre {
      background: var(--gray-2);
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
    }
    
    blockquote {
      border-left: 4px solid var(--accent-color);
      padding-left: 16px;
      margin: 16px 0;
      color: var(--text-secondary);
    }
  }
  ```

### Шаг 12.13: Утилитарные классы
- [ ] Создать полезные utility классы:
  ```scss
  // Spacing
  .mt-1 { margin-top: 4px; }
  .mt-2 { margin-top: 8px; }
  .mt-3 { margin-top: 12px; }
  .mt-4 { margin-top: 16px; }
  
  // Flexbox
  .flex { display: flex; }
  .flex-col { flex-direction: column; }
  .items-center { align-items: center; }
  .justify-between { justify-content: space-between; }
  
  // Text
  .text-sm { font-size: 14px; }
  .text-lg { font-size: 18px; }
  .font-medium { font-weight: 500; }
  .font-bold { font-weight: 700; }
  ```

### Шаг 12.14: Оптимизация производительности CSS
- [ ] Настроить critical CSS
- [ ] Минимизировать размер CSS bundle
- [ ] Использовать CSS containment где возможно
- [ ] Оптимизировать анимации для 60fps

### Шаг 12.15: Проверка доступности (a11y)
- [ ] Добавить focus states для всех интерактивных элементов
- [ ] Проверить контрастность цветов
- [ ] Добавить ARIA атрибуты
- [ ] Поддержка навигации с клавиатуры

## Результат этапа
После завершения этого этапа у вас будет:
- ✅ Полная дизайн-система с едиными стилями
- ✅ Адаптивный дизайн для всех устройств
- ✅ Красивые анимации и переходы
- ✅ Поддержка темной темы
- ✅ Стили для всех состояний интерфейса
- ✅ Оптимизированная производительность CSS
- ✅ Соответствие стандартам доступности