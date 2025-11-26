import { EmployeeWithRelations } from '../types';

export const demoEmployee: EmployeeWithRelations = {
  id: 'demo-employee',
  first_name: 'Анна',
  last_name: 'Иванова',
  middle_name: 'Сергеевна',
  date_of_birth: '1993-06-12',
  personal_ids: ['12 34 567890', '77 AA 123456'],
  hire_date: '2021-03-15',
  employment_type: 'full_time',
  position: 'Руководитель группы перевозок',
  department: 'Операционный блок · Север',
  manager_id: 'manager-1',
  work_location: 'hybrid',
  email_work: 'anna.ivanova@luch.ru',
  phone_work: '+7 (900) 111-22-33',
  email_personal: 'anna.personal@example.com',
  phone_personal: '+7 (921) 555-77-88',
  work_schedule_type: 'flexible',
  work_hours_per_week: 38,
  status: 'active',
  upcoming_event: {
    type: 'review',
    label: 'Performance review',
    date: '2025-01-20'
  },
  onboarding_checklist: [
    { id: 'chk-1', title: 'Выдать СИЗ и пропуск', category: 'onboarding', done: true },
    { id: 'chk-2', title: 'Доступы в TMS и почту', category: 'onboarding', done: false },
    { id: 'chk-3', title: 'Инструктаж по безопасности рейсов', category: 'onboarding', done: false },
    { id: 'chk-4', title: 'Оффбординг: закрыть доступы', category: 'offboarding', done: false }
  ],
  responsibilities: [
    {
      id: 'resp-1',
      title: 'Планирование автоколонн',
      description: 'Согласование плечей, контроль загрузки и расписания рейсов, приоритизация срочных отправок.',
      from_date: '2022-01-01'
    },
    {
      id: 'resp-2',
      title: 'Наставничество',
      description: 'Онбординг новых диспетчеров, разбор ситуаций с безопасностью, проведение one-on-one встреч.',
      from_date: '2022-05-01'
    }
  ],
  skills: [
    {
      skill_id: 'skill-logistics',
      level: 'expert',
      skill: { id: 'skill-logistics', name: 'Логистика грузоперевозок', description: 'Плечи, окна, SLA и затраты' }
    },
    {
      skill_id: 'skill-safety',
      level: 'senior',
      skill: { id: 'skill-safety', name: 'Безопасность на рейсах', description: 'Проверки ТС, тахографы, ПДД' },
      verified_by: 'hr-1',
      verified_at: '2023-02-01'
    }
  ],
  roles: [
    { role_id: 'role-lead', from_date: '2023-01-10', role: { id: 'role-lead', name: 'Лидер смены' } },
    { role_id: 'role-quality', from_date: '2024-01-01', role: { id: 'role-quality', name: 'Ответственный за качество' } }
  ],
  schedule_history: [
    { from_date: '2021-03-15', schedule_type: 'five_two', hours_per_week: 40 },
    { from_date: '2024-02-01', schedule_type: 'flexible', hours_per_week: 38, comment: 'Сдвиг под вечерние рейсы' }
  ],
  status_history: [
    { from_status: 'probation', to_status: 'active', changed_at: '2021-06-15T10:00:00Z', changed_by: 'hr-1' },
    { from_status: 'active', to_status: 'on_leave', changed_at: '2022-07-01T10:00:00Z', changed_by: 'manager-1', reason: 'Учебный отпуск' },
    { from_status: 'on_leave', to_status: 'active', changed_at: '2022-08-01T10:00:00Z', changed_by: 'manager-1' }
  ],
  changes: [
    {
      changed_at: '2024-03-10T12:00:00Z',
      changed_by: 'hr-1',
      field_name: 'position',
      old_value: 'Логист по автопарку',
      new_value: 'Руководитель группы перевозок',
      comment: 'Повышение после performance review'
    },
    {
      changed_at: '2024-06-01T12:00:00Z',
      changed_by: 'manager-1',
      field_name: 'work_schedule_type',
      old_value: '5/2',
      new_value: 'Гибкий график'
    }
  ]
};
