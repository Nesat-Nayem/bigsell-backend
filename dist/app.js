"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./app/routes"));
const notFound_1 = __importDefault(require("./app/middlewares/notFound"));
const globalErrorHandler_1 = __importDefault(require("./app/middlewares/globalErrorHandler"));
const swagger_1 = require("./app/config/swagger");
const app = (0, express_1.default)();
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
const corsOptions = {
    origin: true,
    credentials: true,
    optionsSuccessStatus: 200,
};
// CORS middleware - Apply before other middlewares
app.use((0, cors_1.default)(corsOptions));
// Body parsers
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "50mb" }));
// swagger configuration
(0, swagger_1.setupSwagger)(app);
// application routes
app.use("/v1/api", routes_1.default);
const entryRoute = (req, res) => {
    const message = "Big sell Surver is running...";
    res.send(message);
};
app.get("/", entryRoute);
//Not Found
app.use(notFound_1.default);
app.use(globalErrorHandler_1.default);
exports.default = app;
