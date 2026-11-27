import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { PORT } from './config.js';
import { CLIENT_URL } from './src/config/env.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import indexRoutes from './src/routes/index.routes.js';

const app = express();

//Middlewares
app.use(cors({
    origin(origin, callback) {
        const esOrigenLocal = (() => {
            if (process.env.NODE_ENV === 'production' || !origin) return false;
            try {
                const url = new URL(origin);
                return url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname);
            } catch {
                return false;
            }
        })();
        callback(null, !origin || origin === CLIENT_URL || esOrigenLocal);
    },
    credentials: true,
}));
app.use(express.json({ limit: '100kb' }));
app.use(morgan('dev'));

//Rutas
app.use('/api', indexRoutes);

//Manejo de errores
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
