import { EmployeeWithRelations } from '../types';

export const demoEmployee: EmployeeWithRelations = {
  id: 'demo-employee',
  first_name: 'Анна',
  last_name: 'Иванова',
  middle_name: 'Сергеевна',
  date_of_birth: '1993-06-12',
  personal_ids: ['123-456-789'],
  hire_date: '2021-03-15',
  employment_type: 'full_time',
  position: 'Ведущий разработчик',
  department: 'Платформа',
  work_location: 'hybrid',
  email_work: 'anna.ivanova@corp.example',
  phone_work: '+7 (900) 111-22-33',
  work_schedule_type: 'five_two',
  work_hours_per_week: 40,
  status: 'active',
  responsibilities: [
    {
      id: 'resp-1',
      title: 'Ведение технического стека',
      description: 'Определение технической стратегии команды и код-ревью',
      from_date: '2022-01-01'
    },
    {
      id: 'resp-2',
      title: 'Наставничество',
      description: 'Помощь младшим разработчикам',
      from_date: '2022-05-01'
    }
  ],
  skills: [
    {
      skill_id: 'skill-ts',
      level: 'expert',
      skill: { id: 'skill-ts', name: 'TypeScript', description: 'Язык программирования' }
    },
    {
      skill_id: 'skill-react',
      level: 'senior',
      skill: { id: 'skill-react', name: 'React', description: 'UI библиотека' },
      verified_by: 'hr-1',
      verified_at: '2023-02-01'
    }
  ],
  roles: [
    { role_id: 'role-lead', from_date: '2023-01-10', role: { id: 'role-lead', name: 'Team Lead' } },
    { role_id: 'role-security', from_date: '2024-01-01', role: { id: 'role-security', name: 'Security Champion' } }
  ],
  schedule_history: [
    { from_date: '2021-03-15', schedule_type: 'five_two', hours_per_week: 40 },
    { from_date: '2024-02-01', schedule_type: 'flexible', hours_per_week: 38, comment: 'Гибкий график' }
  ],
  status_history: [
    { from_status: 'probation', to_status: 'active', changed_at: '2021-06-15T10:00:00Z', changed_by: 'hr-1' },
    { from_status: 'active', to_status: 'on_leave', changed_at: '2022-07-01T10:00:00Z', changed_by: 'manager-1', reason: 'Отпуск' },
    { from_status: 'on_leave', to_status: 'active', changed_at: '2022-08-01T10:00:00Z', changed_by: 'manager-1' }
  ],
  changes: [
    {
      changed_at: '2024-03-10T12:00:00Z',
      changed_by: 'hr-1',
      field_name: 'position',
      old_value: 'Старший разработчик',
      new_value: 'Ведущий разработчик',
      comment: 'Повышение'
    },
    {
      changed_at: '2024-06-01T12:00:00Z',
      changed_by: 'manager-1',
      field_name: 'work_schedule_type',
      old_value: 'five_two',
      new_value: 'flexible'
    }
  ]
};
