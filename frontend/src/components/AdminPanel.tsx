import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import {
  EmployeePayload,
  EmployeeWithRelations,
  employmentOptions,
  scheduleOptions,
  SkillLevel,
  statusOptions,
  workLocationOptions
} from '../types';
import {
  createEmployee,
  updateEmployee,
  setSkills,
  setRoles,
  addResponsibility,
  addScheduleHistory,
  addStatusHistory,
  createRoleDefinition,
  createSkillDefinition
} from '../api/client';
import { TabList } from './TabList';

interface AdminPanelProps {
  employees: EmployeeWithRelations[];
  activeEmployeeId: string | null;
  onEmployeeChange: (employee: EmployeeWithRelations) => void;
  onSelect: (id: string | null) => void;
}

const adminTabs = ['Основные данные', 'Навыки и роли', 'Ответственности', 'Движение'] as const;
type AdminTab = (typeof adminTabs)[number];

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

const today = () => new Date().toISOString().slice(0, 10);

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (!digits) return '';
  const parts = [digits.slice(0, 1), digits.slice(1, 4), digits.slice(4, 7), digits.slice(7, 9), digits.slice(9, 11)];
  let formatted = parts[0] === '8' ? '+7' : `+${parts[0]}`;
  if (parts[1]) formatted += ` (${parts[1]}`;
  if (parts[1]?.length === 3) formatted += ')';
  if (parts[2]) formatted += ` ${parts[2]}`;
  if (parts[3]) formatted += `-${parts[3]}`;
  if (parts[4]) formatted += `-${parts[4]}`;
  return formatted;
};

const draftKey = (id: string | null) => `employee-draft-${id ?? 'new'}`;

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
  const [forbidden, setForbidden] = useState<string | null>(null);
  const [adminTab, setAdminTab] = useState<AdminTab>('Основные данные');
  const firstNameRef = useRef<HTMLInputElement | null>(null);
  const lastNameRef = useRef<HTMLInputElement | null>(null);
  const positionRef = useRef<HTMLInputElement | null>(null);
  const departmentRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);

  const [skillName, setSkillName] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('middle');
  const [roleName, setRoleName] = useState('');
  const [roleFromDate, setRoleFromDate] = useState(today());
  const [respTitle, setRespTitle] = useState('');
  const [respFrom, setRespFrom] = useState(today());
  const [respTo, setRespTo] = useState('');
  const [respDesc, setRespDesc] = useState('');
  const [statusTo, setStatusTo] = useState<EmployeePayload['status']>('active');
  const [statusReason, setStatusReason] = useState('');
  const [statusDate, setStatusDate] = useState(today());
  const [schedType, setSchedType] = useState<EmployeePayload['work_schedule_type']>('five_two');
  const [schedHours, setSchedHours] = useState<number>(40);
  const [schedFrom, setSchedFrom] = useState(today());
  const [schedTo, setSchedTo] = useState('');
  const [schedComment, setSchedComment] = useState('');

  const selectedId = activeEmployeeId;
  const selectedEmployee = useMemo(() => employees.find(emp => emp.id === selectedId), [employees, selectedId]);

  useEffect(() => {
    const savedDraft = localStorage.getItem(draftKey(selectedId));
    if (selectedEmployee) {
      const payload = toPayload(selectedEmployee);
      setForm(payload);
      setIdsInput(payload.personal_ids.join('\n'));
    } else if (savedDraft) {
      const parsed = JSON.parse(savedDraft) as EmployeePayload & { idsInput?: string };
      setForm(parsed);
      setIdsInput(parsed.idsInput ?? parsed.personal_ids.join('\n'));
    } else {
      setForm(defaultForm);
      setIdsInput(defaultForm.personal_ids.join('\n'));
    }
  }, [selectedEmployee, selectedId]);

  const handleChange = <K extends keyof EmployeePayload>(field: K, value: EmployeePayload[K]) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    const payload = { ...form, idsInput };
    localStorage.setItem(draftKey(selectedId), JSON.stringify(payload));
  }, [form, idsInput, selectedId]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);
    setForbidden(null);

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
      setError('Укажите хотя бы один документ сотрудника');
      setSubmitting(false);
      return;
    }

    const validations: Array<[boolean, string, React.RefObject<HTMLInputElement>]> = [
      [!!payload.first_name.trim(), 'Заполните имя', firstNameRef],
      [!!payload.last_name.trim(), 'Заполните фамилию', lastNameRef],
      [!!payload.position.trim(), 'Добавьте должность', positionRef],
      [!!payload.department.trim(), 'Укажите подразделение', departmentRef],
      [!!payload.email_work.trim(), 'Укажите корпоративный email', emailRef],
      [payload.phone_work.replace(/\D/g, '').length >= 10, 'Заполните рабочий телефон', phoneRef]
    ];
    const failed = validations.find(v => !v[0]);
    if (failed) {
      setError(failed[1]);
      failed[2].current?.focus();
      setSubmitting(false);
      return;
    }

    try {
      const saved = selectedId ? await updateEmployee(selectedId, payload) : await createEmployee(payload);
      onEmployeeChange(saved);
      onSelect(saved.id);
      setMessage(selectedId ? 'Карточка обновлена' : 'Сотрудник добавлен');
      localStorage.removeItem(draftKey(selectedId));
    } catch (err) {
      if (axiosLikeForbidden(err)) {
        setForbidden('У этой роли нет прав на изменение. Выберите HR/Admin/Manager.');
      } else {
        setError(err instanceof Error ? err.message : 'Не получилось сохранить данные');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSkill = async () => {
    if (!selectedEmployee || !skillName.trim()) return;
    const skillDef = await createSkillDefinition(skillName.trim());
    const payload = [...selectedEmployee.skills.map(s => ({ skill_id: s.skill_id, level: s.level })), { skill_id: skillDef.id, level: skillLevel }];
    const updated = await setSkills(selectedEmployee.id, payload);
    onEmployeeChange(updated);
    setSkillName('');
    setSkillLevel('middle');
  };

  const handleRemoveSkill = async (skillId: string) => {
    if (!selectedEmployee) return;
    const remaining = selectedEmployee.skills.filter(s => s.skill_id !== skillId).map(s => ({ skill_id: s.skill_id, level: s.level }));
    const updated = await setSkills(selectedEmployee.id, remaining);
    onEmployeeChange(updated);
  };

  const handleAddRole = async () => {
    if (!selectedEmployee || !roleName.trim()) return;
    const roleDef = await createRoleDefinition(roleName.trim());
    const payload = [
      ...selectedEmployee.roles.map(r => ({ role_id: r.role_id, from_date: r.from_date, to_date: r.to_date })),
      { role_id: roleDef.id, from_date: roleFromDate, to_date: undefined }
    ];
    const updated = await setRoles(selectedEmployee.id, payload);
    onEmployeeChange(updated);
    setRoleName('');
    setRoleFromDate(today());
  };

  const handleRemoveRole = async (roleId: string) => {
    if (!selectedEmployee) return;
    const remaining = selectedEmployee.roles
      .filter(r => r.role_id !== roleId)
      .map(r => ({ role_id: r.role_id, from_date: r.from_date, to_date: r.to_date }));
    const updated = await setRoles(selectedEmployee.id, remaining);
    onEmployeeChange(updated);
  };

  const handleAddResponsibility = async () => {
    if (!selectedEmployee || !respTitle.trim()) return;
    const updated = await addResponsibility(selectedEmployee.id, {
      title: respTitle.trim(),
      description: respDesc.trim() || 'Без описания',
      from_date: respFrom,
      to_date: respTo || undefined
    });
    onEmployeeChange(updated);
    setRespTitle('');
    setRespDesc('');
    setRespFrom(today());
    setRespTo('');
  };

  const handleAddStatusHistory = async () => {
    if (!selectedEmployee) return;
    const updated = await addStatusHistory(selectedEmployee.id, {
      to_status: statusTo,
      reason: statusReason || undefined
    });
    onEmployeeChange(updated);
    setStatusReason('');
    setStatusDate(today());
  };

  const handleAddScheduleHistory = async () => {
    if (!selectedEmployee) return;
    const updated = await addScheduleHistory(selectedEmployee.id, {
      from_date: schedFrom,
      to_date: schedTo || undefined,
      schedule_type: schedType,
      hours_per_week: Number(schedHours) || 40,
      comment: schedComment || undefined
    });
    onEmployeeChange(updated);
    setSchedComment('');
    setSchedFrom(today());
    setSchedTo('');
  };

  return (
    <aside className="admin">
      <div className="admin__header">
        <div>
          <p className="muted">Работа с карточкой</p>
          <h2>Данные сотрудника</h2>
        </div>
        <button className="btn btn--ghost" type="button" onClick={() => onSelect(null)}>
          Новый сотрудник
        </button>
      </div>

      <label className="field">
        <span>Выберите сотрудника</span>
        <select value={selectedId ?? ''} onChange={e => onSelect(e.target.value || null)}>
          <option value="">Добавить нового</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>
              {emp.last_name} {emp.first_name} · {emp.position}
            </option>
          ))}
        </select>
      </label>

      <form className="admin__form" onSubmit={handleSubmit}>
        <TabList tabs={adminTabs} active={adminTab} onChange={setAdminTab} />

        {adminTab === 'Основные данные' && (
          <>
            <div className="field-grid">
              <label className="field">
                <span>Имя</span>
                <input ref={firstNameRef} value={form.first_name} onChange={e => handleChange('first_name', e.target.value)} required />
              </label>
              <label className="field">
                <span>Фамилия</span>
                <input ref={lastNameRef} value={form.last_name} onChange={e => handleChange('last_name', e.target.value)} required />
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
                <span>Формат занятости</span>
                <select
                  value={form.employment_type}
                  onChange={e => handleChange('employment_type', e.target.value as EmployeePayload['employment_type'])}
                >
                  {Object.entries(employmentOptions).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Должность</span>
                <input ref={positionRef} value={form.position} onChange={e => handleChange('position', e.target.value)} required />
              </label>
              <label className="field">
                <span>Подразделение</span>
                <input ref={departmentRef} value={form.department} onChange={e => handleChange('department', e.target.value)} required />
              </label>
              <label className="field">
                <span>Формат работы</span>
                <select
                  value={form.work_location}
                  onChange={e => handleChange('work_location', e.target.value as EmployeePayload['work_location'])}
                >
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
              <input ref={emailRef} type="email" value={form.email_work} onChange={e => handleChange('email_work', e.target.value)} required />
            </label>
            <label className="field">
              <span>Рабочий телефон</span>
              <input
                ref={phoneRef}
                value={form.phone_work}
                onChange={e => handleChange('phone_work', formatPhone(e.target.value))}
                placeholder="+7 (___) ___-__-__"
                required
              />
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
                  onChange={e => handleChange('phone_personal', (formatPhone(e.target.value) || undefined) as EmployeePayload['phone_personal'])}
                />
              </div>
            </label>
            <label className="field">
              <span>Персональные ID (каждый с новой строки или через запятую)</span>
              <textarea
                rows={3}
                value={idsInput}
                onChange={e => setIdsInput(e.target.value)}
                placeholder="Паспорт, пропуск, водительское"
              />
            </label>
            <label className="field">
              <span>ID руководителя</span>
              <input
                value={form.manager_id ?? ''}
                onChange={e => handleChange('manager_id', (e.target.value || undefined) as EmployeePayload['manager_id'])}
                placeholder="Например, manager-1"
              />
            </label>
          </>
        )}

        {adminTab === 'Навыки и роли' && (
          <div className="stacked">
            <div className="admin-section admin-section--flat">
              <div className="admin-section__header">
                <div>
                  <h3>Навыки</h3>
                  <p className="muted">Компетенции сотрудника</p>
                </div>
                <span className="muted">{selectedEmployee?.skills.length ?? 0} шт.</span>
              </div>
              <div className="form-stack">
                <label className="field">
                  <span>Название навыка</span>
                  <div className="field-row">
                    <input
                      placeholder="Например, Логистика рейсов"
                      value={skillName}
                      onChange={e => setSkillName(e.target.value)}
                      disabled={!selectedEmployee}
                    />
                    <select value={skillLevel} onChange={e => setSkillLevel(e.target.value as SkillLevel)} disabled={!selectedEmployee}>
                      <option value="beginner">Junior</option>
                      <option value="middle">Middle</option>
                      <option value="senior">Senior</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                </label>
                <button className="btn btn--primary btn--full" type="button" onClick={handleAddSkill} disabled={!selectedEmployee || !skillName.trim()}>
                  Добавить
                </button>
              </div>
              <ul className="item-list">
                {selectedEmployee?.skills.length ? (
                  selectedEmployee.skills.map(skill => (
                    <li key={skill.skill_id} className="item-list__row">
                      <div>
                        <strong>{skill.skill.name}</strong>
                        <span className="muted"> · {skill.level}</span>
                      </div>
                      <button className="link link--danger" type="button" onClick={() => handleRemoveSkill(skill.skill_id)}>
                        Удалить
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="muted">Пока пусто</li>
                )}
              </ul>
            </div>

            <div className="admin-section admin-section--flat">
              <div className="admin-section__header">
                <div>
                  <h3>Роли</h3>
                  <p className="muted">Функции в команде</p>
                </div>
                <span className="muted">{selectedEmployee?.roles.length ?? 0} шт.</span>
              </div>
              <div className="form-stack">
                <label className="field">
                  <span>Название роли</span>
                  <input
                    placeholder="Например, Ответственный за безопасность"
                    value={roleName}
                    onChange={e => setRoleName(e.target.value)}
                    disabled={!selectedEmployee}
                  />
                </label>
                <label className="field">
                  <span>Дата назначения</span>
                  <input type="date" value={roleFromDate} onChange={e => setRoleFromDate(e.target.value)} disabled={!selectedEmployee} />
                </label>
                <button className="btn btn--primary btn--full" type="button" onClick={handleAddRole} disabled={!selectedEmployee || !roleName.trim()}>
                  Добавить
                </button>
              </div>
              <ul className="item-list">
                {selectedEmployee?.roles.length ? (
                  selectedEmployee.roles.map(role => (
                    <li key={role.role_id} className="item-list__row">
                      <div>
                        <strong>{role.role.name}</strong>
                        <span className="muted"> · с {role.from_date}</span>
                      </div>
                      <button className="link link--danger" type="button" onClick={() => handleRemoveRole(role.role_id)}>
                        Удалить
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="muted">Пока пусто</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {adminTab === 'Ответственности' && (
          <div className="admin-section admin-section--flat">
            <div className="admin-section__header">
              <div>
                <h3>Ответственности / задачи</h3>
                <p className="muted">Ключевые зоны ответственности</p>
              </div>
              <span className="muted">{selectedEmployee?.responsibilities.length ?? 0} шт.</span>
            </div>
            <div className="form-stack">
              <label className="field">
                <span>Заголовок</span>
                <input
                  placeholder="Например, Контроль расписания колонн"
                  value={respTitle}
                  onChange={e => setRespTitle(e.target.value)}
                  disabled={!selectedEmployee}
                />
              </label>
              <div className="field-row">
                <label className="field">
                  <span>Дата начала</span>
                  <input type="date" value={respFrom} onChange={e => setRespFrom(e.target.value)} disabled={!selectedEmployee} />
                </label>
                <label className="field">
                  <span>Дата окончания</span>
                  <input type="date" value={respTo} onChange={e => setRespTo(e.target.value)} disabled={!selectedEmployee} />
                </label>
              </div>
              <label className="field">
                <span>Описание</span>
                <textarea
                  rows={3}
                  placeholder="Кратко опишите задачу или особенность"
                  value={respDesc}
                  onChange={e => setRespDesc(e.target.value)}
                  disabled={!selectedEmployee}
                />
              </label>
              <button className="btn btn--primary btn--full" type="button" onClick={handleAddResponsibility} disabled={!selectedEmployee || !respTitle.trim()}>
                Добавить
              </button>
            </div>
            <ul className="item-list">
              {selectedEmployee?.responsibilities.length ? (
                selectedEmployee.responsibilities.map(res => (
                  <li key={res.id} className="item-list__row item-list__row--column">
                    <div>
                      <strong>{res.title}</strong>
                      <span className="muted">
                        {' '}
                        · {res.from_date}
                        {res.to_date ? ` — ${res.to_date}` : ''}
                      </span>
                      <p className="muted">{res.description}</p>
                    </div>
                  </li>
                ))
              ) : (
                <li className="muted">Пока пусто</li>
              )}
            </ul>
          </div>
        )}

        {adminTab === 'Движение' && (
          <div className="stacked">
            <div className="admin-section admin-section--flat">
              <div className="admin-section__header">
                <div>
                  <h3>Статус</h3>
                  <p className="muted">История смен статуса</p>
                </div>
              </div>
              <div className="form-stack">
                <label className="field">
                  <span>Новый статус</span>
                  <select value={statusTo} onChange={e => setStatusTo(e.target.value as EmployeePayload['status'])} disabled={!selectedEmployee}>
                    {Object.entries(statusOptions).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Дата изменения</span>
                  <input type="date" value={statusDate} onChange={e => setStatusDate(e.target.value)} disabled={!selectedEmployee} />
                </label>
                <label className="field">
                  <span>Комментарий</span>
                  <textarea
                    rows={2}
                    placeholder="Например, перевод в отпуск"
                    value={statusReason}
                    onChange={e => setStatusReason(e.target.value)}
                    disabled={!selectedEmployee}
                  />
                </label>
                <button className="btn btn--primary btn--full" type="button" onClick={handleAddStatusHistory} disabled={!selectedEmployee}>
                  Добавить статус
                </button>
              </div>
            </div>

            <div className="admin-section admin-section--flat">
              <div className="admin-section__header">
                <div>
                  <h3>График</h3>
                  <p className="muted">История смен графика</p>
                </div>
              </div>
              <div className="form-stack">
                <label className="field">
                  <span>График</span>
                  <select value={schedType} onChange={e => setSchedType(e.target.value as EmployeePayload['work_schedule_type'])} disabled={!selectedEmployee}>
                    {Object.entries(scheduleOptions).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="field-row">
                  <label className="field">
                    <span>Часы/неделю</span>
                    <input
                      type="number"
                      min={1}
                      value={schedHours}
                      onChange={e => setSchedHours(Number(e.target.value))}
                      disabled={!selectedEmployee}
                    />
                  </label>
                  <label className="field">
                    <span>Дата начала</span>
                    <input type="date" value={schedFrom} onChange={e => setSchedFrom(e.target.value)} disabled={!selectedEmployee} />
                  </label>
                  <label className="field">
                    <span>Дата окончания</span>
                    <input type="date" value={schedTo} onChange={e => setSchedTo(e.target.value)} disabled={!selectedEmployee} />
                  </label>
                </div>
                <label className="field">
                  <span>Комментарий</span>
                  <textarea
                    rows={2}
                    placeholder="Например, сдвиг под вечерние рейсы"
                    value={schedComment}
                    onChange={e => setSchedComment(e.target.value)}
                    disabled={!selectedEmployee}
                  />
                </label>
                <button className="btn btn--primary btn--full" type="button" onClick={handleAddScheduleHistory} disabled={!selectedEmployee}>
                  Добавить график
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="admin__actions">
          {message && <div className="alert alert--success">{message}</div>}
          {error && <div className="alert alert--error">{error}</div>}
          {forbidden && <div className="alert alert--error">{forbidden}</div>}

          <button className="btn btn--primary" type="submit" disabled={submitting}>
            {submitting ? 'Сохраняем...' : selectedId ? 'Сохранить изменения' : 'Создать карточку'}
          </button>
        </div>
      </form>
    </aside>
  );
}

function axiosLikeForbidden(err: unknown) {
  if (!axios.isAxiosError(err)) return false;
  const status = err.response?.status;
  return status === 403;
}
