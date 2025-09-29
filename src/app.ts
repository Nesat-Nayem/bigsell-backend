import express, { Application, Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import router from "./app/routes";
import notFound from "./app/middlewares/notFound";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import { setupSwagger } from "./app/config/swagger";
const app: Application = express();

// CORS configuration
const getAllowedOrigins = () => {
  // Default development origins
  const defaultOrigins = ["*"];

  // Production origins
  const productionOrigins = ["*"];

  // Environment-based origins
  const envOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
    : [];

  // Combine all origins
  return [...defaultOrigins, ...productionOrigins, ...envOrigins];
};

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Reflect the request origin to support credentials from any frontend
    callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
  exposedHeaders: ["Content-Disposition"],
  optionsSuccessStatus: 204,
};

// CORS middleware - Apply before other middlewares (enabled for admin compatibility)
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
