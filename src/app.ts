import express, { Application, Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import router from "./app/routes";
import notFound from "./app/middlewares/notFound";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import { setupSwagger } from "./app/config/swagger";
const app: Application = express();

// CORS configuration for specific domains
const corsOptions: CorsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "https://bigsell.atpuae.com",
      "https://bigselladmin.atpuae.com",
      "https://bigsellv2frontend.vercel.app",
      "https://bigsellv2admin.vercel.app",
      "https://admin.bigsell.org",
      "https://bigsell.org",
      "http://api.atpuae.com",
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001"
    ];
    
    // Allow requests with no origin (like mobile apps, Postman, or curl)
    if (!origin) return callback(null, true);
    
    // Allow all localhost/127.0.0.1 origins in development
    if (process.env.NODE_ENV !== 'production') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With", 
    "Content-Type",
    "Accept",
    "Authorization",
    "Cache-Control",
    "Pragma",
    "X-CSRF-Token",
    "X-User-Role"
  ],
  exposedHeaders: ["Content-Disposition", "X-Total-Count"],
  optionsSuccessStatus: 204,
  preflightContinue: false,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Body parsers
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// swagger configuration - only in development to avoid file scanning issues in production
if (process.env.NODE_ENV !== 'production') {
  setupSwagger(app);
}

// application routes
app.use("/v1/api", router);

const entryRoute = (req: Request, res: Response) => {
  const message = "Big sell Surver is running...";
  res.send(message);
};

app.get("/", entryRoute);

//Not Found
app.use(notFound);

app.use(globalErrorHandler);

export default app;
