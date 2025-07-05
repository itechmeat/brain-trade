# Руководство по деплою смарт-контрактов

## Обзор

Этот проект использует смарт-контракты на Zircuit testnet для системы экспертных токенов и чаевых. В этом руководстве описан процесс деплоя контрактов с правильными суммами токенов.

## Предварительные требования

### 1. Переменные окружения

Убедитесь, что в вашем `.env.local` есть:

```bash
# Zircuit network configuration
ZIRCUIT_RPC_URL=https://zircuit-garfield-testnet.drpc.org
NEXT_PUBLIC_ZIRCUIT_RPC_URL=https://zircuit-garfield-testnet.drpc.org
ZIRCUIT_PRIVATE_KEY=your_private_key_here

# Deployed contracts (будет обновлено после деплоя)
NEXT_PUBLIC_EXPERT_FACTORY_ADDRESS=contract_address_here
```

### 2. Получение testnet ETH

1. Перейдите на https://faucet.zircuit.com/
2. Подключите ваш кошелек
3. Запросите тестовые ETH (нужно минимум 0.01 ETH для деплоя)

### 3. Компиляция контрактов

```bash
npx hardhat compile
```

## Процесс деплоя

### Основной деплой (рекомендуется)

Используйте готовый скрипт деплоя:

```bash
node scripts/deploy.js
```

Этот скрипт:
- Деплоит ExpertFactory контракт
- Создает 3 экспертных токена с правильными ценами
- Сохраняет информацию о деплое в `deployments/zircuit-testnet.json`

### Ручной деплой через Hardhat Console

Альтернативный способ для более детального контроля:

```bash
# Откройте консоль Hardhat
npx hardhat console --network zircuit

# В консоли выполните:
const [deployer] = await ethers.getSigners()
console.log("Deployer:", deployer.address)

const balance = await deployer.provider.getBalance(deployer.address)
console.log("Balance:", ethers.formatEther(balance), "ETH")

const ExpertFactory = await ethers.getContractFactory("ExpertFactory")
const expertFactory = await ExpertFactory.deploy(deployer.address)
await expertFactory.waitForDeployment()

const address = await expertFactory.getAddress()
console.log("ExpertFactory deployed to:", address)

# Создание экспертов
await expertFactory.createExpert("Ben Horowitz", "btBEN", "Venture Capital", 15, deployer.address)
await expertFactory.createExpert("Peter Thiel", "btTHIEL", "Innovation", 20, deployer.address)
await expertFactory.createExpert("Steve Blank", "btBLANK", "Lean Startup", 10, deployer.address)

console.log("All experts created!")
```

## После деплоя

### 1. Обновите переменные окружения

Добавьте адрес задеплоенного контракта в `.env.local`:

```bash
NEXT_PUBLIC_EXPERT_FACTORY_ADDRESS=0xYourContractAddress
```

### 2. Перезапустите dev-сервер

```bash
npm run dev
```

### 3. Проверьте функциональность

- Подключите кошелек в приложении
- Переключитесь на Zircuit Testnet
- Попробуйте купить токены эксперта
- Протестируйте функцию чаевых

## Структура контрактов

### ExpertFactory

Основной контракт-фабрика для создания экспертных токенов:

- `createExpert()` - создает новый экспертный токен
- `getAllExperts()` - возвращает список всех экспертов
- `getExpert()` - получает информацию о конкретном эксперте

### ExpertToken (ERC-20)

Токен для каждого эксперта с функциональностью:

- `purchaseTokens()` - покупка токенов за ETH
- `startConsultation()` - начало консультации (списание токенов)
- `sendTip()` - отправка чаевых эксперту
- `canAffordConsultation()` - проверка достаточности баланса

## Конфигурация экспертов

При создании экспертов задаются следующие параметры:

| Эксперт | Символ | Категория | Стоимость консультации |
|---------|--------|-----------|----------------------|
| Ben Horowitz | btBEN | Venture Capital | 15 токенов |
| Peter Thiel | btTHIEL | Innovation | 20 токенов |
| Steve Blank | btBLANK | Lean Startup | 10 токенов |

⚠️ **Важно:** Стоимость передается в wei формате (`ethers.parseEther('15')`) чтобы обеспечить правильное списание токенов.

## Устранение неполадок

### Ошибка: "Factory contract not deployed"

- Убедитесь, что `NEXT_PUBLIC_EXPERT_FACTORY_ADDRESS` правильно установлен
- Проверьте, что контракт действительно задеплоен на правильной сети
- Перезапустите dev-сервер после изменения .env.local

### Ошибка: "Insufficient balance for deployment"

- Получите больше тестовых ETH с фаукета Zircuit
- Проверьте правильность private key

### Проблема: Списываются неправильные суммы токенов

- Убедитесь, что при деплое используется `ethers.parseEther()` для конвертации в wei
- Проверьте, что в UI компонентах используется `isWeiFormat={true}`
- При правильном деплое должно списываться 15/20/10 токенов, а не доли

### Проблемы с газом

- Увеличьте gas limit в транзакциях
- Проверьте настройки сети Zircuit

## Полезные команды

```bash
# Основной деплой
node scripts/deploy.js

# Компиляция контрактов
npx hardhat compile

# Проверка подключения к сети
node scripts/test-connection.js

# Проверка баланса
node scripts/check-balance.js

# Очистка артефактов
npx hardhat clean
```

## Верификация контрактов

После деплоя рекомендуется верифицировать контракты в блокчейн-проводнике Zircuit для прозрачности.

## Важные файлы

- `scripts/deploy.js` - **ЕДИНСТВЕННЫЙ** правильный скрипт деплоя
- `contracts/ExpertFactory.sol` - Фабрика для создания экспертов
- `contracts/ExpertToken.sol` - ERC-20 токен эксперта с функцией чаевых
- `deployments/zircuit-testnet.json` - Информация о последнем деплое

## Безопасность

⚠️ **Важно:**
- Никогда не commitьте private keys в git
- Используйте .env.local для локальной разработки
- Для продакшена используйте безопасные методы управления ключами
- Проведите аудит контрактов перед mainnet деплоем

## Результат успешного деплоя

После успешного деплоя вы увидите:
```
✅ ExpertFactory deployed to: 0x...
✅ Ben Horowitz created
✅ Peter Thiel created  
✅ Steve Blank created
🎯 Expert tokens deployed:
  Ben Horowitz (btBEN): 15.0 tokens per consultation
  Peter Thiel (btTHIEL): 20.0 tokens per consultation
  Steve Blank (btBLANK): 10.0 tokens per consultation
```