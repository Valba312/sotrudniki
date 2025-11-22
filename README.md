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

Запуск (понадобится установка npm-зависимостей):
```bash
cd backend
npm install
npm run dev
```

Основные эндпоинты:
- `POST /api/employees`
- `GET /api/employees/:id`
- `PUT/PATCH /api/employees/:id`
- `GET /api/employees` (фильтры + пагинация)
- `POST /api/employees/:id/status`, `GET /api/employees/:id/status-history`
- `POST /api/employees/:id/skills`, `DELETE /api/employees/:id/skills/:skillId`
- `POST /api/employees/:id/roles`, `DELETE /api/employees/:id/roles/:roleId`
- `GET /api/employees/:id/changes`

Тесты Vitest для ключевых сценариев находятся в `backend/tests/employeeService.test.ts`.

## Frontend

Исходники: `frontend/src`. Vite-приложение с компонентом `EmployeeCard` и демо-данными для автономного просмотра.

Запуск:
```bash
cd frontend
npm install
npm run dev
```

При отсутствии доступного API демо-дизайн использует мок `demoEmployee`.

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
