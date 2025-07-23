import express, {Application, Request,Response} from 'express';
import router from './app/routes';
import notFound from './app/middlewares/notFound';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import { setupSwagger } from './app/config/swagger';
const app:Application = express();
import cors from 'cors';

// parsers
app.use(express.json());

// CORS configuration - Allow all origins and methods for API testing
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    credentials: false // Set to false when using origin: '*'
}));

// Handle preflight requests
app.options('*', cors());

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