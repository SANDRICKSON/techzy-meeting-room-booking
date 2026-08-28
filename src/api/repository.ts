import { v4 as uuidv4 } from 'uuid';

export interface Repository<T> {
    findAll(): Promise<T[]>;
    findById(id: string): Promise<T | null>;
    create(entity: Omit<T, 'id'>): Promise<T>;
    update(id: string, entity: Partial<T>): Promise<T>;
    delete(id: string): Promise<void>;
}

export abstract class BaseRepository<T extends { id: string }>
    implements Repository<T> {
    protected storageKey: string;

    constructor(storageKey: string, initialData: T[]) {
        this.storageKey = storageKey;
        this.initializeStorage(initialData);
    }

    private initializeStorage(initialData: T[]): void {
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify(initialData));
        }
    }

    async findAll(): Promise<T[]> {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    async findById(id: string): Promise<T | null> {
        const items = await this.findAll();
        return items.find(item => item.id === id) || null;
    }

    async create(entity: Omit<T, 'id'>): Promise<T> {
        const items = await this.findAll();
        const newItem = { ...entity, id: uuidv4() } as T;
        items.push(newItem);
        localStorage.setItem(this.storageKey, JSON.stringify(items));
        return newItem;
    }

    async update(id: string, entity: Partial<T>): Promise<T> {
        const items = await this.findAll();
        const index = items.findIndex(item => item.id === id);
        if (index === -1) throw new Error('Item not found');

        const updated = { ...items[index], ...entity, updatedAt: new Date().toISOString() };
        items[index] = updated;
        localStorage.setItem(this.storageKey, JSON.stringify(items));
        return updated;
    }

    async delete(id: string): Promise<void> {
        const items = await this.findAll();
        const filtered = items.filter(item => item.id !== id);
        localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    }
}