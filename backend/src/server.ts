import express, { Application } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { seedData } from './utils/seedData';

import clientRoutes from './routes/clientRoutes';
import carRoutes from './routes/carRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import serviceRoutes from './routes/serviceRoutes';
import loyaltyRoutes from './routes/loyaltyRoutes';

//instanta aplicatiei
const app: Application = express();
const PORT = process.env.PORT || 54321;

//midleware-urile
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//verific si initializez fisierile de date daca exista
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}


//aici verific daca exista deja date de test sau le generez
const initData = async () => {
    const clientsPath = path.join(dataDir, 'clients.json');
    if (!fs.existsSync(clientsPath) || fs.readFileSync(clientsPath, 'utf8') === '[]') {
        console.log('Generez date de test...');
        await seedData();
    } else {
        console.log('Datele de test există deja.');
    }
};

//initializarea datelor
initData().catch(err => console.error('Eroare la initializarea datelor:', err));

//rutele api-urilor
app.use('/api/clients', clientRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/loyalty', loyaltyRoutes);

app.get('/', (req, res) => {
    res.send('API pentru Service Auto functioneaza!');
});

app.listen(PORT, () => {
    console.log(`Serverul ruleaza pe portul ${PORT}`);
});

export { app };
