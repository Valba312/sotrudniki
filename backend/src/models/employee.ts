import { EmployeeStatus, EmploymentType, WorkLocation, WorkScheduleType, SkillLevel } from '../types/enums.js';

export interface Employee {
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
}

export interface EmployeeWorkScheduleHistory {
  employee_id: string;
  from_date: string;
  to_date?: string;
  schedule_type: WorkScheduleType;
  hours_per_week: number;
  comment?: string;
}

export interface EmployeeResponsibility {
  id: string;
  employee_id: string;
  title: string;
  description: string;
  from_date: string;
  to_date?: string;
}

export interface Skill {
  id: string;
  name: string;
  description?: string;
}

export interface EmployeeSkill {
  employee_id: string;
  skill_id: string;
  level: SkillLevel;
  verified_by?: string;
  verified_at?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface EmployeeRole {
  employee_id: string;
  role_id: string;
  from_date: string;
  to_date?: string;
}

export interface EmployeeStatusChange {
  id: string;
  employee_id: string;
  from_status: EmployeeStatus;
  to_status: EmployeeStatus;
  changed_at: string;
  changed_by: string;
  reason?: string;
}

export interface EmployeeChangeLogEntry {
  id: string;
  employee_id: string;
  changed_at: string;
  changed_by: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  comment?: string;
}

export interface EmployeeWithRelations extends Employee {
  responsibilities: EmployeeResponsibility[];
  skills: Array<EmployeeSkill & { skill: Skill }>;
  roles: Array<EmployeeRole & { role: Role }>;
  schedule_history: EmployeeWorkScheduleHistory[];
  status_history: EmployeeStatusChange[];
  changes: EmployeeChangeLogEntry[];
}
