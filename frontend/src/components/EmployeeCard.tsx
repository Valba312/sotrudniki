import { useMemo, useState } from 'react';
import {
  EmployeeWithRelations,
  SkillLevel,
  employmentOptions,
  scheduleOptions,
  statusOptions,
  workLocationOptions
} from '../types';
import { TabList } from './TabList';
import { InfoRow } from './InfoRow';
import { Timeline } from './Timeline';
import { ChangeTable } from './ChangeTable';

interface Props {
  employee: EmployeeWithRelations;
}

const tabs = ['Профиль', 'График', 'Ответственности', 'Навыки и роли', 'Движение', 'Чек-листы', 'Изменения'] as const;

const skillLevelLabels: Record<SkillLevel, string> = {
  beginner: 'Junior',
  middle: 'Middle',
  senior: 'Senior',
  expert: 'Expert'
};

type TabKey = (typeof tabs)[number];

const formatDate = (value?: string) => {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString('ru-RU');
};

const formatDateTime = (value?: string) => {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString('ru-RU');
};

export const EmployeeCard = ({ employee }: Props) => {
  const [activeTab, setActiveTab] = useState<TabKey>('Профиль');
  const [checklist, setChecklist] = useState(() => employee.onboarding_checklist ?? []);
  const statusHistory = employee.status_history ?? [];
  const scheduleHistory = employee.schedule_history ?? [];
  const responsibilities = employee.responsibilities ?? [];

  const fullName = useMemo(
    () => `${employee.last_name} ${employee.first_name}${employee.middle_name ? ` ${employee.middle_name}` : ''}`,
    [employee]
  );
  const initials = useMemo(
    () => `${employee.first_name.charAt(0)}${employee.last_name.charAt(0)}`.toUpperCase(),
    [employee.first_name, employee.last_name]
  );

  const movementItems = useMemo(() => {
    const statusItems = statusHistory.map(item => ({
      date: item.changed_at,
      title: `${statusOptions[item.from_status]} → ${statusOptions[item.to_status]}`,
      subtitle: item.reason ? `Комментарий: ${item.reason}` : 'Статус обновлён',
      kind: 'status' as const
    }));
    const scheduleItems = scheduleHistory.map(item => ({
      date: item.to_date ?? item.from_date,
      title: `График: ${scheduleOptions[item.schedule_type]} · ${item.hours_per_week} ч/нед`,
      subtitle: item.comment ?? 'Без комментария',
      kind: 'schedule' as const
    }));
    const respItems = responsibilities.map(item => ({
      date: item.from_date,
      title: `Задача: ${item.title}`,
      subtitle: item.to_date ? `до ${item.to_date}` : 'в работе',
      kind: 'responsibility' as const
    }));
    const roleItems = employee.roles.map(role => ({
      date: role.from_date,
      title: `Роль: ${role.role.name}`,
      subtitle: 'Назначена роль',
      kind: 'role' as const
    }));
    return [...statusItems, ...scheduleItems, ...respItems, ...roleItems].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [statusHistory, scheduleHistory, responsibilities, employee.roles]);

  const formatKpiDate = useMemo(() => {
    const date = employee.upcoming_event?.date;
    if (!date) return null;
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString('ru-RU');
  }, [employee.upcoming_event]);

  const toggleChecklist = (id: string) => {
    setChecklist(prev => prev.map(item => (item.id === id ? { ...item, done: !item.done } : item)));
  };

  return (
    <div className="card">
      <header className="card__header">
        <div className="card__avatar">{initials}</div>
        <div>
          <div className="card__title">{fullName}</div>
          <div className="card__subtitle">
            {employee.position} · {employee.department}
          </div>
          <div className="card__chips">
            <span className={`badge badge--${employee.status}`}>{statusOptions[employee.status]}</span>
            <span className="badge badge--light">В команде с {formatDate(employee.hire_date)}</span>
            {employee.upcoming_event && (
              <span className="badge badge--kpi">
                {employee.upcoming_event.label} · {formatKpiDate ?? '—'}
              </span>
            )}
          </div>
        </div>
        <div className="card__contacts">
          <div>{employee.email_work}</div>
          <div>{employee.phone_work}</div>
        </div>
      </header>

      <TabList tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'Профиль' && (
        <div className="grid">
          <InfoRow label="Формат занятости" value={employmentOptions[employee.employment_type]} />
          <InfoRow label="Формат работы" value={workLocationOptions[employee.work_location]} />
          <InfoRow label="Дата рождения" value={formatDate(employee.date_of_birth)} />
          <InfoRow label="ID руководителя" value={employee.manager_id ?? '—'} />
          <InfoRow label="Корпоративные контакты" value={`${employee.email_work} · ${employee.phone_work}`} />
          <InfoRow label="Персональные ID" value={(employee.personal_ids ?? []).join(', ')} />
          {employee.email_personal && <InfoRow label="Личный email" value={employee.email_personal} />}
          {employee.phone_personal && <InfoRow label="Личный телефон" value={employee.phone_personal} />}
        </div>
      )}

      {activeTab === 'График' && (
        <div>
          <h4>Текущий режим</h4>
          <InfoRow label="График" value={scheduleOptions[employee.work_schedule_type]} />
          <InfoRow label="Часы в неделю" value={`${employee.work_hours_per_week}`} />
          <h4>История графиков</h4>
          <Timeline
            items={scheduleHistory.map(item => ({
              title: `${scheduleOptions[item.schedule_type]} · ${item.hours_per_week} ч/нед`,
              subtitle: item.comment,
              date: `${formatDate(item.from_date)}${item.to_date ? ` — ${formatDate(item.to_date)}` : ''}`
            }))}
          />
        </div>
      )}

      {activeTab === 'Ответственности' && (
        <ul className="list">
          {responsibilities.length === 0 && <li className="muted">Пока пусто</li>}
          {responsibilities.map(res => (
            <li key={res.id}>
              <div className="list__title">{res.title}</div>
              <div className="muted">
                {formatDate(res.from_date)}
                {res.to_date ? ` — ${formatDate(res.to_date)}` : ''}
              </div>
              <p>{res.description}</p>
            </li>
          ))}
        </ul>
      )}

      {activeTab === 'Навыки и роли' && (
        <div className="grid">
          <div>
            <h4>Навыки</h4>
            <ul className="pill-list">
              {employee.skills.length === 0 && <li className="pill pill--muted">Список пуст</li>}
              {employee.skills.map(skill => (
                <li key={skill.skill_id} className="pill">
                  {skill.skill.name} · {skillLevelLabels[skill.level]}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Роли</h4>
            <ul className="pill-list">
              {employee.roles.length === 0 && <li className="pill pill--muted">Роль не назначена</li>}
              {employee.roles.map(role => (
                <li key={role.role_id} className="pill">
                  {role.role.name} · {formatDate(role.from_date)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'Движение' && (
        <div className="movement">
          <div className="movement__legend">
            <span className="movement__tag movement__tag--status">Статус</span>
            <span className="movement__tag movement__tag--schedule">График</span>
            <span className="movement__tag movement__tag--role">Роль</span>
            <span className="movement__tag movement__tag--resp">Задача</span>
          </div>
          <ul className="movement__list">
            {movementItems.length === 0 && <li className="muted">История пока пустая</li>}
            {movementItems.map((item, idx) => (
              <li key={idx} className="movement__item">
                <span className={`movement__dot movement__dot--${item.kind}`} />
                <div className="movement__body">
                  <div className="movement__title">
                    <span>{item.title}</span>
                    <span className={`movement__tag movement__tag--${item.kind}`}>
                      {item.kind === 'status' && 'Статус'}
                      {item.kind === 'schedule' && 'График'}
                      {item.kind === 'role' && 'Роль'}
                      {item.kind === 'responsibility' && 'Задача'}
                    </span>
                  </div>
                  {item.subtitle && <div className="muted">{item.subtitle}</div>}
                  <div className="movement__date muted">{formatDateTime(item.date)}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'Чек-листы' && (
        <div className="grid">
          <div className="checklist">
            <h4>Онбординг</h4>
            <ul>
              {checklist.filter(item => item.category === 'onboarding').length === 0 && <li className="muted">Пока пусто</li>}
              {checklist
                .filter(item => item.category === 'onboarding')
                .map(item => (
                  <li key={item.id} className="checklist__item">
                    <label>
                      <input type="checkbox" checked={item.done} onChange={() => toggleChecklist(item.id)} />
                      <span className={item.done ? 'done' : ''}>{item.title}</span>
                    </label>
                  </li>
                ))}
            </ul>
          </div>
          <div className="checklist">
            <h4>Оффбординг</h4>
            <ul>
              {checklist.filter(item => item.category === 'offboarding').length === 0 && <li className="muted">Пока пусто</li>}
              {checklist
                .filter(item => item.category === 'offboarding')
                .map(item => (
                  <li key={item.id} className="checklist__item">
                    <label>
                      <input type="checkbox" checked={item.done} onChange={() => toggleChecklist(item.id)} />
                      <span className={item.done ? 'done' : ''}>{item.title}</span>
                    </label>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'Изменения' && <ChangeTable changes={employee.changes} />}
    </div>
  );
};
