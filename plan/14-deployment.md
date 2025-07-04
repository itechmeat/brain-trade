# Этап 14: Деплой и конфигурация продакшена

## Настройка деплоя и продакшен конфигурации

### Шаг 14.1: Подготовка продакшен сборки
- [ ] Оптимизировать `next.config.ts` для продакшена:
  ```typescript
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    output: 'standalone',
    compress: true,
    poweredByHeader: false,
    experimental: {
      optimizeCss: true,
    },
    env: {
      CUSTOM_KEY: process.env.CUSTOM_KEY,
    },
    images: {
      domains: ['your-domain.com'],
      formats: ['image/webp', 'image/avif'],
    },
  };
  
  export default nextConfig;
  ```

### Шаг 14.2: Настройка переменных окружения для продакшена
- [ ] Создать `.env.production`:
  ```env
  # API Configuration
  NEXT_PUBLIC_API_URL=https://your-api.com
  NEXT_PUBLIC_APP_URL=https://your-app.com
  
  # LLM Services
  OPENAI_API_KEY=prod_openai_key
  ANTHROPIC_API_KEY=prod_anthropic_key
  GOOGLE_API_KEY=prod_google_key
  
  # Qdrant Configuration
  QDRANT_URL=https://your-qdrant-cluster.com
  QDRANT_API_KEY=prod_qdrant_key
  
  # Analytics
  NEXT_PUBLIC_GA_ID=GA_MEASUREMENT_ID
  SENTRY_DSN=https://your-sentry-dsn
  ```

### Шаг 14.3: Оптимизация производительности
- [ ] Добавить оптимизации в `package.json`:
  ```json
  {
    "scripts": {
      "build": "next build",
      "build:analyze": "ANALYZE=true next build",
      "start": "next start",
      "export": "next export"
    }
  }
  ```
- [ ] Установить bundle analyzer:
  ```bash
  npm install -D @next/bundle-analyzer
  ```

### Шаг 14.4: Настройка мониторинга и логирования
- [ ] Интегрировать Sentry для отслеживания ошибок:
  ```bash
  npm install @sentry/nextjs
  ```
- [ ] Создать `sentry.client.config.ts`:
  ```typescript
  import * as Sentry from "@sentry/nextjs";
  
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV,
  });
  ```

### Шаг 14.5: Настройка Docker
- [ ] Создать `Dockerfile`:
  ```dockerfile
  FROM node:18-alpine AS base
  
  # Dependencies
  FROM base AS deps
  RUN apk add --no-cache libc6-compat
  WORKDIR /app
  
  COPY package.json package-lock.json* ./
  RUN npm ci --only=production
  
  # Builder
  FROM base AS builder
  WORKDIR /app
  COPY --from=deps /app/node_modules ./node_modules
  COPY . .
  
  RUN npm run build
  
  # Runner
  FROM base AS runner
  WORKDIR /app
  
  ENV NODE_ENV production
  
  RUN addgroup --system --gid 1001 nodejs
  RUN adduser --system --uid 1001 nextjs
  
  COPY --from=builder /app/public ./public
  COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
  COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
  
  USER nextjs
  
  EXPOSE 3000
  
  ENV PORT 3000
  ENV HOSTNAME "0.0.0.0"
  
  CMD ["node", "server.js"]
  ```

### Шаг 14.6: Docker Compose для локальной разработки
- [ ] Создать `docker-compose.yml`:
  ```yaml
  version: '3.8'
  
  services:
    app:
      build: .
      ports:
        - "3000:3000"
      environment:
        - NODE_ENV=production
      env_file:
        - .env.production
      depends_on:
        - qdrant
  
    qdrant:
      image: qdrant/qdrant:latest
      ports:
        - "6333:6333"
      volumes:
        - qdrant_data:/qdrant/storage
  
  volumes:
    qdrant_data:
  ```

### Шаг 14.7: Настройка Vercel деплоя
- [ ] Создать `vercel.json`:
  ```json
  {
    "framework": "nextjs",
    "buildCommand": "npm run build",
    "devCommand": "npm run dev",
    "installCommand": "npm ci",
    "env": {
      "OPENAI_API_KEY": "@openai-api-key",
      "QDRANT_URL": "@qdrant-url",
      "QDRANT_API_KEY": "@qdrant-api-key"
    },
    "functions": {
      "src/app/api/**/*.ts": {
        "maxDuration": 30
      }
    }
  }
  ```

### Шаг 14.8: Конфигурация для AWS/Railway/Digital Ocean
- [ ] Создать конфигурации для различных платформ:
  ```yaml
  # railway.json
  {
    "build": {
      "builder": "NIXPACKS"
    },
    "deploy": {
      "startCommand": "npm start",
      "healthcheckPath": "/api/health"
    }
  }
  
  # app.yaml (Google Cloud)
  runtime: nodejs18
  env: standard
  
  env_variables:
    NODE_ENV: production
    OPENAI_API_KEY: "your-key"
  
  automatic_scaling:
    min_instances: 1
    max_instances: 10
  ```

### Шаг 14.9: CI/CD Pipeline
- [ ] Создать GitHub Actions для деплоя:
  ```yaml
  # .github/workflows/deploy.yml
  name: Deploy to Production
  
  on:
    push:
      branches: [main]
  
  jobs:
    deploy:
      runs-on: ubuntu-latest
      
      steps:
        - uses: actions/checkout@v3
        
        - name: Setup Node.js
          uses: actions/setup-node@v3
          with:
            node-version: '18'
            cache: 'npm'
            
        - name: Install dependencies
          run: npm ci
          
        - name: Run tests
          run: npm test
          
        - name: Build application
          run: npm run build
          
        - name: Deploy to Vercel
          uses: amondnet/vercel-action@v20
          with:
            vercel-token: ${{ secrets.VERCEL_TOKEN }}
            vercel-org-id: ${{ secrets.ORG_ID }}
            vercel-project-id: ${{ secrets.PROJECT_ID }}
            vercel-args: '--prod'
  ```

### Шаг 14.10: Health checks и мониторинг
- [ ] Создать health check эндпоинт:
  ```typescript
  // src/app/api/health/route.ts
  import { NextResponse } from 'next/server';
  
  export async function GET() {
    try {
      // Проверить подключения к внешним сервисам
      const checks = await Promise.all([
        checkQdrantConnection(),
        checkOpenAIConnection(),
      ]);
      
      const allHealthy = checks.every(check => check.healthy);
      
      return NextResponse.json({
        status: allHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        checks: checks
      }, {
        status: allHealthy ? 200 : 503
      });
    } catch (error) {
      return NextResponse.json({
        status: 'error',
        error: error.message
      }, { status: 500 });
    }
  }
  ```

### Шаг 14.11: Настройка CDN и кеширования
- [ ] Настроить правила кеширования:
  ```typescript
  // next.config.ts
  const nextConfig = {
    async headers() {
      return [
        {
          source: '/api/:path*',
          headers: [
            { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          ],
        },
        {
          source: '/static/:path*',
          headers: [
            { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          ],
        },
      ];
    },
  };
  ```

### Шаг 14.12: Безопасность в продакшене
- [ ] Добавить security headers:
  ```typescript
  // middleware.ts
  import { NextResponse } from 'next/server';
  import type { NextRequest } from 'next/server';
  
  export function middleware(request: NextRequest) {
    const response = NextResponse.next();
    
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    return response;
  }
  ```

### Шаг 14.13: Настройка аналитики
- [ ] Интегрировать Google Analytics:
  ```typescript
  // src/lib/analytics.ts
  export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;
  
  export const pageview = (url: string) => {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  };
  
  export const event = ({ action, category, label, value }) => {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  };
  ```

### Шаг 14.14: Database миграции и бэкапы
- [ ] Создать скрипты для управления данными:
  ```javascript
  // scripts/backup-qdrant.js
  const { QdrantClient } = require('@qdrant/js-client-rest');
  
  async function backupQdrant() {
    const client = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });
    
    // Создать snapshot коллекций
    const collections = await client.getCollections();
    for (const collection of collections.collections) {
      await client.createSnapshot(collection.name);
    }
  }
  
  backupQdrant();
  ```

### Шаг 14.15: Финальная проверка деплоя
- [ ] Создать checklist для проверки продакшена:
  ```markdown
  ## Production Deployment Checklist
  
  - [ ] Все переменные окружения настроены
  - [ ] SSL сертификаты активны
  - [ ] Health checks работают
  - [ ] Мониторинг настроен
  - [ ] Логирование функционирует
  - [ ] Бэкапы настроены
  - [ ] Security headers установлены
  - [ ] Performance оптимизирован
  - [ ] Analytics интегрирован
  - [ ] Error tracking активен
  ```

## Результат этапа
После завершения этого этапа у вас будет:
- ✅ Полностью настроенная продакшен сборка
- ✅ Docker контейнеризация
- ✅ CI/CD pipeline для автоматического деплоя
- ✅ Мониторинг и логирование
- ✅ Health checks и error tracking
- ✅ Оптимизация производительности
- ✅ Настройки безопасности
- ✅ Готовое к продакшену приложение