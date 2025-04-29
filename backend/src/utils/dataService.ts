import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Serviciu generic pentru manipularea datelor din fișiere JSON
 */
export class DataService<T extends { id: string }> {
    private filePath: string;
    private dataDir: string;

    constructor(fileName: string) {
        this.dataDir = path.join(__dirname, '..', 'data');
        this.filePath = path.join(this.dataDir, fileName);

        // Asigură-te că directorul data există
        if (!fs.existsSync(this.dataDir)) {
            try {
                fs.mkdirSync(this.dataDir, { recursive: true });
                console.log(`Directorul ${this.dataDir} a fost creat.`);
            } catch (error) {
                console.error(`Eroare la crearea directorului ${this.dataDir}:`, error);
            }
        }

        // Asigură-te că fișierul există
        if (!fs.existsSync(this.filePath)) {
            try {
                fs.writeFileSync(this.filePath, JSON.stringify([]));
                console.log(`Fișierul ${fileName} a fost creat.`);
            } catch (error) {
                console.error(`Eroare la crearea fișierului ${fileName}:`, error);
            }
        }
    }

    /**
     * Citește toate entitățile din fișier
     */
    async getAll(): Promise<T[]> {
        try {
            const data = await fs.promises.readFile(this.filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Eroare la citirea datelor:', error);
            return [];
        }
    }

    /**
     * Găsește o entitate după ID
     */
    async getById(id: string): Promise<T | null> {
        try {
            const items = await this.getAll();
            return items.find(item => item.id === id) || null;
        } catch (error) {
            console.error('Eroare la găsirea entității:', error);
            return null;
        }
    }

    /**
     * Adaugă o nouă entitate
     */
    async create(item: Omit<T, 'id'>): Promise<T> {
        try {
            const items = await this.getAll();
            const newItem = {
                ...item,
                id: uuidv4(),
                createdAt: new Date(),
                updatedAt: new Date()
            } as unknown as T;

            items.push(newItem);
            await fs.promises.writeFile(this.filePath, JSON.stringify(items, null, 2));
            return newItem;
        } catch (error) {
            console.error('Eroare la crearea entității:', error);
            throw error;
        }
    }

    /**
     * Actualizează o entitate existentă
     */
    async update(id: string, updates: Partial<T>): Promise<T | null> {
        try {
            const items = await this.getAll();
            const index = items.findIndex(item => item.id === id);

            if (index === -1) return null;

            const updatedItem = {
                ...items[index],
                ...updates,
                updatedAt: new Date()
            };

            items[index] = updatedItem;
            await fs.promises.writeFile(this.filePath, JSON.stringify(items, null, 2));
            return updatedItem;
        } catch (error) {
            console.error('Eroare la actualizarea entității:', error);
            return null;
        }
    }

    /**
     * Șterge o entitate după ID
     */
    async delete(id: string): Promise<boolean> {
        try {
            const items = await this.getAll();
            const filteredItems = items.filter(item => item.id !== id);

            if (filteredItems.length === items.length) return false;

            await fs.promises.writeFile(this.filePath, JSON.stringify(filteredItems, null, 2));
            return true;
        } catch (error) {
            console.error('Eroare la ștergerea entității:', error);
            return false;
        }
    }

    /**
     * Dezactivează (soft delete) o entitate
     */
    async deactivate(id: string): Promise<T | null> {
        try {
            return this.update(id, { isActive: false } as unknown as Partial<T>);
        } catch (error) {
            console.error('Eroare la dezactivarea entității:', error);
            return null;
        }
    }

    /**
     * Reactivează o entitate
     */
    async reactivate(id: string): Promise<T | null> {
        try {
            return this.update(id, { isActive: true } as unknown as Partial<T>);
        } catch (error) {
            console.error('Eroare la reactivarea entității:', error);
            return null;
        }
    }
}