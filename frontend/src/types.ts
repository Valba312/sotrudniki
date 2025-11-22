export type EmployeeStatus = 'active' | 'probation' | 'on_leave' | 'dismissed' | 'archived';
export type SkillLevel = 'beginner' | 'middle' | 'senior' | 'expert';

export interface EmployeeWithRelations {
  id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  date_of_birth: string;
  personal_ids: string[];
  hire_date: string;
  employment_type: string;
  position: string;
  department: string;
  manager_id?: string;
  work_location: string;
  email_work: string;
  phone_work: string;
  email_personal?: string;
  phone_personal?: string;
  work_schedule_type: string;
  work_hours_per_week: number;
  status: EmployeeStatus;
  responsibilities: Responsibility[];
  skills: EmployeeSkill[];
  roles: EmployeeRole[];
  schedule_history: ScheduleHistory[];
  status_history: StatusHistory[];
  changes: ChangeLog[];
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
  schedule_type: string;
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
