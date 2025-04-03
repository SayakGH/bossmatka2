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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardUtils = void 0;
const logger_1 = require("../../helpers/logger");
const bidUtils_1 = require("../bid/bidUtils");
const client_1 = require("@prisma/client");
const moment_1 = __importDefault(require("moment"));
class DashboardUtils {
    constructor() {
        this.prisma = new client_1.PrismaClient();
        this.logger = logger_1.Log.getLogger();
        this.bidUtils = new bidUtils_1.BidUtils();
        this.getUserTransactions = (userId, page, limit, startDate, endDate) => __awaiter(this, void 0, void 0, function* () {
            try {
                const skip = (page - 1) * limit;
                const dateFilter = {};
                if (startDate) {
                    dateFilter.gte = startDate;
                }
                if (endDate) {
                    dateFilter.lte = endDate;
                }
                const transactions = yield this.prisma.transaction.findMany({
                    where: Object.assign({ userId: userId, deletedAt: null }, (Object.keys(dateFilter).length && { createdAt: dateFilter })),
                    orderBy: {
                        createdAt: 'desc'
                    },
                    skip: skip,
                    take: limit
                });
                const totalTransactions = yield this.prisma.transaction.count({
                    where: Object.assign({ userId: userId, deletedAt: null }, (Object.keys(dateFilter).length && { createdAt: dateFilter }))
                });
                return { transactions, totalTransactions };
            }
            catch (err) {
                throw new Error(`Failed to fetch transactions: ${err.message}`);
            }
        });
        this.formatTimeTo12Hour = (time) => {
            const timeStr = String(time).trim();
            const parts = timeStr.split('.');
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
                throw new Error('Invalid hour value');
            }
            if (isNaN(minute) || minute < 0 || minute >= 60) {
                throw new Error('Invalid minute value');
            }
            const period = hour >= 12 ? 'PM' : 'AM';
            const formattedHour = hour % 12 || 12;
            return `${formattedHour}:${minute < 10 ? '0' : ''}${minute} ${period}`;
        };
        this.getUserTransactionsByType = (adminId, page, limit, type, todayFilter) => __awaiter(this, void 0, void 0, function* () {
            try {
                const skip = (page - 1) * limit;
                const users = yield this.prisma.users.findMany({
                    where: {
                        adminsId: adminId,
                        deletedAt: null,
                    },
                    select: {
                        id: true,
                    },
                });
                const userIds = users.map(user => user.id);
                if (userIds.length === 0) {
                    return { transactions: [], totalTransactions: 0 };
                }
                let transactionFilter = {
                    userId: { in: userIds },
                    deletedAt: null,
                    type,
                };
                if (todayFilter) {
                    const startOfDay = (0, moment_1.default)().tz('Asia/Kolkata').startOf('day').toDate();
                    const endOfDay = (0, moment_1.default)().tz('Asia/Kolkata').endOf('day').toDate();
                    transactionFilter.createdAt = {
                        gte: startOfDay,
                        lte: endOfDay,
                    };
                }
                const transactions = yield this.prisma.transaction.findMany({
                    where: transactionFilter,
                    include: {
                        user: {
                            select: { id: true, fullName: true, phoneNumber: true },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    skip: skip,
                    take: limit,
                });
                const totalTransactions = yield this.prisma.transaction.count({
                    where: transactionFilter,
                });
                return { transactions, totalTransactions };
            }
            catch (err) {
                throw new Error(`Failed to fetch transactions: ${err.message}`);
            }
        });
        this.updateStatusAndGiveAmount = (userId, txnId, status, txnType, amount) => __awaiter(this, void 0, void 0, function* () {
            if (txnType == 'ADDITION' && status == 'ACCEPTED') {
                yield this.prisma.transaction.update({
                    where: { id: +txnId },
                    data: { status }
                });
                yield this.prisma.users.update({
                    where: { id: +userId },
                    data: {
                        wallet: {
                            increment: amount
                        }
                    }
                });
                return true;
            }
            if (txnType == 'WITHDRAWAL' && status == 'ACCEPTED') {
                yield this.prisma.transaction.update({
                    where: { id: +txnId },
                    data: { status }
                });
                // await this.prisma.users.update({
                //   where: { id: +userId },
                //   data: {
                //     wallet: {
                //       decrement: amount
                //     }
                //   }
                // })
                return true;
            }
            yield this.prisma.transaction.update({
                where: { id: +txnId },
                data: { status }
            });
            return true;
        });
        this.getTotalGames = () => __awaiter(this, void 0, void 0, function* () {
            return this.prisma.game.count({
                where: { deletedAt: null },
            });
        });
        this.getTotalMarkets = () => __awaiter(this, void 0, void 0, function* () {
            return this.prisma.market.count({
                where: { deletedAt: null },
            });
        });
        this.getTotalBidsActive = () => __awaiter(this, void 0, void 0, function* () {
            const result = yield this.prisma.bid.aggregate({
                where: { status: 'pending', deletedAt: null },
                _sum: {
                    bidAmount: true,
                },
            });
            return result._sum.bidAmount || 0;
        });
        this.getTotalBids = () => __awaiter(this, void 0, void 0, function* () {
            const result = yield this.prisma.bid.aggregate({
                where: { deletedAt: null },
                _sum: {
                    bidAmount: true,
                },
            });
            return result._sum.bidAmount || 0;
        });
        this.getTotalDeposits = () => __awaiter(this, void 0, void 0, function* () {
            return this.prisma.transaction.aggregate({
                _sum: {
                    amount: true,
                },
                where: {
                    type: 'ADDITION',
                    status: 'ACCEPTED'
                },
            });
        });
        this.getTotalDepositsToday = () => __awaiter(this, void 0, void 0, function* () {
            const startOfDay = (0, moment_1.default)().tz('Asia/Kolkata').startOf('day').toDate();
            const endOfDay = (0, moment_1.default)().tz('Asia/Kolkata').endOf('day').toDate();
            return this.prisma.transaction.aggregate({
                _sum: {
                    amount: true,
                },
                where: {
                    type: 'ADDITION',
                    createdAt: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                    status: 'ACCEPTED'
                },
            });
        });
        this.getTotalWithdrawals = () => __awaiter(this, void 0, void 0, function* () {
            return this.prisma.transaction.aggregate({
                _sum: {
                    amount: true,
                },
                where: {
                    type: 'WITHDRAWAL',
                    status: 'ACCEPTED'
                },
            });
        });
        this.getActiveBidsForToday = () => __awaiter(this, void 0, void 0, function* () {
            // IST timezone adjustment (UTC+5:30)
            const startOfDay = (0, moment_1.default)().tz('Asia/Kolkata').startOf('day').toDate();
            const endOfDay = (0, moment_1.default)().tz('Asia/Kolkata').endOf('day').toDate();
            const result = yield this.prisma.bid.aggregate({
                where: {
                    deletedAt: null,
                    date: {
                        gte: startOfDay, // Greater than or equal to the start of the day in IST
                        lte: endOfDay, // Less than or equal to the end of the day in IST
                    },
                },
                _sum: {
                    bidAmount: true,
                },
            });
            return result._sum.bidAmount || 0; // Return 0 if no records exist
        });
        this.getTotalWithdrawalsToday = () => __awaiter(this, void 0, void 0, function* () {
            const startOfDay = (0, moment_1.default)().tz('Asia/Kolkata').startOf('day').toDate();
            const endOfDay = (0, moment_1.default)().tz('Asia/Kolkata').endOf('day').toDate();
            return this.prisma.transaction.aggregate({
                _sum: {
                    amount: true,
                },
                where: {
                    type: 'WITHDRAWAL',
                    createdAt: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                    status: 'ACCEPTED'
                },
            });
        });
        this.getTotalWalletMoney = () => __awaiter(this, void 0, void 0, function* () {
            return this.prisma.users.aggregate({
                _sum: {
                    wallet: true,
                },
                where: {
                    deletedAt: null
                }
            });
        });
        this.getTotalUsers = () => __awaiter(this, void 0, void 0, function* () {
            return this.prisma.users.count({
                where: { deletedAt: null },
            });
        });
        this.getTotalTodaysUsers = () => __awaiter(this, void 0, void 0, function* () {
            const startOfDay = (0, moment_1.default)().tz('Asia/Kolkata').startOf('day').toDate();
            const endOfDay = (0, moment_1.default)().tz('Asia/Kolkata').endOf('day').toDate();
            return this.prisma.users.count({
                where: {
                    createdAt: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                    deletedAt: null
                },
            });
        });
        this.getTotalWinningBids = () => __awaiter(this, void 0, void 0, function* () {
            return this.prisma.bid.aggregate({
                _sum: {
                    winAmount: true,
                },
                where: {
                    winStatus: true,
                    deletedAt: null,
                },
            });
        });
        this.getTotalWinningBidsToday = () => __awaiter(this, void 0, void 0, function* () {
            const startOfDay = (0, moment_1.default)().tz('Asia/Kolkata').startOf('day').toDate();
            const endOfDay = (0, moment_1.default)().tz('Asia/Kolkata').endOf('day').toDate();
            const result = yield this.prisma.bid.aggregate({
                _sum: {
                    winAmount: true,
                },
                where: {
                    winStatus: true,
                    deletedAt: null,
                    createdAt: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                },
            });
            return result._sum.winAmount || 0;
        });
        this.getMarketGameBids = () => __awaiter(this, void 0, void 0, function* () {
            // Step 1: Fetch all markets and their associated games
            const markets = yield this.prisma.market.findMany({
                where: { deletedAt: null },
                select: {
                    id: true,
                    marketName: true,
                    games: {
                        select: {
                            id: true,
                            gameName: true,
                        },
                    },
                },
            });
            // Step 2: Fetch all pending bids
            const pendingBids = yield this.prisma.bid.findMany({
                where: {
                    deletedAt: null,
                    status: "pending"
                },
                select: {
                    id: true,
                    marketId: true,
                    gameId: true,
                },
            });
            // Step 3: Loop through markets and games, and count bids for each game
            const marketGameBids = markets.map((market) => {
                const gamesWithBidCount = market.games.map((game) => {
                    // Filter pending bids for the current game in the current market
                    const bidsForGame = pendingBids.filter((bid) => bid.marketId === market.id && bid.gameId === game.id);
                    // The length of the filtered array represents the count of bids for this game
                    const bidCount = bidsForGame.length;
                    return {
                        id: game.id,
                        gameName: game.gameName,
                        bidCount: bidCount, // Count of bids specific to this game and market
                    };
                });
                return {
                    id: market.id,
                    marketName: market.marketName,
                    games: gamesWithBidCount,
                };
            });
            return marketGameBids;
        });
        this.findExistingSetting = () => __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.setting.findFirst({
                where: { deletedAt: null },
            });
        });
        this.updateSetting = (id, minBet, maxBet) => __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.setting.update({
                where: { id: id },
                data: {
                    minBet: minBet,
                    maxBet: maxBet,
                    updatedAt: new Date(), // Update timestamp
                },
            });
        });
        this.createSetting = (minBet, maxBet) => __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.setting.create({
                data: {
                    minBet: minBet,
                    maxBet: maxBet,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });
        });
        this.updateWithdrawal = (userId, amount) => __awaiter(this, void 0, void 0, function* () {
            yield this.prisma.users.update({
                where: { id: +userId },
                data: {
                    wallet: {
                        decrement: amount
                    }
                }
            });
            return true;
        });
        this.updateMarketStatuses = (markets, status) => __awaiter(this, void 0, void 0, function* () {
            try {
                const updateMarketActions = markets.map(marketId => this.prisma.market.update({
                    where: { id: marketId },
                    data: { status }, // Set the new status
                }));
                // Execute all updates atomically
                yield this.prisma.$transaction(updateMarketActions);
            }
            catch (err) {
                throw new Error(`Error updating market statuses: ${err.message}`);
            }
        });
        this.createNotification = (payload) => __awaiter(this, void 0, void 0, function* () {
            const { title, description, userId, isForAllUser = false } = payload;
            if (isForAllUser) {
                const getAllUsers = yield this.prisma.users.findMany({
                    select: { id: true },
                });
                if (getAllUsers === null || getAllUsers === void 0 ? void 0 : getAllUsers.length) {
                    yield Promise.all(getAllUsers.map((user) => __awaiter(this, void 0, void 0, function* () {
                        yield this.prisma.notifications.create({
                            data: { title, description, userId: user.id },
                        });
                    })));
                    return true;
                }
            }
            else {
                const notification = yield this.prisma.notifications.create({
                    data: { title, description, userId },
                });
                return notification;
            }
        });
        this.getMarketNamesByIds = (marketIds) => __awaiter(this, void 0, void 0, function* () {
            try {
                const markets = yield this.prisma.market.findMany({
                    where: {
                        id: { in: marketIds },
                    },
                    select: {
                        marketName: true,
                    },
                });
                return markets.map(market => market.marketName).filter(name => name); // Get market names
            }
            catch (err) {
                throw new Error(`Error fetching market names: ${err.message}`);
            }
        });
        this.getUserActivity = (userId, page, limit, startDate, endDate) => __awaiter(this, void 0, void 0, function* () {
            try {
                const skip = (page - 1) * limit;
                const dateFilter = {};
                if (startDate) {
                    dateFilter.gte = startDate;
                }
                if (endDate) {
                    dateFilter.lte = endDate;
                }
                const transactions = yield this.prisma.notifications.findMany({
                    where: Object.assign({ userId: userId, deletedAt: null, OR: [
                            { title: { contains: "Bid Created" } },
                            { title: { contains: "Congratulations!" } }
                        ] }, (Object.keys(dateFilter).length && { createdAt: dateFilter })),
                    orderBy: {
                        createdAt: 'desc'
                    },
                    skip: skip,
                    take: limit
                });
                const totalTransactions = yield this.prisma.notifications.count({
                    where: Object.assign({ userId: userId, deletedAt: null, OR: [
                            { title: { contains: "Bid Created" } },
                            { title: { contains: "Congratulations!" } }
                        ] }, (Object.keys(dateFilter).length && { createdAt: dateFilter }))
                });
                return { transactions, totalTransactions };
            }
            catch (err) {
                throw new Error(`Failed to fetch transactions: ${err.message}`);
            }
        });
    }
    getActiveMarkets() {
        return __awaiter(this, void 0, void 0, function* () {
            const currentDay = (0, moment_1.default)().day(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
            let currentTimeInIndia = (0, moment_1.default)().tz('Asia/Kolkata');
            const markets = yield this.prisma.market.findMany({
                where: {
                    deletedAt: null,
                }
            });
            const marketsWithStatus = markets.map((market) => {
                const weekdayStatus = market.weekdayStatus ? market.weekdayStatus : {};
                let closeTime = this.bidUtils.formatTimeTo12Hour(market.closeTime);
                let finalCloseTIme = this.bidUtils.convert12HourTimeToMoment(closeTime);
                let openTime = this.bidUtils.formatTimeTo12Hour(market.openTime);
                let finalOpenTIme = this.bidUtils.convert12HourTimeToMoment(openTime);
                const isOpenToday = weekdayStatus[currentDay] === 'active';
                const firstThree = market.openPanna ? market.openPanna : 'XXX';
                const firstX = market.openResult ? market.openResult.charAt(0) : 'X';
                const secondX = market.closeResult ? market.closeResult.charAt(0) : 'X';
                const lastThree = market.closePanna ? market.closePanna : 'XXX';
                const marketId = `${firstThree}-${firstX}${secondX}-${lastThree}`;
                return Object.assign(Object.assign({}, market), { marketId, status: (market.status === 'active' && isOpenToday && (!currentTimeInIndia.isAfter(finalOpenTIme) || !currentTimeInIndia.isAfter(finalCloseTIme))) ? 'running' : 'closed' });
            });
            return marketsWithStatus;
        });
    }
    getUserInfo(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.users.findFirst({
                where: {
                    id
                }
            });
        });
    }
    createPendingTransaction(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.transaction.create({
                data: {
                    type: data.type,
                    status: 'PENDING',
                    amount: data.amount,
                    userId: data.userId,
                },
            });
        });
    }
    createBanne(files) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.banner.create({
                data: {
                    deletedAt: null,
                    fileName: files[0].originalname,
                    fileType: files[0].mimetype,
                    fileData: files[0].buffer,
                }
            });
        });
    }
    updateBanner(id, files) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.banner.update({
                where: { id },
                data: {
                    fileName: files[0].originalname,
                    fileType: files[0].mimetype,
                    fileData: files[0].buffer,
                }
            });
        });
    }
    getBanner() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.banner.findFirst({
                where: {
                    deletedAt: null
                }
            });
        });
    }
    getMarketGameBidsByType(marketId, type, page, limit, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            // Calculate pagination offsets
            const offset = (page - 1) * limit;
            // Fetch markets and their associated games
            const markets = yield this.prisma.market.findMany({
                where: { id: marketId, deletedAt: null },
                select: {
                    id: true,
                    marketName: true,
                    games: {
                        select: {
                            id: true,
                            gameName: true,
                        },
                    },
                },
            });
            // Fetch pending bids with date filter
            const pendingBids = yield this.prisma.bid.findMany({
                where: Object.assign({ marketId: +marketId, session: type, deletedAt: null }, (startDate && endDate && {
                    date: {
                        gte: startDate,
                        lte: endDate,
                    },
                })),
                select: {
                    id: true,
                    marketId: true,
                    gameId: true,
                    createdAt: true,
                    pannaDigit: true, // Assuming pannaDigit is a field in your bid model
                    bidDigit: true, // Assuming bidDigit is a field in your bid model,
                    bidAmount: true
                }
            });
            // Count total pending bids
            const totalBids = yield this.prisma.bid.count({
                where: Object.assign({ marketId: +marketId, session: type, deletedAt: null }, (startDate && endDate && {
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                })),
            });
            // Map bids to their corresponding markets and games
            const marketGameBids = markets.map((market) => {
                let marketTotalBidsCount = 0; // Track total bids for the market
                const gamesWithBidCount = market.games.map((game) => {
                    // Filter bids for the current game and market
                    const bidsForGame = pendingBids.filter((bid) => bid.marketId === market.id && bid.gameId === game.id);
                    // Prepare to collect counts of unique pannaDigit-bidDigit pairs
                    const bidCounts = {};
                    for (const bid of bidsForGame) {
                        // Determine the pannaDigit-bidDigit key
                        const key = bid.pannaDigit ? `${bid.pannaDigit}-${bid.bidDigit}` : `${bid.bidDigit}`;
                        // If the key exists, increment its count; otherwise, set it to 1
                        if (bidCounts[key]) {
                            // bidCounts[key].count++;
                            bidCounts[key].count += +bid.bidAmount;
                        }
                        else {
                            // bidCounts[key] = { count: 1 };
                            bidCounts[key] = { count: +bid.bidAmount };
                        }
                    }
                    // Sum up total bids for this game
                    const gameTotalBidsCount = Object.values(bidCounts).reduce((sum, obj) => sum + obj.count, 0);
                    // Add this game's total to the market's total
                    marketTotalBidsCount += gameTotalBidsCount;
                    // Convert the bidCounts object into an array of results
                    const bidCountResults = Object.entries(bidCounts).map(([key, value]) => ({
                        key,
                        count: value.count,
                    }));
                    return {
                        id: game.id,
                        gameName: game.gameName,
                        bids: bidCountResults, // Array of unique pannaDigit-bidDigit pairs with counts
                        bidCount: gameTotalBidsCount // Total bids for this game
                    };
                });
                return {
                    id: market.id,
                    marketName: market.marketName,
                    games: gamesWithBidCount,
                    totalCount: marketTotalBidsCount, // Total bids for this market
                };
            });
            return {
                marketGameBids,
                totalBids, // Overall total bids for pagination
            };
        });
    }
    getGamesByMarket(marketId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.game.findMany({
                where: {
                    markets: {
                        some: {
                            id: +marketId
                        }
                    },
                    deletedAt: null,
                }
            });
        });
    }
}
exports.DashboardUtils = DashboardUtils;
//# sourceMappingURL=dashboardUtils.js.map