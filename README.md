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
