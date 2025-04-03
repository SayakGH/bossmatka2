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
exports.GameUtils = void 0;
const logger_1 = require("../../helpers/logger");
const client_1 = require("@prisma/client");
class GameUtils {
    constructor() {
        this.prisma = new client_1.PrismaClient();
        this.logger = logger_1.Log.getLogger();
    }
    createGame(gameData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.game.create({
                data: {
                    gameName: gameData.gameName,
                    rate: gameData.rate,
                    adminsId: gameData.adminsId,
                    deletedAt: null,
                    fileName: gameData.files[0].originalname,
                    fileType: gameData.files[0].mimetype,
                    fileData: gameData.files[0].buffer,
                }
            });
        });
    }
    connectGameToActiveMarkets(gameId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Fetch all active markets (where deletedAt is null)
            const activeMarkets = yield this.prisma.market.findMany({
                where: {
                    deletedAt: null
                },
                include: {
                    games: true
                }
            });
            const marketsWithoutGame = activeMarkets.filter((market) => !market.games.some((game) => game.id === gameId));
            const updatePromises = marketsWithoutGame.map((market) => this.prisma.market.update({
                where: { id: market.id },
                data: {
                    games: {
                        connect: { id: gameId }
                    }
                }
            }));
            yield Promise.all(updatePromises);
        });
    }
    getAllGame() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.game.findMany({
                where: {
                    deletedAt: null
                }
            });
        });
    }
    getAllGameWithAdminId(adminsId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * limit;
            const games = yield this.prisma.game.findMany({
                where: {
                    adminsId,
                    deletedAt: null,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip: skip,
                take: limit,
            });
            const totalGames = yield this.prisma.game.count({
                where: {
                    adminsId,
                    deletedAt: null,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            return { games, totalGames };
        });
    }
    deleteGame(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.game.update({
                where: {
                    id
                },
                data: {
                    deletedAt: new Date()
                }
            });
        });
    }
    updateGame(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.game.update({
                where: {
                    id
                },
                data: data
            });
        });
    }
}
exports.GameUtils = GameUtils;
//# sourceMappingURL=gameUtils.js.map