import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { PORT } from './config.js';
import indexRoutes from './src/routes/index.routes.js';
import { notFound, errorHandler } from './src/middlewares/errorHandler.js';

const app = express();

// Middlewares
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json({ limit: '100kb' }));
app.use(morgan('dev'));
app.use(cookieParser());

// Rutas
app.use('/api', indexRoutes);

// Manejo de errores
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});