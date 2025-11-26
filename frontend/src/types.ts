export type EmployeeStatus = 'active' | 'probation' | 'on_leave' | 'dismissed' | 'archived';
export type EmploymentType = 'full_time' | 'contract' | 'intern' | 'temporary';
export type WorkLocation = 'office' | 'remote' | 'hybrid';
export type WorkScheduleType = 'five_two' | 'shift' | 'flexible' | 'remote_first';
export type SkillLevel = 'beginner' | 'middle' | 'senior' | 'expert';

export interface EmployeeWithRelations {
  id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  date_of_birth: string;
  personal_ids: string[];
  hire_date: string;
  employment_type: EmploymentType;
  position: string;
  department: string;
  manager_id?: string;
  work_location: WorkLocation;
  email_work: string;
  phone_work: string;
  email_personal?: string;
  phone_personal?: string;
  work_schedule_type: WorkScheduleType;
  work_hours_per_week: number;
  status: EmployeeStatus;
  responsibilities: Responsibility[];
  skills: EmployeeSkill[];
  roles: EmployeeRole[];
  schedule_history: ScheduleHistory[];
  status_history: StatusHistory[];
  changes: ChangeLog[];
  onboarding_checklist?: ChecklistItem[];
  upcoming_event?: EventMarker;
}

export interface Responsibility {
  id: string;
  title: string;
  description: string;
  from_date: string;
  to_date?: string;
}

export interface EmployeeSkill {
  skill_id: string;
  level: SkillLevel;
  verified_by?: string;
  verified_at?: string;
  skill: Skill;
}

export interface Skill {
  id: string;
  name: string;
  description?: string;
}

export interface EmployeeRole {
  role_id: string;
  from_date: string;
  to_date?: string;
  role: Role;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface ScheduleHistory {
  from_date: string;
  to_date?: string;
  schedule_type: WorkScheduleType;
  hours_per_week: number;
  comment?: string;
}

export interface StatusHistory {
  from_status: EmployeeStatus;
  to_status: EmployeeStatus;
  changed_at: string;
  changed_by: string;
  reason?: string;
}

export interface ChangeLog {
  changed_at: string;
  changed_by: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  comment?: string;
}

export type EventMarkerType = 'probation_end' | 'review' | 'vacation_return' | 'custom';

export interface EventMarker {
  label: string;
  date: string;
  type: EventMarkerType;
}

export interface ChecklistItem {
  id: string;
  title: string;
  category: 'onboarding' | 'offboarding';
  done: boolean;
}

export interface EmployeePayload {
  first_name: string;
  last_name: string;
  middle_name?: string;
  date_of_birth: string;
  personal_ids: string[];
  hire_date: string;
  employment_type: EmploymentType;
  position: string;
  department: string;
  manager_id?: string;
  work_location: WorkLocation;
  email_work: string;
  phone_work: string;
  email_personal?: string;
  phone_personal?: string;
  work_schedule_type: WorkScheduleType;
  work_hours_per_week: number;
  status: EmployeeStatus;
  onboarding_checklist?: ChecklistItem[];
  upcoming_event?: EventMarker;
}

export const employmentOptions: Record<EmploymentType, string> = {
  full_time: 'Полная занятость',
  contract: 'Контракт',
  intern: 'Стажировка',
  temporary: 'Временный/проектный'
};

export const workLocationOptions: Record<WorkLocation, string> = {
  office: 'Офис',
  remote: 'Удаленно',
  hybrid: 'Гибрид'
};

export const scheduleOptions: Record<WorkScheduleType, string> = {
  five_two: '5/2',
  shift: 'Сменный',
  flexible: 'Гибкий график',
  remote_first: 'Удаленно в приоритете'
};

export const statusOptions: Record<EmployeeStatus, string> = {
  active: 'В штате',
  probation: 'Испытательный срок',
  on_leave: 'В отпуске/отгуле',
  dismissed: 'Уволен',
  archived: 'Архив'
};
