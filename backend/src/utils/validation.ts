import { z } from 'zod';
import { EmployeeStatus, EmploymentType, WorkLocation, WorkScheduleType, SkillLevel } from '../types/enums.js';

export const employeeBaseSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  middle_name: z.string().optional(),
  date_of_birth: z.string().regex(/\d{4}-\d{2}-\d{2}/, 'Invalid date'),
  personal_ids: z.array(z.string().min(1)).min(1),
  hire_date: z.string().regex(/\d{4}-\d{2}-\d{2}/, 'Invalid date'),
  employment_type: z.enum(['full_time', 'contract', 'intern', 'temporary'] satisfies EmploymentType[] as any),
  position: z.string().min(1),
  department: z.string().min(1),
  manager_id: z.string().uuid().optional(),
  work_location: z.enum(['office', 'remote', 'hybrid'] satisfies WorkLocation[] as any),
  email_work: z.string().email(),
  phone_work: z.string().min(5),
  email_personal: z.string().email().optional(),
  phone_personal: z.string().min(5).optional(),
  work_schedule_type: z.enum(['five_two', 'shift', 'flexible', 'remote_first'] satisfies WorkScheduleType[] as any),
  work_hours_per_week: z.number().int().min(1),
  status: z.enum(['active', 'probation', 'on_leave', 'dismissed', 'archived'] satisfies EmployeeStatus[] as any)
});

export const skillPayloadSchema = z.object({
  skill_id: z.string().uuid(),
  level: z.enum(['beginner', 'middle', 'senior', 'expert'] satisfies SkillLevel[] as any),
  verified_by: z.string().optional(),
  verified_at: z.string().optional()
});

export const rolePayloadSchema = z.object({
  role_id: z.string().uuid(),
  from_date: z.string(),
  to_date: z.string().optional()
});

export const responsibilitySchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  from_date: z.string(),
  to_date: z.string().optional()
});

export const scheduleHistorySchema = z.object({
  from_date: z.string(),
  to_date: z.string().optional(),
  schedule_type: z.enum(['five_two', 'shift', 'flexible', 'remote_first'] satisfies WorkScheduleType[] as any),
  hours_per_week: z.number().int().min(1),
  comment: z.string().optional()
});

export const statusChangeSchema = z.object({
  to_status: z.enum(['active', 'probation', 'on_leave', 'dismissed', 'archived'] satisfies EmployeeStatus[] as any),
  reason: z.string().optional()
});

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(10)
});
