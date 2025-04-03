"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const bodyParser = __importStar(require("body-parser")); // pull information from HTML POST (express4)
const dotenv = __importStar(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const logger_1 = require("./helpers/logger");
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dbconfig_1 = require("./config/dbconfig");
const jm_ez_l10n_1 = __importDefault(require("jm-ez-l10n")); //Load language files, in your main server.js/index.js file
const swagger_ui_express_1 = require("swagger-ui-express");
const compression_1 = __importDefault(require("compression"));
const swagger_1 = require("./config/swagger");
const routes_1 = require("./routes");
const cron_1 = __importDefault(require("./helpers/cron"));
dotenv.config();
class App {
    constructor() {
        this.logger = logger_1.Log.getLogger();
        const NODE_ENV = process.env.ENVIRONMENT || "";
        const PORT = process.env.PORT || 3000;
        this.app = (0, express_1.default)();
        //DB Connection
        const dbConfig = new dbconfig_1.DBConfig();
        dbConfig.connect();
        this.app.use((0, helmet_1.default)()); //Helmet helps secure Express apps by setting HTTP response headers.
        this.app.use((0, cors_1.default)());
        this.app.all("/*", (req, res, next) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Request-Headers", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Headers, x-auth-token, x-l10n-locale, Cache-Control, timeout, authorization");
            res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            next();
        });
        this.app.use((0, morgan_1.default)("dev")); // log every request to the console
        this.app.use((0, compression_1.default)()); // Through the use of this compression, we can improve the performance of our Node.js applications as our payload size is reduced drastically
        jm_ez_l10n_1.default.setTranslationsFile("en", "src/language/translation.en.json");
        this.app.use(jm_ez_l10n_1.default.enableL10NExpress);
        this.app.use(bodyParser.json({ limit: "50mb" }));
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json(), (error, req, res, next) => {
            if (error) {
                return res.status(400).json({ error: req.t("ERR_GENRIC_SYNTAX") });
            }
            next();
        });
        const routes = new routes_1.Routes(NODE_ENV);
        this.app.use("/api/v1", routes.path());
        this.app.use(bodyParser.json({ type: "application/vnd.api+json" }));
        this.app.use("/api/swagger", swagger_ui_express_1.serve, (0, swagger_ui_express_1.setup)(swagger_1.swaggerDocs));
        this.app.listen(PORT, () => {
            this.logger.info(`The server is running in port localhost: ${process.env.PORT}`);
            // swaggerDocs(this.app, +PORT)
        });
        this.app.all("/*", (req, res) => {
            res.send("AJ online");
        });
        (0, cron_1.default)();
    }
}
exports.App = App;
//# sourceMappingURL=server.js.map