import express, {Application, Request,Response} from 'express';
import cors from 'cors';
import router from './app/routes';
import notFound from './app/middlewares/notFound';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import { setupSwagger } from './app/config/swagger';
const app:Application = express();

// CORS configuration
const corsOptions = {
  origin: [
    'https://api.atpuae.com',
    'http://localhost:3000',
    'http://localhost:5173',
    'https://localhost:3000',
    'https://localhost:5173',
    // Add any other frontend domains you want to allow
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

// parsers
app.use(express.json());
app.use(cors(corsOptions));

// swagger configuration
setupSwagger(app);

// application routes
app.use('/v1/api',router)

const entryRoute = (req:Request, res:Response)=>{
    const message = 'Big sell Surver is running...';
    res.send(message)
}

app.get('/', entryRoute)

//Not Found
app.use(notFound);

app.use(globalErrorHandler);

export default app;