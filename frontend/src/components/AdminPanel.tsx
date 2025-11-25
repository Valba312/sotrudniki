import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  EmployeePayload,
  EmployeeWithRelations,
  employmentOptions,
  scheduleOptions,
  statusOptions,
  workLocationOptions
} from '../types';
import { createEmployee, updateEmployee } from '../api/client';

interface AdminPanelProps {
  employees: EmployeeWithRelations[];
  activeEmployeeId: string | null;
  onEmployeeChange: (employee: EmployeeWithRelations) => void;
  onSelect: (id: string | null) => void;
}

const defaultForm: EmployeePayload = {
  first_name: '',
  last_name: '',
  middle_name: '',
  date_of_birth: '1990-01-01',
  personal_ids: [''],
  hire_date: '2024-01-01',
  employment_type: 'full_time',
  position: '',
  department: '',
  manager_id: '',
  work_location: 'office',
  email_work: '',
  phone_work: '',
  email_personal: '',
  phone_personal: '',
  work_schedule_type: 'five_two',
  work_hours_per_week: 40,
  status: 'probation'
};

const toPayload = (employee: EmployeeWithRelations): EmployeePayload => ({
  first_name: employee.first_name,
  last_name: employee.last_name,
  middle_name: employee.middle_name,
  date_of_birth: employee.date_of_birth,
  personal_ids: employee.personal_ids,
  hire_date: employee.hire_date,
  employment_type: employee.employment_type,
  position: employee.position,
  department: employee.department,
  manager_id: employee.manager_id,
  work_location: employee.work_location,
  email_work: employee.email_work,
  phone_work: employee.phone_work,
  email_personal: employee.email_personal,
  phone_personal: employee.phone_personal,
  work_schedule_type: employee.work_schedule_type,
  work_hours_per_week: employee.work_hours_per_week,
  status: employee.status
});

export function AdminPanel({ employees, activeEmployeeId, onEmployeeChange, onSelect }: AdminPanelProps) {
  const [form, setForm] = useState<EmployeePayload>(defaultForm);
  const [idsInput, setIdsInput] = useState(defaultForm.personal_ids.join('\n'));
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedId = activeEmployeeId;
  const selectedEmployee = useMemo(
    () => employees.find(emp => emp.id === selectedId),
    [employees, selectedId]
  );

  useEffect(() => {
    if (selectedEmployee) {
      const payload = toPayload(selectedEmployee);
      setForm(payload);
      setIdsInput(payload.personal_ids.join('\n'));
    } else {
      setForm(defaultForm);
      setIdsInput(defaultForm.personal_ids.join('\n'));
    }
  }, [selectedEmployee]);

  const handleChange = <K extends keyof EmployeePayload>(field: K, value: EmployeePayload[K]) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);

    const payload: EmployeePayload = {
      ...form,
      personal_ids: idsInput
        .split(/[\n,]/)
        .map(item => item.trim())
        .filter(Boolean),
      manager_id: form.manager_id || undefined,
      middle_name: form.middle_name || undefined,
      email_personal: form.email_personal || undefined,
      phone_personal: form.phone_personal || undefined,
      work_hours_per_week: Number(form.work_hours_per_week) || 40
    };

    if (payload.personal_ids.length === 0) {
      setError('Добавьте хотя бы один идентификатор сотрудника');
      setSubmitting(false);
      return;
    }

    try {
      const saved = selectedId
        ? await updateEmployee(selectedId, payload)
        : await createEmployee(payload);
      onEmployeeChange(saved);
      onSelect(saved.id);
      setMessage(selectedId ? 'Карточка обновлена' : 'Сотрудник создан');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить изменения');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <aside className="admin">
      <div className="admin__header">
        <div>
          <p className="muted">Админ‑панель</p>
          <h2>Управление данными</h2>
        </div>
        <button className="btn btn--ghost" type="button" onClick={() => onSelect(null)}>
          Новый сотрудник
        </button>
      </div>

      <label className="field">
        <span>Сотрудник для редактирования</span>
        <select value={selectedId ?? ''} onChange={e => onSelect(e.target.value || null)}>
          <option value="">Новая карточка</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>
              {emp.last_name} {emp.first_name} — {emp.position}
            </option>
          ))}
        </select>
      </label>

      <form className="admin__form" onSubmit={handleSubmit}>
        <div className="field-grid">
          <label className="field">
            <span>Имя</span>
            <input value={form.first_name} onChange={e => handleChange('first_name', e.target.value)} required />
          </label>
          <label className="field">
            <span>Фамилия</span>
            <input value={form.last_name} onChange={e => handleChange('last_name', e.target.value)} required />
          </label>
          <label className="field">
            <span>Отчество</span>
            <input value={form.middle_name ?? ''} onChange={e => handleChange('middle_name', e.target.value || undefined)} />
          </label>
          <label className="field">
            <span>Дата рождения</span>
            <input type="date" value={form.date_of_birth} onChange={e => handleChange('date_of_birth', e.target.value)} required />
          </label>
          <label className="field">
            <span>Дата выхода</span>
            <input type="date" value={form.hire_date} onChange={e => handleChange('hire_date', e.target.value)} required />
          </label>
          <label className="field">
            <span>Тип занятости</span>
            <select value={form.employment_type} onChange={e => handleChange('employment_type', e.target.value as EmployeePayload['employment_type'])}>
              {Object.entries(employmentOptions).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Должность</span>
            <input value={form.position} onChange={e => handleChange('position', e.target.value)} required />
          </label>
          <label className="field">
            <span>Подразделение</span>
            <input value={form.department} onChange={e => handleChange('department', e.target.value)} required />
          </label>
          <label className="field">
            <span>Расположение</span>
            <select value={form.work_location} onChange={e => handleChange('work_location', e.target.value as EmployeePayload['work_location'])}>
              {Object.entries(workLocationOptions).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>График</span>
            <select
              value={form.work_schedule_type}
              onChange={e => handleChange('work_schedule_type', e.target.value as EmployeePayload['work_schedule_type'])}
            >
              {Object.entries(scheduleOptions).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Часы в неделю</span>
            <input
              type="number"
              min={1}
              value={form.work_hours_per_week}
              onChange={e => handleChange('work_hours_per_week', Number(e.target.value) as EmployeePayload['work_hours_per_week'])}
            />
          </label>
          <label className="field">
            <span>Статус</span>
            <select value={form.status} onChange={e => handleChange('status', e.target.value as EmployeePayload['status'])}>
              {Object.entries(statusOptions).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="field">
          <span>Корпоративный email</span>
          <input type="email" value={form.email_work} onChange={e => handleChange('email_work', e.target.value)} required />
        </label>
        <label className="field">
          <span>Рабочий телефон</span>
          <input value={form.phone_work} onChange={e => handleChange('phone_work', e.target.value)} required />
        </label>
        <label className="field">
          <span>Личные контакты</span>
          <div className="field-grid">
            <input
              type="email"
              placeholder="Email"
              value={form.email_personal ?? ''}
              onChange={e => handleChange('email_personal', (e.target.value || undefined) as EmployeePayload['email_personal'])}
            />
            <input
              placeholder="Телефон"
              value={form.phone_personal ?? ''}
              onChange={e => handleChange('phone_personal', (e.target.value || undefined) as EmployeePayload['phone_personal'])}
            />
          </div>
        </label>
        <label className="field">
          <span>Уникальные идентификаторы (ИНН, СНИЛС)</span>
          <textarea
            rows={3}
            value={idsInput}
            onChange={e => setIdsInput(e.target.value)}
            placeholder="Каждый идентификатор с новой строки"
          />
        </label>
        <label className="field">
          <span>ID руководителя</span>
          <input
            value={form.manager_id ?? ''}
            onChange={e => handleChange('manager_id', (e.target.value || undefined) as EmployeePayload['manager_id'])}
            placeholder="Необязательно"
          />
        </label>

        {message && <div className="alert alert--success">{message}</div>}
        {error && <div className="alert alert--error">{error}</div>}

        <button className="btn btn--primary" type="submit" disabled={submitting}>
          {submitting ? 'Сохранение...' : selectedId ? 'Сохранить изменения' : 'Создать сотрудника'}
        </button>
      </form>
    </aside>
  );
}
