import express from 'express';
import cors from 'cors';
import { EmployeeRepository } from './repositories/employeeRepository.js';
import { AuditService } from './services/auditService.js';
import { EmployeeService } from './services/employeeService.js';
import { employeeRoutes } from './routes/employeeRoutes.js';
import { authMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(authMiddleware);

const repository = new EmployeeRepository();
const audit = new AuditService(repository);
const service = new EmployeeService(repository, audit);
app.use('/api', employeeRoutes(service));

app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
