"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./app/routes"));
const notFound_1 = __importDefault(require("./app/middlewares/notFound"));
const globalErrorHandler_1 = __importDefault(require("./app/middlewares/globalErrorHandler"));
const swagger_1 = require("./app/config/swagger");
const app = (0, express_1.default)();
const cors_1 = __importDefault(require("cors"));
// parsers
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// swagger configuration
(0, swagger_1.setupSwagger)(app);
// application routes
app.use('/v1/api', routes_1.default);
const entryRoute = (req, res) => {
    const message = 'Surver is running...';
    res.send(message);
};
app.get('/', entryRoute);
//Not Found
app.use(notFound_1.default);
app.use(globalErrorHandler_1.default);
exports.default = app;
