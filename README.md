# REBORN BMW

Самостоятельный сайт: React/Vite, Node.js 24, собственная SQLite и локальный AI через Ollama. Исходный дизайн сохранён. Старый хостинг для запуска не нужен.

```sh
npm ci
npm run setup
npm run dev
```

Production: `npm run build`, затем `npm start`. Ключ администратора хранится в локальном `.env.server.local`; база и резервные копии — в `.private/`. Эти файлы не публикуются в Git.

Полная настройка, режимы AI, резервное копирование и границы переноса: [MAINTENANCE.md](MAINTENANCE.md).
