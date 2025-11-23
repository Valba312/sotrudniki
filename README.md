# Карточка сотрудника

Минимальный прототип модуля «Единая цифровая карточка сотрудника» с backend на Node.js/TypeScript (Express) и frontend на React/TypeScript (Vite).

## Backend

Исходники: `backend/src`

Возможности:
- CRUD сотрудников с вложенными данными (обязанности, графики, навыки, роли)
- Смена статуса с записью истории и аудита (`employee_status_history`, `employee_change_log` в памяти)
- Фильтрация списка по статусу, отделу, роли, навыку, менеджеру и поиску
- Пагинация списка и истории изменений
- Базовая авторизация по заголовкам `x-user-id` и `x-user-role`

### Запуск backend

Требуется Node.js 20+.

```bash
cd backend
npm install
npm run dev # поднимет API на http://localhost:3000
```

Основные эндпоинты (префикс `/api`):
- `POST /api/employees`
- `GET /api/employees/:id`
- `PUT/PATCH /api/employees/:id`
- `GET /api/employees` (фильтры + пагинация)
- `POST /api/employees/:id/status`, `GET /api/employees/:id/status-history`
- `POST /api/employees/:id/skills`, `DELETE /api/employees/:id/skills/:skillId`
- `POST /api/employees/:id/roles`, `DELETE /api/employees/:id/roles/:roleId`
- `GET /api/employees/:id/changes`

Тесты Vitest для ключевых сценариев находятся в `backend/tests/employeeService.test.ts` и запускаются командой:

```bash
cd backend
npm test
```

### Быстрый ручной прогон API

1) Создать сотрудника (заголовки `x-user-id` и `x-user-role` нужны для авторизации):

```bash
curl -X POST http://localhost:3000/api/employees \
  -H "Content-Type: application/json" \
  -H "x-user-id: hr-user" -H "x-user-role: hr" \
  -d '{
    "first_name": "Иван", "last_name": "Иванов", "middle_name": "Иваныч",
    "date_of_birth": "1990-01-01", "personal_ids": ["123-45-67"],
    "hire_date": "2024-01-10", "employment_type": "full_time",
    "position": "Разработчик", "department": "R&D", "manager_id": null,
    "work_location": "remote", "email_work": "ivanov@corp.test", "phone_work": "+70001112233",
    "work_schedule_type": "five_two", "work_hours_per_week": 40,
    "status": "active"
  }'
```

2) Проверить карточку:

```bash
curl -H "x-user-id: hr-user" -H "x-user-role: hr" \
  http://localhost:3000/api/employees/<id-из-шага-1>
```

3) Сменить статус с записью истории:

```bash
curl -X POST http://localhost:3000/api/employees/<id-из-шага-1>/status \
  -H "Content-Type: application/json" \
  -H "x-user-id: admin" -H "x-user-role: admin" \
  -d '{"to_status":"on_leave","reason":"отпуск"}'
```

4) Получить историю изменений:

```bash
curl -H "x-user-id: admin" -H "x-user-role: admin" \
  "http://localhost:3000/api/employees/<id-из-шага-1>/changes?page=1&pageSize=5"
```

## Frontend

Исходники: `frontend/src`. Vite-приложение с компонентом `EmployeeCard` и демо-данными для автономного просмотра.

Запуск (при запущенном backend на 3000 порт проксируется автоматически):

```bash
cd frontend
npm install
npm run dev # откроет http://localhost:5173
```

При отсутствии доступного API демо-дизайн использует мок `demoEmployee`, но при запущенном сервере данные берутся с `/api` через прокси Vite.

### Развертывание в облаке

Быстрый старт без собственной инфраструктуры:

- **Render / Railway** (backend):
  1. Создайте новый Web Service из репозитория.
  2. Build command: `cd backend && npm install && npm run build`.
  3. Start command: `cd backend && npm start`.
  4. Переменная окружения `PORT` выставляется облаком автоматически.

- **Vercel / Netlify** (frontend):
  1. Проект — директория `frontend` (см. `vercel.json`, он автоматически делает `cd frontend`).
  2. Build command: `npm install && npm run build`.
  3. Output: `frontend/dist`.
  4. Прокиньте адрес бэкенда через переменную `VITE_API_BASE=https://<your-backend-host>/api`.
  5. Для SPA на Vercel настроен fallback на `index.html` (раздел `rewrites` в `vercel.json`).

- **Docker (универсально)**:
  - Соберите и запустите бэкенд: `cd backend && npm install && npm run build && PORT=3000 npm start`.
  - Любой reverse-proxy (например, Nginx или Caddy) может отдавать статический `frontend/dist` и пробрасывать `/api` на бэкенд.

Для стабильной работы в облаке обязательно задайте переменные окружения (например, `VITE_API_BASE`) и используйте HTTPS-URL бэкенда, чтобы фронтенд корректно стучался в API.

## Как сохранить изменения в Git

1. Проверьте текущие изменения и ветку:
   ```bash
   git status -sb
   ```
2. Добавьте нужные файлы в индекс:
   ```bash
   git add <paths>
   ```
3. Создайте коммит с осмысленным сообщением:
   ```bash
   git commit -m "Кратко опишите изменение"
   ```
4. Отправьте ветку в удалённый репозиторий:
   ```bash
   git push origin <branch-name>
   ```
Если удалённый репозиторий ещё не настроен, добавьте его через `git remote add origin <url>` и повторите шаги отправки.
