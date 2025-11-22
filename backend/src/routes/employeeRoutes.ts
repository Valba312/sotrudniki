import { Router } from 'express';
import { z } from 'zod';
import { EmployeeService } from '../services/employeeService.js';
import { employeeBaseSchema, statusChangeSchema, skillPayloadSchema, rolePayloadSchema, responsibilitySchema, scheduleHistorySchema } from '../utils/validation.js';
import { authorize, AuthedRequest } from '../middleware/auth.js';
import { v4 as uuid } from 'uuid';

export function employeeRoutes(service: EmployeeService) {
  const router = Router();

  router.post('/employees', authorize(['hr', 'admin']), (req: AuthedRequest, res) => {
    const parsed = employeeBaseSchema.safeParse(req.body);
    if (!parsed.success || !req.user) return res.status(400).json(parsed.error);
    const employee = service.createEmployee(parsed.data, req.user.id);
    return res.status(201).json(employee);
  });

  router.get('/employees/:id', (req, res) => {
    const employee = service.getEmployee(req.params.id);
    if (!employee) return res.status(404).json({ message: 'not found' });
    return res.json(employee);
  });

  router.put('/employees/:id', authorize(['hr', 'admin']), (req: AuthedRequest, res) => {
    const parsed = employeeBaseSchema.safeParse(req.body);
    if (!parsed.success || !req.user) return res.status(400).json(parsed.error);
    const employee = service.replaceEmployee(req.params.id, parsed.data, req.user.id);
    if (!employee) return res.status(404).json({ message: 'not found' });
    return res.json(employee);
  });

  router.patch('/employees/:id', authorize(['hr', 'admin', 'manager']), (req: AuthedRequest, res) => {
    if (!req.user) return res.status(403).json({ message: 'forbidden' });
    const existing = service.getEmployee(req.params.id);
    if (!existing) return res.status(404).json({ message: 'not found' });
    const parsed = employeeBaseSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const updated = service.updateEmployee(req.params.id, parsed.data, req.user.id);
    return res.json(updated);
  });

  router.get('/employees', (req, res) => {
    const { status, department, role, skill, manager_id, q, page = '1', pageSize = '10' } = req.query;
    const employees = service.listEmployees({
      status: status as any,
      department: department as string | undefined,
      role: role as string | undefined,
      skill: skill as string | undefined,
      manager_id: manager_id as string | undefined,
      q: q as string | undefined
    });
    const p = Number(page);
    const ps = Number(pageSize);
    const start = (p - 1) * ps;
    const paged = employees.slice(start, start + ps);
    res.json({ total: employees.length, page: p, pageSize: ps, data: paged });
  });

  router.post('/employees/:id/status', authorize(['hr', 'admin', 'manager']), (req: AuthedRequest, res) => {
    if (!req.user) return res.status(403).json({ message: 'forbidden' });
    const parsed = statusChangeSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const result = service.changeStatus(req.params.id, parsed.data.to_status, req.user.id, parsed.data.reason);
    if (!result) return res.status(404).json({ message: 'not found' });
    return res.status(201).json(result);
  });

  router.get('/employees/:id/status-history', (req, res) => {
    return res.json(service.getStatusHistory(req.params.id));
  });

  router.post('/employees/:id/skills', authorize(['hr', 'admin', 'manager']), (req: AuthedRequest, res) => {
    const payload = z.array(skillPayloadSchema).safeParse(req.body);
    if (!payload.success) return res.status(400).json(payload.error);
    const updated = service.setSkills(req.params.id, payload.data.map(s => ({ ...s, employee_id: req.params.id })));
    return res.json(updated);
  });

  router.delete('/employees/:id/skills/:skillId', authorize(['hr', 'admin', 'manager']), (req, res) => {
    service.removeSkill(req.params.id, req.params.skillId);
    return res.status(204).send();
  });

  router.post('/employees/:id/roles', authorize(['hr', 'admin', 'manager']), (req: AuthedRequest, res) => {
    const payload = z.array(rolePayloadSchema).safeParse(req.body);
    if (!payload.success) return res.status(400).json(payload.error);
    const updated = service.setRoles(req.params.id, payload.data.map(r => ({ ...r, employee_id: req.params.id })));
    return res.json(updated);
  });

  router.delete('/employees/:id/roles/:roleId', authorize(['hr', 'admin', 'manager']), (req, res) => {
    service.removeRole(req.params.id, req.params.roleId);
    return res.status(204).send();
  });

  router.post('/employees/:id/responsibilities', authorize(['hr', 'admin', 'manager']), (req: AuthedRequest, res) => {
    const payload = responsibilitySchema.safeParse(req.body);
    if (!payload.success) return res.status(400).json(payload.error);
    const created = service.addResponsibility(req.params.id, payload.data);
    return res.status(201).json(created);
  });

  router.post('/employees/:id/schedules', authorize(['hr', 'admin', 'manager']), (req: AuthedRequest, res) => {
    const payload = scheduleHistorySchema.safeParse(req.body);
    if (!payload.success) return res.status(400).json(payload.error);
    const created = service.addScheduleHistory(req.params.id, payload.data);
    return res.status(201).json(created);
  });

  router.get('/employees/:id/changes', (req, res) => {
    const { page = '1', pageSize = '10' } = req.query;
    const changes = service.getChangeLog(req.params.id);
    const p = Number(page);
    const ps = Number(pageSize);
    const start = (p - 1) * ps;
    return res.json({ total: changes.length, page: p, pageSize: ps, data: changes.slice(start, start + ps) });
  });

  router.post('/skills', authorize(['hr', 'admin']), (req, res) => {
    const name = req.body?.name;
    if (!name) return res.status(400).json({ message: 'name required' });
    const created = service.addSkillDefinition(name, req.body?.description);
    return res.status(201).json(created);
  });

  router.post('/roles', authorize(['hr', 'admin']), (req, res) => {
    const name = req.body?.name;
    if (!name) return res.status(400).json({ message: 'name required' });
    const created = service.addRoleDefinition(name, req.body?.description);
    return res.status(201).json(created);
  });

  router.get('/health', (_req, res) => res.json({ status: 'ok' }));

  return router;
}
