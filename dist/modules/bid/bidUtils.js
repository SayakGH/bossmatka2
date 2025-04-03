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
exports.BidUtils = void 0;
const logger_1 = require("../../helpers/logger");
const client_1 = require("@prisma/client");
const moment_1 = __importDefault(require("moment"));
class BidUtils {
    constructor() {
        this.prisma = new client_1.PrismaClient();
        this.logger = logger_1.Log.getLogger();
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
        this.declareBidResultUtil = (marketId, session, // Session is no longer used for fetching bids
        bidDigit, pannaDigit, date) => __awaiter(this, void 0, void 0, function* () {
            try {
                const startOfDay = (0, moment_1.default)(date).tz('Asia/Kolkata').startOf('day').toDate();
                const endOfDay = (0, moment_1.default)(date).tz('Asia/Kolkata').endOf('day').toDate();
                // Fetch market details
                const market = yield this.prisma.market.findUnique({
                    where: { id: marketId },
                    select: { marketName: true, openResult: true, closeResult: true, openPanna: true, closePanna: true },
                });
                if (!market) {
                    throw new Error("Market not found.");
                }
                // Fetch all pending bids for the date
                const allBids = yield this.prisma.bid.findMany({
                    where: {
                        marketId,
                        date: {
                            gte: startOfDay,
                            lte: endOfDay,
                        },
                        status: "pending",
                        deletedAt: null,
                    },
                });
                if (allBids.length === 0) {
                    yield this.prisma.resultHistory.create({
                        data: {
                            marketId,
                            date,
                            bidDigit,
                            pannaDigit,
                            session,
                        },
                    });
                    return false;
                }
                // Loop through all bids and process based on game type
                for (const bid of allBids) {
                    // Fetch the game using the gameId
                    const game = yield this.prisma.game.findUnique({
                        where: { id: bid.gameId },
                        select: { gameName: true },
                    });
                    if (!game) {
                        continue; // Skip if game not found
                    }
                    let isWin = false;
                    // Handle Double Digit game
                    if (game.gameName === "Jodi Digit") {
                        let doubleDigitWin = "";
                        if (market.openResult && market.closeResult) {
                            doubleDigitWin = `${market.openResult}${market.closeResult}`;
                        }
                        // Check if the bid matches the calculated double digit result
                        if (doubleDigitWin && bid.bidDigit === doubleDigitWin) {
                            isWin = true;
                        }
                    }
                    else if (game.gameName === "Full Sangam") {
                        if (market.openPanna && market.closePanna) {
                            if (bid.bidDigit === market.openPanna && bid.pannaDigit === market.closePanna) {
                                isWin = true;
                            }
                        }
                    }
                    else {
                        if (session == bid.session && (game.gameName != "Half Sangam" && (bid.bidDigit === bidDigit ||
                            bid.pannaDigit === pannaDigit ||
                            bid.bidDigit === pannaDigit ||
                            (bid.bidDigit === bidDigit && bid.pannaDigit === pannaDigit)))) {
                            isWin = true;
                        }
                    }
                    // Handle winning bid
                    if (isWin) {
                        yield this.prisma.bid.update({
                            where: { id: bid.id },
                            data: {
                                status: "completed",
                                winStatus: true,
                            },
                        });
                        // Update user wallet
                        yield this.prisma.users.update({
                            where: { id: bid.userId },
                            data: {
                                wallet: { increment: +bid.winAmount },
                            },
                        });
                        // Create transaction record
                        // await this.prisma.transaction.create({
                        //   data: {
                        //     type: "ADDITION",
                        //     status: "ACCEPTED",
                        //     amount: +bid.winAmount,
                        //     userId: bid.userId,
                        //   },
                        // });
                        // Send notification for winning bid
                        yield this.prisma.notifications.create({
                            data: {
                                userId: bid.userId,
                                title: "Congratulations!",
                                description: `You have won your bid! Your wallet has been credited with ${+bid.winAmount} credits.`,
                            },
                        });
                    }
                    else {
                        if (game.gameName === "Jodi Digit" || game.gameName === "Full Sangam" || game.gameName === "Half Sangam") {
                            continue;
                        }
                        yield this.prisma.bid.update({
                            where: { id: bid.id },
                            data: {
                                status: "completed",
                                winStatus: false,
                            },
                        });
                        // Send notification for losing bid
                        yield this.prisma.notifications.create({
                            data: {
                                userId: bid.userId,
                                title: "Better luck next time!",
                                description: `You lost your bid in the market "${market.marketName}". Try again next time!`,
                            },
                        });
                    }
                }
                // Insert the result into the ResultHistory table
                yield this.prisma.resultHistory.create({
                    data: {
                        marketId,
                        date,
                        bidDigit,
                        pannaDigit,
                        session,
                    },
                });
                return {
                    success: true,
                    message: "Bids and results updated successfully.",
                };
            }
            catch (error) {
                console.error("Error declaring bid result:", error);
                throw new Error("Failed to declare bid results.");
            }
        });
        this.declareHalfSangamBidResultUtil = (marketId, date) => __awaiter(this, void 0, void 0, function* () {
            try {
                const startOfDay = (0, moment_1.default)(date).tz('Asia/Kolkata').startOf('day').toDate();
                const endOfDay = (0, moment_1.default)(date).tz('Asia/Kolkata').endOf('day').toDate();
                // Fetch market details
                const market = yield this.prisma.market.findUnique({
                    where: { id: marketId },
                    select: { marketName: true, openResult: true, closeResult: true, openPanna: true, closePanna: true },
                });
                if (!market) {
                    throw new Error("Market not found.");
                }
                // Check if required market data is available
                if (!market.openPanna || !market.closePanna || !market.openResult || !market.closeResult) {
                    return { success: false, message: "Required market results are missing." };
                }
                // Fetch Half Sangam game details
                const halfSangamGame = yield this.prisma.game.findFirst({
                    where: { gameName: "Half Sangam" },
                });
                if (!halfSangamGame) {
                    throw new Error("Half Sangam game configuration not found.");
                }
                const halfSangamBids = yield this.prisma.bid.findMany({
                    where: {
                        marketId,
                        gameId: halfSangamGame.id,
                        date: {
                            gte: startOfDay,
                            lte: endOfDay,
                        },
                        status: "pending",
                        deletedAt: null,
                    },
                });
                for (const bid of halfSangamBids) {
                    let isWin = false;
                    // Fetch corresponding open and close session bids for the user
                    const userBids = yield this.prisma.bid.findMany({
                        where: {
                            userId: bid.userId,
                            marketId,
                            gameId: halfSangamGame.id,
                            status: "pending",
                            date: {
                                gte: startOfDay,
                                lte: endOfDay,
                            },
                        },
                        select: { id: true, session: true, bidDigit: true, pannaDigit: true, bidAmount: true, openPanna: true, closePanna: true, openDigit: true, closeDigit: true },
                    });
                    // const openBid = userBids.find((b) => b.session === "open");
                    // const closeBid = userBids.find((b) => b.session === "close");
                    for (let bidData of userBids) {
                        if (market.openPanna && market.closeResult && market.closePanna && market.openResult) {
                            if ((market.openPanna === bidData.openPanna && market.closeResult === bidData.closeDigit) ||
                                (market.closePanna === bidData.closePanna && market.openResult === bidData.openDigit)) {
                                isWin = true;
                                const winAmount = new client_1.Prisma.Decimal((+bidData.bidAmount / +process.env.BIDDING_AMOUNT) * +halfSangamGame.rate);
                                // Update both open and close session bids as completed and set win status
                                yield this.prisma.$transaction([
                                    this.prisma.bid.update({
                                        where: { id: bidData.id },
                                        data: { status: "completed", winStatus: true, winAmount },
                                    }),
                                    this.prisma.users.update({
                                        where: { id: bid.userId },
                                        data: { wallet: { increment: +winAmount } },
                                    }),
                                    this.prisma.notifications.create({
                                        data: {
                                            userId: bid.userId,
                                            title: "Congratulations!",
                                            description: `You won your Half Sangam bid! Your wallet has been credited with ${winAmount} credits.`,
                                        },
                                    }),
                                ]);
                            }
                            else {
                                // Mark both open and close session bids as completed with no win
                                yield this.prisma.$transaction([
                                    this.prisma.bid.update({
                                        where: { id: bidData.id },
                                        data: { status: "completed", winStatus: false },
                                    }),
                                    this.prisma.notifications.create({
                                        data: {
                                            userId: bid.userId,
                                            title: "Better luck next time!",
                                            description: `You lost your Half Sangam bid in the market "${market.marketName}". Try again next time!`,
                                        },
                                    }),
                                ]);
                            }
                        }
                    }
                }
                return { success: true, message: "Half Sangam bids processed successfully." };
            }
            catch (error) {
                console.error("Error processing Half Sangam bids:", error);
                throw new Error("Failed to process Half Sangam bids.");
            }
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
    addBid(bidPayload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.bid.create({
                data: bidPayload
            });
        });
    }
    updateUser(user, updatedWalletBalance) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.users.update({
                where: { id: +user.id },
                data: { wallet: updatedWalletBalance }
            });
        });
    }
    getUserBidHistory(userId, page, limit, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const skip = (page - 1) * limit;
                const dateFilter = {};
                if (startDate) {
                    dateFilter.gte = startDate;
                }
                if (endDate) {
                    dateFilter.lte = endDate;
                }
                const bids = yield this.prisma.bid.findMany({
                    where: Object.assign({ userId: userId, deletedAt: null }, (Object.keys(dateFilter).length && { date: dateFilter })),
                    include: {
                        market: {
                            select: { marketName: true }
                        },
                        game: {
                            select: { gameName: true }
                        }
                    },
                    orderBy: {
                        createdAt: "desc"
                    },
                    skip: skip,
                    take: limit
                });
                const totalBids = yield this.prisma.bid.count({
                    where: Object.assign({ userId: userId, deletedAt: null }, (Object.keys(dateFilter).length && { date: dateFilter }))
                });
                return { bids, totalBids };
            }
            catch (err) {
                this.logger.error(`Failed to fetch bid history for user ${userId}: ${err.message}`);
                throw new Error(`Failed to fetch bid history: ${err.message}`);
            }
        });
    }
    getAdminBidHistory(adminId, page, limit, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
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
                    return { bids: [], totalBids: 0 };
                }
                const dateFilter = {};
                if (startDate && endDate) {
                    dateFilter.status = "pending";
                }
                const bids = yield this.prisma.bid.findMany({
                    where: Object.assign({ userId: { in: userIds }, deletedAt: null }, dateFilter),
                    include: {
                        market: {
                            select: { marketName: true }
                        },
                        game: {
                            select: { gameName: true }
                        },
                        user: {
                            select: { id: true, fullName: true, phoneNumber: true }
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    skip: skip,
                    take: limit,
                });
                const totalBids = yield this.prisma.bid.count({
                    where: Object.assign({ userId: { in: userIds }, deletedAt: null }, dateFilter),
                    orderBy: {
                        createdAt: 'desc',
                    },
                });
                return { bids, totalBids };
            }
            catch (err) {
                this.logger.error(`Failed to fetch bid history for admin ${adminId}: ${err.message}`);
                throw new Error(`Failed to fetch bid history: ${err.message}`);
            }
        });
    }
    updateBid(id, status, winStatus, winAmount) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.bid.update({
                where: { id },
                data: {
                    status,
                    winStatus,
                    winAmount
                }
            });
        });
    }
    getMinBid() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.setting.findFirst({
                where: { deletedAt: null }
            });
        });
    }
    getPendingBids(marketId, gameId, bidDigit) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pendingBids = yield this.prisma.bid.findMany({
                    where: {
                        marketId,
                        gameId,
                        bidDigit: bidDigit,
                        status: "pending"
                    },
                    include: {
                        user: true // Include user details for wallet update
                    }
                });
                return pendingBids;
            }
            catch (err) {
                throw new Error(`Error fetching pending bids: ${err.message}`);
            }
        });
    }
    processWinningBids(bids, winAmount) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transactionActions = [];
                for (const bid of bids) {
                    const { userId } = bid;
                    transactionActions.push(this.prisma.users.update({
                        where: { id: userId },
                        data: {
                            wallet: {
                                increment: winAmount,
                            },
                        },
                    }));
                    transactionActions.push(this.prisma.bid.update({
                        where: { id: bid.id },
                        data: {
                            status: "completed",
                            winStatus: true,
                            winAmount: winAmount
                        },
                    }));
                    transactionActions.push(this.prisma.transaction.create({
                        data: {
                            type: "ADDITION",
                            status: "ACCEPTED",
                            amount: winAmount,
                            userId: userId,
                        },
                    }));
                    transactionActions.push(this.prisma.notifications.create({
                        data: {
                            userId: userId,
                            title: "Congratulations!",
                            description: `You have won your bid! Your wallet has been credited with ${winAmount} credits.`,
                        },
                    }));
                }
                // Execute all the operations atomically
                yield this.prisma.$transaction(transactionActions);
            }
            catch (err) {
                throw new Error(`Error processing winning bids: ${err.message}`);
            }
        });
    }
    markAllBidsAsLost(marketId, gameId, bidDigit) {
        return __awaiter(this, void 0, void 0, function* () {
            // try {
            //   // Fetch market and game details
            //   const market = await this.prisma.market.findUnique({
            //     where: { id: marketId }
            //   });
            //   const game = await this.prisma.game.findUnique({
            //     where: { id: gameId }
            //   });
            //   // Fetch all bids (including the winning bidDigit and the losing bids)
            //   const allBids = await this.prisma.bid.findMany({
            //     where: {
            //       marketId,
            //       gameId,
            //       bidDigit: { not: bidDigit }, // Exclude the winning bidDigit
            //       status: "pending"
            //     }
            //   });
            //   // Update the status of all bids: mark winners and losers
            //   const bidUpdateActions = allBids.map(bid => 
            //     this.prisma.bid.update({
            //       where: { id: bid.id },
            //       data: {
            //         status: "completed",
            //         winStatus: bid.bidDigit === bidDigit, // true for winning bids, false for others
            //       },
            //     })
            //   );
            //   // Execute bid updates atomically
            //   await this.prisma.$transaction(bidUpdateActions);
            //   // Send notifications for losers with market and game information
            //   for (const bid of allBids) {
            //     if (bid.bidDigit !== bidDigit) {
            //       await this.prisma.notifications.create({
            //         data: {
            //           userId: bid.userId,
            //           title: "Better luck next time!",
            //           description: `You lost your bid in the market ${market?.marketName} for the game ${game?.gameName}. Try again next time!`,
            //         },
            //       });
            //     }
            //   }
            // } catch (err) {
            //   throw new Error(`Error marking bids as lost: ${err.message}`);
            // }
        });
    }
    markOtherBidsAsLost(marketId, gameId, bidDigit) {
        return __awaiter(this, void 0, void 0, function* () {
            // try {
            //   // Fetch market and game details
            //   const market = await this.prisma.market.findUnique({
            //     where: { id: marketId }
            //   });
            //   const game = await this.prisma.game.findUnique({
            //     where: { id: gameId }
            //   });
            //   // Fetch losing bids (excluding the winning bidDigit)
            //   const losingBids = await this.prisma.bid.findMany({
            //     where: {
            //       marketId,
            //       gameId,
            //       bidDigit: { not: bidDigit }, // Exclude the winning bidDigit
            //       status: "pending", // Only pending bids
            //     }
            //   });
            //   // Update the status of losing bids in a transaction
            //   const bidUpdateActions = losingBids.map(bid => 
            //     this.prisma.bid.update({
            //       where: { id: bid.id },
            //       data: {
            //         status: "completed",
            //         winStatus: false,
            //       },
            //     })
            //   );
            //   // Execute bid updates atomically
            //   await this.prisma.$transaction(bidUpdateActions);
            //   // Send losing notifications with market and game information
            //   for (const bid of losingBids) {
            // await this.prisma.notifications.create({
            //   data: {
            //     userId: bid.userId,
            //     title: "Better luck next time!",
            //     description: `You lost your bid in the market ${market?.marketName} for the game ${game?.gameName}. Try again next time!`,
            //   },
            // });
            //   }
            // } catch (err) {
            //   throw new Error(`Error marking other bids as lost: ${err.message}`);
            // }
        });
    }
    getMarketDetails(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.market.findFirst({
                where: { id: +id }
            });
        });
    }
    convert12HourTimeToMoment(timeString) {
        const timeParts = timeString.split(':');
        const hours = parseInt(timeParts[0]);
        const minutes = parseInt(timeParts[1]);
        const period = timeString.split(' ');
        ;
        // Create a Moment object with the specified time and date
        const momentObj = moment_1.default.tz({ hours, minutes }, "Asia/Kolkata");
        // Adjust the hours based on AM/PM
        if (period[1] === 'PM' && hours !== 12) {
            momentObj.add(12, 'hours');
        }
        return momentObj;
    }
    getGameDetails(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.game.findFirst({
                where: { id: +id }
            });
        });
    }
    updateMarketResult(marketId, session, date, bidDigit, pannaDigit) {
        return __awaiter(this, void 0, void 0, function* () {
            // Update the Market table with the result
            if (session === "open") {
                yield this.prisma.market.update({
                    where: { id: marketId },
                    data: {
                        resultDate: date,
                        openResult: bidDigit,
                        openPanna: pannaDigit,
                    },
                });
            }
            else if (session === "close") {
                yield this.prisma.market.update({
                    where: { id: marketId },
                    data: {
                        resultDate: date,
                        closeResult: bidDigit,
                        closePanna: pannaDigit,
                    },
                });
            }
        });
    }
    getAdminResultHistory(adminId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const skip = (page - 1) * limit;
                const bids = yield this.prisma.resultHistory.findMany({
                    where: {},
                    include: {
                        market: true
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    skip: skip,
                    take: limit,
                });
                const totalBids = yield this.prisma.resultHistory.count({
                    where: {},
                    orderBy: {
                        createdAt: 'desc',
                    },
                });
                return { bids, totalBids };
            }
            catch (err) {
                this.logger.error(`Failed to fetch bid history for admin ${adminId}: ${err.message}`);
                throw new Error(`Failed to fetch bid history: ${err.message}`);
            }
        });
    }
    getAdminBidHistoryWinning(adminId, page, limit, today) {
        return __awaiter(this, void 0, void 0, function* () {
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
                    return { bids: [], totalBids: 0 };
                }
                const whereClause = {
                    userId: { in: userIds },
                    deletedAt: null,
                    status: "completed",
                    winStatus: true
                };
                if (today) {
                    const startOfDay = (0, moment_1.default)().tz('Asia/Kolkata').startOf('day');
                    const endOfDay = (0, moment_1.default)().tz('Asia/Kolkata').endOf('day');
                    whereClause.updatedAt = {
                        gte: startOfDay,
                        lte: endOfDay,
                    };
                }
                const bids = yield this.prisma.bid.findMany({
                    where: whereClause,
                    include: {
                        market: {
                            select: { marketName: true }
                        },
                        game: {
                            select: { gameName: true }
                        },
                        user: {
                            select: { id: true, fullName: true, phoneNumber: true }
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    skip: skip,
                    take: limit,
                });
                const totalBids = yield this.prisma.bid.count({
                    where: whereClause,
                    orderBy: {
                        createdAt: 'desc',
                    },
                });
                return { bids, totalBids };
            }
            catch (err) {
                this.logger.error(`Failed to fetch bid history for admin ${adminId}: ${err.message}`);
                throw new Error(`Failed to fetch bid history: ${err.message}`);
            }
        });
    }
    getGameId(gameName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return this.prisma.game.findFirst({
                    where: {
                        gameName
                    }
                });
            }
            catch (err) {
                throw new Error(`Failed to fetch bid history: ${err}`);
            }
        });
    }
}
exports.BidUtils = BidUtils;
//# sourceMappingURL=bidUtils.js.map