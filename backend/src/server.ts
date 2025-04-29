import express, { Application } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { seedData } from './utils/seedData';

// Importăm rutele
import clientRoutes from './routes/clientRoutes';
import carRoutes from './routes/carRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import serviceRoutes from './routes/serviceRoutes';

// Inițializare aplicație Express
const app: Application = express();
const PORT = process.env.PORT || 54321; // Un port foarte neobișnuit

// Middleware-uri
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Verifică și inițializează fișierele de date dacă nu există
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}




// Verificăm dacă există deja date sau trebuie să le generăm
const initData = async () => {
    const clientsPath = path.join(dataDir, 'clients.json');
    if (!fs.existsSync(clientsPath) || fs.readFileSync(clientsPath, 'utf8') === '[]') {
        console.log('Generez date de test...');
        await seedData();
    } else {
        console.log('Datele de test există deja.');
    }
};

// Inițializăm datele
initData().catch(err => console.error('Eroare la inițializarea datelor:', err));

// Definim rutele API
app.use('/api/clients', clientRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/services', serviceRoutes);

// Rută de bază pentru a verifica dacă serverul funcționează
app.get('/', (req, res) => {
    res.send('API pentru Service Auto funcționează!');
});

// Pornirea serverului
app.listen(PORT, () => {
    console.log(`Serverul rulează pe portul ${PORT}`);
});

// Nu exportăm app ca default
export { app };

// Definim rutele API
app.use('/api/clients', clientRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/services', serviceRoutes);

// Rută de bază pentru a verifica dacă serverul funcționează
app.get('/', (req, res) => {
    res.send('API pentru Service Auto funcționează!');
});

// Pornirea serverului
app.listen(PORT, () => {
    console.log(`Serverul rulează pe portul ${PORT}`);
});
export default app;