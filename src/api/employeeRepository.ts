import { BaseRepository } from './repository';
import { Employee } from '../domain/entities/Employee';
import initialEmployees from '../data/employees.json';

export class EmployeeRepository extends BaseRepository<Employee> {
    constructor() {
        super('employees', initialEmployees as Employee[]);
    }

    async findByDepartment(department: string): Promise<Employee[]> {
        const employees = await this.findAll();
        return employees.filter(e => e.department === department);
    }

    async search(query: string): Promise<Employee[]> {
        const employees = await this.findAll();
        const lowerQuery = query.toLowerCase();
        return employees.filter(e =>
            e.name.toLowerCase().includes(lowerQuery) ||
            e.email.toLowerCase().includes(lowerQuery) ||
            e.department.toLowerCase().includes(lowerQuery)
        );
    }
}