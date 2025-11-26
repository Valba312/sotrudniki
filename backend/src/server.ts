import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { EmployeeRepository } from './repositories/employeeRepository.js';
import { AuditService } from './services/auditService.js';
import { EmployeeService } from './services/employeeService.js';
import { employeeRoutes } from './routes/employeeRoutes.js';
import { authMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { createDatabaseConnection } from './utils/db.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(authMiddleware);

const dbPath = process.env.DATABASE_URL || 'data/employee-card.sqlite';
const db = await createDatabaseConnection(dbPath);
const repository = new EmployeeRepository(db, dbPath);
const audit = new AuditService(repository);
const service = new EmployeeService(repository, audit);
app.use('/api', employeeRoutes(service));

app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
