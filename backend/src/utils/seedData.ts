import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Client, Car, Appointment, Service } from '../models/interfaces';

// Funcție pentru generarea datelor de test
export const seedData = async () => {
    const dataDir = path.join(__dirname, '..', 'data');

    // Creează directorul dacă nu există
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    // Generăm câțiva clienți
    const clients: Client[] = [
        {
            id: uuidv4(),
            firstName: 'Ion',
            lastName: 'Popescu',
            phoneNumbers: ['0722123456'],
            email: 'ion.popescu@example.com',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: uuidv4(),
            firstName: 'Maria',
            lastName: 'Ionescu',
            phoneNumbers: ['0733123456', '0744123456'],
            email: 'maria.ionescu@example.com',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: uuidv4(),
            firstName: 'Andrei',
            lastName: 'Dumitrescu',
            phoneNumbers: ['0755123456'],
            email: 'andrei.dumitrescu@example.com',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];

    // Generăm mașini pentru fiecare client
    const cars: Car[] = [
        {
            id: uuidv4(),
            clientId: clients[0].id,
            licensePlate: 'B 123 ABC',
            vin: 'WVWZZZ1JZXW123456',
            make: 'Volkswagen',
            model: 'Golf',
            year: 2018,
            engineType: 'diesel',
            engineCapacity: 1998,
            horsePower: 150,
            kilowatts: 110.33,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: uuidv4(),
            clientId: clients[1].id,
            licensePlate: 'B 456 DEF',
            vin: 'WAUZZZ8TZXA654321',
            make: 'Audi',
            model: 'A4',
            year: 2020,
            engineType: 'gasoline',
            engineCapacity: 1984,
            horsePower: 190,
            kilowatts: 139.75,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: uuidv4(),
            clientId: clients[1].id,
            licensePlate: 'B 789 GHI',
            vin: 'WBAZW31080L789012',
            make: 'BMW',
            model: 'X3',
            year: 2021,
            engineType: 'hybrid',
            engineCapacity: 1998,
            horsePower: 292,
            kilowatts: 214.77,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: uuidv4(),
            clientId: clients[2].id,
            licensePlate: 'B 101 JKL',
            vin: 'SB1BR56L50E987654',
            make: 'Toyota',
            model: 'Corolla',
            year: 2019,
            engineType: 'hybrid',
            engineCapacity: 1798,
            horsePower: 122,
            kilowatts: 89.73,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];

    // Creăm date pentru setare corectă a datelor programărilor
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Setăm orele corect
    const todayAt10 = new Date(today);
    todayAt10.setHours(10, 0, 0, 0);

    const tomorrowAt14 = new Date(tomorrow);
    tomorrowAt14.setHours(14, 0, 0, 0);

    const yesterdayAt9 = new Date(yesterday);
    yesterdayAt9.setHours(9, 0, 0, 0);

    // Generăm câteva programări
    const appointments: Appointment[] = [
        {
            id: uuidv4(),
            clientId: clients[0].id,
            carId: cars[0].id,
            date: todayAt10,
            duration: 60,
            serviceType: 'Revizie periodica',
            contactMethod: 'phone',
            status: 'scheduled',
            notes: 'Clientul va veni personal cu masina',
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: uuidv4(),
            clientId: clients[1].id,
            carId: cars[1].id,
            date: tomorrowAt14,
            duration: 120, // 120 minute
            serviceType: 'Reparație frane',
            contactMethod: 'email',
            status: 'scheduled',
            notes: 'Clientul a raportat zgomote la franare',
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: uuidv4(),
            clientId: clients[2].id,
            carId: cars[3].id,
            date: yesterdayAt9,
            duration: 90, // 90 minute
            serviceType: 'Verificare sistem hibrid',
            contactMethod: 'in-person',
            status: 'completed',
            notes: 'Bateria nu mai tine la fel de mult',
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];

    // Generăm un serviciu completat pentru programarea finalizată
    const services: Service[] = [
        {
            id: uuidv4(),
            appointmentId: appointments[2].id,
            initialState: {
                visualIssues: ['Zgârietură pe ușa șoferului'],
                clientReportedIssues: ['Bateria se descarcă rapid', 'Autonomie scăzută în modul electric'],
                purpose: 'Verificare sistem hibrid'
            },
            operations: {
                description: 'Verificare completă sistem hibrid. Actualizare software management baterie.',
                replacedParts: ['Filtru habitaclu'],
                detectedIssues: ['Baterie hibrid degradată - autonomie 70% din capacitatea inițială'],
                resolvedIssues: true
            },
            actualDuration: 100, // 100 minute
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];

    // Scriem datele în fișiere JSON
    await fs.promises.writeFile(path.join(dataDir, 'clients.json'), JSON.stringify(clients, null, 2));
    await fs.promises.writeFile(path.join(dataDir, 'cars.json'), JSON.stringify(cars, null, 2));
    await fs.promises.writeFile(path.join(dataDir, 'appointments.json'), JSON.stringify(appointments, null, 2));
    await fs.promises.writeFile(path.join(dataDir, 'services.json'), JSON.stringify(services, null, 2));

    console.log('Date de test generate cu succes!');
};

// Rulați această funcție pentru a genera date de test
if (require.main === module) {
    seedData().catch(err => console.error('Eroare la generarea datelor de test:', err));
}