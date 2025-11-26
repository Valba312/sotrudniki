import { ChangeLog, employmentOptions, scheduleOptions, statusOptions, workLocationOptions } from '../types';

const formatDateTime = (value: string | null) => {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString('ru-RU');
};

const fieldLabels: Record<string, string> = {
  position: 'Должность',
  department: 'Подразделение',
  status: 'Статус',
  work_schedule_type: 'График',
  work_hours_per_week: 'Часы/неделю',
  employment_type: 'Формат занятости',
  work_location: 'Формат работы',
  email_work: 'Email рабочий',
  phone_work: 'Телефон рабочий',
  email_personal: 'Email личный',
  phone_personal: 'Телефон личный',
  manager_id: 'ID руководителя',
  personal_ids: 'Персональные ID'
};

const formatValue = (field: string, value: string | null) => {
  if (!value) return '—';
  const normalized = value.trim();
  if (field === 'status') return statusOptions[normalized as keyof typeof statusOptions] ?? normalized;
  if (field === 'employment_type') return employmentOptions[normalized as keyof typeof employmentOptions] ?? normalized;
  if (field === 'work_schedule_type') return scheduleOptions[normalized as keyof typeof scheduleOptions] ?? normalized;
  if (field === 'work_location') return workLocationOptions[normalized as keyof typeof workLocationOptions] ?? normalized;
  if (field === 'personal_ids') return normalized.split(',').map(item => item.trim()).join(', ');
  return normalized;
};

export const ChangeTable = ({ changes }: { changes: ChangeLog[] }) => (
  <table className="table">
    <thead>
      <tr>
        <th>Дата/время</th>
        <th>Кто менял</th>
        <th>Поле</th>
        <th>Было</th>
        <th>Стало</th>
        <th>Комментарий</th>
      </tr>
    </thead>
    <tbody>
      {changes.length === 0 && (
        <tr>
          <td colSpan={6}>История пуста</td>
        </tr>
      )}
      {changes.map((change, idx) => (
        <tr key={idx}>
          <td>{formatDateTime(change.changed_at)}</td>
          <td>{change.changed_by}</td>
          <td>{fieldLabels[change.field_name] ?? change.field_name}</td>
          <td>{formatValue(change.field_name, change.old_value)}</td>
          <td>{formatValue(change.field_name, change.new_value)}</td>
          <td>{change.comment ?? '—'}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
