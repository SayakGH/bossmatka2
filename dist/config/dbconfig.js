"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBConfig = void 0;
const client_1 = require("@prisma/client"); // Import Prisma Client
const logger_1 = require("../helpers/logger");
require('dotenv').config();
class DBConfig {
    constructor() {
        this.logger = logger_1.Log.getLogger();
        this.prisma = new client_1.PrismaClient(); // Initialize Prisma Client in the constructor
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.prisma.$connect();
                this.logger.info('Database connected successfully.');
            }
            catch (error) {
                this.logger.error('Error connecting to the database:', error);
            }
        });
    }
}
exports.DBConfig = DBConfig;
//# sourceMappingURL=dbconfig.js.map