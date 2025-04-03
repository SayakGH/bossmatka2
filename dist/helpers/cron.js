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
const cron = __importStar(require("node-cron"));
const client_1 = require("@prisma/client");
const cronStart = () => __awaiter(void 0, void 0, void 0, function* () {
    const prisma = new client_1.PrismaClient();
    // reset consumer mothly invitation limit
    cron.schedule("0 9 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log(`Running Cron for reset daily result`);
            let getAllMarketsData = yield prisma.market.findMany({ where: { deletedAt: null } });
            if (getAllMarketsData) {
                for (let data of getAllMarketsData) {
                    yield prisma.market.update({
                        where: { id: data.id },
                        data: {
                            resultDate: null,
                            openPanna: null,
                            openResult: null,
                            closePanna: null,
                            closeResult: null
                        }
                    });
                }
            }
        }
        catch (err) {
            console.log(`Running Cron for reset daily result failed::=> ${err}`);
        }
    }), {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });
});
exports.default = cronStart;
//# sourceMappingURL=cron.js.map