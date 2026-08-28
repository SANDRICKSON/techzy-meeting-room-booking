import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Employee } from '../domain/entities/Employee';
import { EmployeeRepository } from '../api/employeeRepository';

interface EmployeeState {
    employees: Employee[];
    loading: boolean;
    error: string | null;
    repository: EmployeeRepository;

    fetchEmployees: () => Promise<void>;
    getEmployee: (id: string) => Employee | undefined;
}

export const useEmployeeStore = create<EmployeeState>()(
    devtools((set, get) => {
        const repository = new EmployeeRepository();

        return {
            employees: [],
            loading: false,
            error: null,
            repository,

            fetchEmployees: async () => {
                set({ loading: true, error: null });
                try {
                    const employees = await repository.findAll();
                    set({ employees, loading: false });
                } catch (error) {
                    set({ error: (error as Error).message, loading: false });
                }
            },

            getEmployee: (id) => {
                return get().employees.find(e => e.id === id);
            }
        };
    })
);