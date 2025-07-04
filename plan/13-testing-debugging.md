# Этап 13: Тестирование и отладка

## Создание тестов и отладочных скриптов

### Шаг 13.1: Настройка тестового окружения
- [ ] Установить тестовые зависимости:
  ```bash
  npm install -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event
  npm install -D jest-environment-jsdom @types/jest
  ```
- [ ] Создать `jest.config.js`:
  ```javascript
  const nextJest = require('next/jest')
  
  const createJestConfig = nextJest({
    dir: './',
  })
  
  const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testEnvironment: 'jest-environment-jsdom',
  }
  
  module.exports = createJestConfig(customJestConfig)
  ```

### Шаг 13.2: Unit тесты для утилит
- [ ] Создать `src/utils/__tests__/` структуру:
  - `api.test.ts` - тесты API утилит
  - `formatters.test.ts` - тесты форматирования
  - `chat-utils.test.ts` - тесты чат-утилит
  - `experts-utils.test.ts` - тесты экспертов
  - `validation.test.ts` - тесты валидации

### Шаг 13.3: Тесты компонентов
- [ ] Создать тесты для основных компонентов:
  ```typescript
  // src/components/__tests__/ExpertCard.test.tsx
  import { render, screen, fireEvent } from '@testing-library/react';
  import ExpertCard from '../ExpertCard/ExpertCard';
  
  describe('ExpertCard', () => {
    const mockExpert = {
      id: 'test-expert',
      name: 'Test Expert',
      avatar: '/test.jpg',
      expertise: ['Testing'],
      description: 'Test description'
    };
  
    it('renders expert information correctly', () => {
      render(<ExpertCard expert={mockExpert} isSelected={false} onToggle={() => {}} />);
      expect(screen.getByText('Test Expert')).toBeInTheDocument();
    });
  
    it('calls onToggle when clicked', () => {
      const mockToggle = jest.fn();
      render(<ExpertCard expert={mockExpert} isSelected={false} onToggle={mockToggle} />);
      fireEvent.click(screen.getByRole('button'));
      expect(mockToggle).toHaveBeenCalledWith('test-expert');
    });
  });
  ```

### Шаг 13.4: Тесты хуков
- [ ] Создать тесты для React хуков:
  ```typescript
  // src/hooks/__tests__/useChats.test.ts
  import { renderHook, waitFor } from '@testing-library/react';
  import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
  import useChats from '../useChats';
  
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
    return ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
  
  describe('useChats', () => {
    it('loads chats correctly', async () => {
      const { result } = renderHook(() => useChats(), {
        wrapper: createWrapper()
      });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });
  ```

### Шаг 13.5: Интеграционные тесты API
- [ ] Создать тесты для API эндпоинтов:
  ```typescript
  // src/app/api/__tests__/chats.test.ts
  import { createMocks } from 'node-mocks-http';
  import handler from '../chats/route';
  
  describe('/api/chats', () => {
    it('returns chats list', async () => {
      const { req, res } = createMocks({ method: 'GET' });
      
      await handler(req, res);
      
      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(Array.isArray(data.chats)).toBe(true);
    });
  });
  ```

### Шаг 13.6: Тесты для провайдеров состояния
- [ ] Создать тесты для Context провайдеров:
  ```typescript
  // src/providers/__tests__/ChatProvider.test.tsx
  import { render, screen, fireEvent } from '@testing-library/react';
  import { ChatProvider, useChatContext } from '../ChatProvider';
  
  const TestComponent = () => {
    const { messages, sendMessage } = useChatContext();
    return (
      <div>
        <div data-testid="messages-count">{messages.length}</div>
        <button onClick={() => sendMessage('test')}>Send</button>
      </div>
    );
  };
  
  describe('ChatProvider', () => {
    it('provides chat context correctly', () => {
      render(
        <ChatProvider>
          <TestComponent />
        </ChatProvider>
      );
      
      expect(screen.getByTestId('messages-count')).toHaveTextContent('0');
    });
  });
  ```

### Шаг 13.7: E2E тесты с Playwright
- [ ] Установить Playwright:
  ```bash
  npm install -D @playwright/test
  npx playwright install
  ```
- [ ] Создать `playwright.config.ts`:
  ```typescript
  import { defineConfig } from '@playwright/test';
  
  export default defineConfig({
    testDir: './e2e',
    use: {
      baseURL: 'http://localhost:3100',
    },
    webServer: {
      command: 'npm run dev',
      port: 3100,
    },
  });
  ```

### Шаг 13.8: E2E тесты сценариев
- [ ] Создать E2E тесты:
  ```typescript
  // e2e/chat-flow.spec.ts
  import { test, expect } from '@playwright/test';
  
  test('user can create chat with experts', async ({ page }) => {
    await page.goto('/');
    
    // Выбрать экспертов
    await page.click('[data-testid="expert-business-analyst"]');
    await page.click('[data-testid="expert-tech-lead"]');
    
    // Отправить сообщение
    await page.fill('[data-testid="chat-input"]', 'Hello experts!');
    await page.click('[data-testid="send-button"]');
    
    // Проверить ответы
    await expect(page.locator('[data-testid="message"]')).toHaveCount(3); // user + 2 experts
  });
  ```

### Шаг 13.9: Отладочные скрипты
- [ ] Создать отладочные скрипты в корне проекта:
  ```javascript
  // debug-experts.js
  const { getAvailableExperts } = require('./src/lib/experts/experts-loader');
  
  async function debugExperts() {
    try {
      const experts = await getAvailableExperts();
      console.log('Available experts:', experts.length);
      experts.forEach(expert => {
        console.log(`- ${expert.name} (${expert.id})`);
      });
    } catch (error) {
      console.error('Error loading experts:', error);
    }
  }
  
  debugExperts();
  ```

### Шаг 13.10: Тестирование RAG системы
- [ ] Создать специальные тесты для RAG:
  ```javascript
  // test-rag-integration.js
  const { RAGAnalyzer } = require('./src/lib/rag/rag-analyzer');
  
  async function testRAGSystem() {
    const analyzer = new RAGAnalyzer();
    
    // Тест поиска
    const results = await analyzer.search('startup funding', {
      expertIds: ['business_analyst'],
      limit: 5
    });
    
    console.log('RAG search results:', results.sources.length);
    results.sources.forEach((source, i) => {
      console.log(`${i + 1}. Score: ${source.score}, Content: ${source.content.substring(0, 100)}...`);
    });
  }
  
  testRAGSystem();
  ```

### Шаг 13.11: Performance тесты
- [ ] Создать тесты производительности:
  ```typescript
  // src/__tests__/performance.test.ts
  import { performance } from 'perf_hooks';
  
  describe('Performance Tests', () => {
    it('chat message processing should be fast', async () => {
      const start = performance.now();
      
      // Симуляция обработки сообщения
      await processChatMessage('test message');
      
      const end = performance.now();
      expect(end - start).toBeLessThan(1000); // меньше 1 секунды
    });
  });
  ```

### Шаг 13.12: Тестирование accessibility
- [ ] Установить axe-core для a11y тестов:
  ```bash
  npm install -D @axe-core/react jest-axe
  ```
- [ ] Создать accessibility тесты:
  ```typescript
  // src/components/__tests__/accessibility.test.tsx
  import { render } from '@testing-library/react';
  import { axe, toHaveNoViolations } from 'jest-axe';
  import ExpertCard from '../ExpertCard/ExpertCard';
  
  expect.extend(toHaveNoViolations);
  
  describe('Accessibility', () => {
    it('ExpertCard should not have accessibility violations', async () => {
      const { container } = render(<ExpertCard {...mockProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
  ```

### Шаг 13.13: Создание тестовых данных
- [ ] Создать моковые данные:
  ```typescript
  // src/__tests__/mocks/experts.ts
  export const mockExperts = [
    {
      id: 'business_analyst',
      name: 'Business Analyst',
      avatar: '/experts/business-analyst.jpg',
      expertise: ['Business Analysis', 'Requirements'],
      description: 'Expert in business analysis'
    }
  ];
  
  // src/__tests__/mocks/api.ts
  import { rest } from 'msw';
  
  export const handlers = [
    rest.get('/api/experts', (req, res, ctx) => {
      return res(ctx.json({ experts: mockExperts }));
    }),
  ];
  ```

### Шаг 13.14: Настройка CI/CD для тестов
- [ ] Создать GitHub Actions workflow:
  ```yaml
  # .github/workflows/test.yml
  name: Tests
  
  on: [push, pull_request]
  
  jobs:
    test:
      runs-on: ubuntu-latest
      
      steps:
        - uses: actions/checkout@v3
        - uses: actions/setup-node@v3
          with:
            node-version: '18'
            
        - run: npm ci
        - run: npm run test
        - run: npm run test:e2e
  ```

### Шаг 13.15: Покрытие кода тестами
- [ ] Настроить coverage reporting:
  ```bash
  npm install -D @istanbuljs/nyc-config-typescript
  ```
- [ ] Добавить в `package.json`:
  ```json
  {
    "scripts": {
      "test:coverage": "jest --coverage",
      "test:watch": "jest --watch"
    }
  }
  ```

## Результат этапа
После завершения этого этапа у вас будет:
- ✅ Полная настройка тестового окружения
- ✅ Unit тесты для всех утилит и компонентов
- ✅ Интеграционные тесты для API
- ✅ E2E тесты для основных пользовательских сценариев
- ✅ Отладочные скрипты для разработки
- ✅ Performance и accessibility тесты
- ✅ CI/CD pipeline для автоматического тестирования
- ✅ Покрытие кода тестами и отчеты