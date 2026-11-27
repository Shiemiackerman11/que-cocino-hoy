import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { PORT } from './config.js';
import indexRoutes from './src/routes/index.routes.js';
import {notFound} from './src/middlewares/errorHandler.js';
import { errorHandler } from './src/middlewares/errorHandler.js';


const app = express();

//Middlewares
app.use(cors());
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