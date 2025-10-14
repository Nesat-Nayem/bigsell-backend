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
// CORS configuration for specific domains
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            "https://bigsell.atpuae.com",
            "https://bigselladmin.atpuae.com",
            "https://bigsellv2frontend.vercel.app",
            "https://bigsellv2admin.vercel.app",
            "https://admin.bigsell.org",
            "https://bigsell.org",
            "http://localhost:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001"
        ];
        // Allow requests with no origin (like mobile apps, Postman, or curl)
        if (!origin)
            return callback(null, true);
        // Allow all localhost/127.0.0.1 origins in development
        if (process.env.NODE_ENV !== 'production') {
            if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
                return callback(null, true);
            }
        }
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
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
app.use((0, cors_1.default)(corsOptions));
app.options("*", (0, cors_1.default)(corsOptions));
// Body parsers
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "50mb" }));
// swagger configuration - only in development to avoid file scanning issues in production
if (process.env.NODE_ENV !== 'production') {
    (0, swagger_1.setupSwagger)(app);
}
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
