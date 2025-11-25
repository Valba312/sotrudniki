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

const tabs = ['Общие данные', 'Рабочее время', 'Обязанности', 'Навыки и роли', 'История статусов', 'Аудит'] as const;
const skillLevelLabels: Record<SkillLevel, string> = {
  beginner: 'Junior',
  middle: 'Middle',
  senior: 'Senior',
  expert: 'Expert'
};

type TabKey = (typeof tabs)[number];

export const EmployeeCard = ({ employee }: Props) => {
  const [activeTab, setActiveTab] = useState<TabKey>('Общие данные');
  const fullName = useMemo(
    () => `${employee.last_name} ${employee.first_name}${employee.middle_name ? ` ${employee.middle_name}` : ''}`,
    [employee]
  );
  const initials = useMemo(
    () => `${employee.first_name.charAt(0)}${employee.last_name.charAt(0)}`.toUpperCase(),
    [employee.first_name, employee.last_name]
  );

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
            <span className="badge badge--light">В штате с {employee.hire_date}</span>
          </div>
        </div>
        <div className="card__contacts">
          <div>{employee.email_work}</div>
          <div>{employee.phone_work}</div>
        </div>
      </header>

      <TabList tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'Общие данные' && (
        <div className="grid">
          <InfoRow label="Тип занятости" value={employmentOptions[employee.employment_type]} />
          <InfoRow label="Формат работы" value={workLocationOptions[employee.work_location]} />
          <InfoRow label="Дата рождения" value={employee.date_of_birth} />
          <InfoRow label="Менеджер" value={employee.manager_id ?? '—'} />
          <InfoRow label="Корп. контакты" value={`${employee.email_work} · ${employee.phone_work}`} />
          <InfoRow label="Личные ID" value={employee.personal_ids.join(', ')} />
          {employee.email_personal && <InfoRow label="Личный email" value={employee.email_personal} />}
          {employee.phone_personal && <InfoRow label="Личный телефон" value={employee.phone_personal} />}
        </div>
      )}

      {activeTab === 'Рабочее время' && (
        <div>
          <h4>Текущий график</h4>
          <InfoRow label="Тип" value={scheduleOptions[employee.work_schedule_type]} />
          <InfoRow label="Часов в неделю" value={`${employee.work_hours_per_week}`} />
          <h4>История графиков</h4>
          <Timeline
            items={employee.schedule_history.map(item => ({
              title: `${scheduleOptions[item.schedule_type]} · ${item.hours_per_week} ч/нед`,
              subtitle: item.comment,
              date: `${item.from_date}${item.to_date ? ` — ${item.to_date}` : ''}`
            }))}
          />
        </div>
      )}

      {activeTab === 'Обязанности' && (
        <ul className="list">
          {employee.responsibilities.length === 0 && <li className="muted">Пока нет добавленных зон ответственности</li>}
          {employee.responsibilities.map(res => (
            <li key={res.id}>
              <div className="list__title">{res.title}</div>
              <div className="muted">
                {res.from_date}
                {res.to_date ? ` — ${res.to_date}` : ''}
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
              {employee.skills.length === 0 && <li className="pill pill--muted">Ничего не указано</li>}
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
              {employee.roles.length === 0 && <li className="pill pill--muted">Нет назначенных ролей</li>}
              {employee.roles.map(role => (
                <li key={role.role_id} className="pill">
                  {role.role.name} · {role.from_date}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'История статусов' && (
        <Timeline
          items={employee.status_history.map(item => ({
            title: `${statusOptions[item.from_status]} → ${statusOptions[item.to_status]}`,
            subtitle: item.reason,
            date: item.changed_at
          }))}
        />
      )}

      {activeTab === 'Аудит' && <ChangeTable changes={employee.changes} />}
    </div>
  );
};
