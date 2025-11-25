# Цифровая карточка сотрудника

Фулстек‑проект для ведения цифровых карточек сотрудников. Бэкенд написан на Node.js/TypeScript (Express), фронтенд — на React/TypeScript (Vite). Решение поддерживает историю статусов, аудит изменений, учёт навыков и ролей.

## Быстрый старт
- Одна команда поднимает оба dev‑сервера (использует `concurrently` из корня репозитория):
  ```bash
  npm install                # установит корневые dev-зависимости, включая concurrent запуск
  npm run install-all        # установит зависимости backend и frontend (один раз)
  npm run dev                # одновременно запустит backend:3000 и frontend:5173
  ```
- При необходимости запускайте части отдельно — см. разделы ниже.

## Стек и структура

- `backend/` — REST API, in-memory репозиторий, Vitest‑тесты.
- `frontend/` — React SPA c компонентом `EmployeeCard` и демо‑данными.

## Backend

### Требования
- Node.js 20+

### Установка и запуск
```bash
cd backend
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

#### Тесты
```bash
cd backend
npm test
```

### Возможности API
- CRUD для сотрудников.
- История статусов + журнал изменений (`employee_status_history`, `employee_change_log`).
- Учёт навыков, ролей, рабочих графиков и зон ответственности.
- Привязка действий к пользователю через заголовки `x-user-id` и `x-user-role`.

### Основные эндпоинты (`/api`)
- `POST /employees`, `GET /employees/:id`, `PUT/PATCH /employees/:id`
- `GET /employees` с фильтрами и пагинацией
- `POST /employees/:id/status`, `GET /employees/:id/status-history`
- `POST /employees/:id/skills`, `DELETE /employees/:id/skills/:skillId`
- `POST /employees/:id/roles`, `DELETE /employees/:id/roles/:roleId`
- `POST /employees/:id/responsibilities`
- `POST /employees/:id/schedules`
- `GET /employees/:id/changes`
- `POST /skills`, `POST /roles`

> Если локальная установка npm упирается в mirror из `.npmrc`, поменяйте реестр: `npm config set registry https://registry.npmjs.org/`.

## Frontend

### Установка и запуск
```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

- Одна страница объединяет цифровую карточку и админ‑панель с формами создания/редактирования. Сохранения отправляются в `/api` с демо-заголовками `x-user-id: demo-admin`, `x-user-role: hr`.
- В режиме разработки используется прокси Vite `/api -> http://localhost:3000`.
- Если `VITE_API_BASE` не задан, запросы падают в демо‑режим и возвращают `demoEmployee`, что позволяет открыть карточку без бэкенда (например, на Vercel/Netlify).

### Сборка
```bash
cd frontend
npm run build
```
Результат находится в `frontend/dist`.

## Деплой

- **Backend (Render/Railway)**  
  Build: `cd backend && npm install && npm run build`  
  Start: `cd backend && npm start`  
  Убедитесь, что переменная `PORT` проброшена платформой.

- **Frontend (Vercel/Netlify)**  
  Build: `npm install && npm run build` (директория `frontend`).  
  Output: `frontend/dist`.  
  Переменная окружения: `VITE_API_BASE=https://<backend-domain>/api`.  
  Для SPA на Vercel добавьте `rewrites` на `index.html`.

- **Docker / reverse proxy**  
  Соберите backend (`npm run build && PORT=3000 npm start`) и отдавайте `frontend/dist` любым статическим сервером, проксируя `/api` на бэкенд.

## Работа с Git
1. Проверяйте состояние: `git status -sb`.
2. Индексируйте изменения: `git add <paths>`.
3. Коммитьте: `git commit -m "Описание изменений"`.
4. Пушьте в свой ремоут: `git push origin <branch-name>`.

При необходимости добавьте remote: `git remote add origin <url>`.
