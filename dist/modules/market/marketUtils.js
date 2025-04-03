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
exports.MarketUtils = void 0;
const logger_1 = require("../../helpers/logger");
const client_1 = require("@prisma/client");
class MarketUtils {
    constructor() {
        this.prisma = new client_1.PrismaClient();
        this.logger = logger_1.Log.getLogger();
        this.formatTimeTo12Hour = (time) => {
            const timeStr = String(time).trim();
            const parts = timeStr.split(".");
            let hour = parts[0] ? Number(parts[0]) : 0;
            let minute = 0;
            if (parts[1]) {
                if (parts[1].length === 1) {
                    minute = Number(parts[1]) * 10;
                }
                else if (parts[1].length === 2) {
                    minute = Number(parts[1]);
                }
            }
            if (isNaN(hour) || hour < 0 || hour > 23) {
                throw new Error("Invalid hour value");
            }
            if (isNaN(minute) || minute < 0 || minute >= 60) {
                throw new Error("Invalid minute value");
            }
            const period = hour >= 12 ? "PM" : "AM";
            const formattedHour = hour % 12 || 12;
            return `${formattedHour}:${minute < 10 ? "0" : ""}${minute} ${period}`;
        };
    }
    generateRandomId() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    // Function to ensure uniqueness of the 6-digit ID
    generateUniqueMarketId() {
        return __awaiter(this, void 0, void 0, function* () {
            let marketId = this.generateRandomId();
            let exists = yield this.prisma.market.findUnique({
                where: { marketId },
            });
            while (exists) {
                marketId = this.generateRandomId();
                exists = yield this.prisma.market.findUnique({
                    where: { marketId },
                });
            }
            return marketId;
        });
    }
    createMarket(marketData) {
        return __awaiter(this, void 0, void 0, function* () {
            const marketId = yield this.generateUniqueMarketId();
            const newMarket = yield this.prisma.market.create({
                data: {
                    marketId,
                    status: "active",
                    marketName: marketData.marketName,
                    openTime: marketData.openTime,
                    closeTime: marketData.closeTime,
                    adminsId: marketData.adminsId,
                    deletedAt: null,
                    weekdayStatus: marketData.weekdayStatus,
                },
            });
            yield this.connectActiveGamesToMarket(newMarket.id);
            return newMarket;
        });
    }
    connectActiveGamesToMarket(marketId) {
        return __awaiter(this, void 0, void 0, function* () {
            const activeGames = yield this.prisma.game.findMany({
                where: {
                    deletedAt: null,
                },
            });
            const updatePromises = activeGames.map((game) => this.prisma.market.update({
                where: { id: marketId },
                data: {
                    games: {
                        connect: { id: game.id },
                    },
                },
            }));
            yield Promise.all(updatePromises);
        });
    }
    getMarket(id, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * limit;
            const markets = yield this.prisma.market.findMany({
                where: {
                    adminsId: id,
                    deletedAt: null,
                },
                orderBy: {
                    createdAt: "desc",
                },
                skip: skip,
                take: limit,
            });
            const totalMarkets = yield this.prisma.market.count({
                where: {
                    adminsId: id,
                    deletedAt: null,
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
            return { markets, totalMarkets };
        });
    }
    updateMarket(id, marketData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.market.update({
                where: { id },
                data: {
                    openTime: marketData.openTime,
                    closeTime: marketData.closeTime,
                    marketName: marketData.marketName,
                    adminsId: marketData.adminsId,
                    resultDate: marketData.resultDate,
                    weekdayStatus: marketData.weekdayStatus,
                },
            });
        });
    }
    deleteMarket(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.market.update({
                where: { id },
                data: {
                    deletedAt: new Date(),
                },
            });
        });
    }
}
exports.MarketUtils = MarketUtils;
//# sourceMappingURL=marketUtils.js.map