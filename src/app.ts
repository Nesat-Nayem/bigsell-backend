import express, { Application, Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import router from "./app/routes";
import notFound from "./app/middlewares/notFound";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import { setupSwagger } from "./app/config/swagger";
const app: Application = express();

// CORS configuration for specific domains
const corsOptions: CorsOptions = {
  origin: [
    "https://bigsell.atpuae.com",
    "https://bigselladmin.atpuae.com",
    "https://bigsellv2frontend.vercel.app",
    "https://bigsellv2admin.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With", 
    "Content-Type",
    "Accept",
    "Authorization",
    "Cache-Control",
    "Pragma"
  ],
  exposedHeaders: ["Content-Disposition"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Body parsers
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// swagger configuration
setupSwagger(app);

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
