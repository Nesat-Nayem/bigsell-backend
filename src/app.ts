import express, { Application, Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import router from "./app/routes";
import notFound from "./app/middlewares/notFound";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import { setupSwagger } from "./app/config/swagger";
const app: Application = express();

app.use(cors());

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
