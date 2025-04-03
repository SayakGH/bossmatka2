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
exports.DashboardController = void 0;
const dashboardHelper_1 = require("./dashboardHelper");
const dashboardUtils_1 = require("./dashboardUtils");
const commonUtils_1 = require("../../helpers/commonUtils");
const constants_1 = require("../../config/constants");
const notificationUtils_1 = require("../notification/notificationUtils");
const moment_1 = __importDefault(require("moment"));
const notification_1 = require("../../helpers/notification");
var mongoose = require("mongoose");
class DashboardController {
    constructor() {
        this.dashboardUtils = new dashboardUtils_1.DashboardUtils();
        this.dashboardHelper = new dashboardHelper_1.DashboardHelper();
        this.commonUtils = new commonUtils_1.CommonUtils();
        this.notificationUtils = new notificationUtils_1.NotificationUtils();
        this.notification = new notification_1.Notification();
        this.addDashboardController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: authUser } = req;
                const getUserInfo = yield this.dashboardUtils.getUserInfo(authUser.id);
                const activeMarkets = yield this.dashboardUtils.getActiveMarkets();
                // const getBanner = await this.dashboardUtils.getBanner();
                const formattedMarkets = activeMarkets.map((market) => (Object.assign(Object.assign({}, market), { openTime: this.dashboardUtils.formatTimeTo12Hour(market.openTime), closeTime: this.dashboardUtils.formatTimeTo12Hour(market.closeTime) })));
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("DASHBOARD_LIST_FETCHED_SUCCESSFULLY"), {
                    markets: formattedMarkets,
                    wallet: getUserInfo.wallet,
                    adminNumber: process.env.ADMIN_NUMBER,
                    adminUpi: process.env.ADMIN_UPI
                }, true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("INTERNAL_SERVER_ERROR"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.addTransactionController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: authUser } = req;
                const { type, amount } = req.body;
                const userId = authUser.id;
                if (type !== "WITHDRAWAL" && type !== "ADDITION") {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid transaction type. Must be WITHDRAWAL or ADDITION.",
                    });
                }
                const getUserInfo = yield this.dashboardUtils.getUserInfo(+authUser.id);
                if (type == "WITHDRAWAL" && +getUserInfo.wallet < +amount) {
                    return res.status(400).json({
                        success: false,
                        message: "Insufficient balance in the account.",
                    });
                }
                const transaction = yield this.dashboardUtils.createPendingTransaction({
                    type,
                    amount,
                    userId,
                });
                if (transaction && type === "WITHDRAWAL") {
                    yield this.dashboardUtils.updateWithdrawal(+userId, amount);
                }
                yield this.notificationUtils.createNotification({
                    title: `Transaction Created By ${authUser.fullName}`,
                    description: `${authUser.fullName} has created ${type.toLowerCase()} transaction of ${+amount}`,
                    userId: userId,
                    isForAllUser: false,
                });
                if (authUser.deviceToken || getUserInfo.deviceToken) {
                    yield this.notification.sendPushNotification(authUser.deviceToken || getUserInfo.deviceToken, `Transaction Created By ${authUser.fullName}`, `${authUser.fullName} has created ${type.toLowerCase()} transaction of ${+amount}`, {
                        description: `${authUser.fullName} has created ${type.toLowerCase()} transaction of ${+amount}`, type: "notification"
                    });
                }
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("TRANSACTION_RECORDED"), {}, true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("INTERNAL_SERVER_ERROR"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.getTransactionHistoryController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: authUser } = req;
                const userId = authUser.id;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 3;
                const startDate = req.query.startDate
                    ? new Date(req.query.startDate)
                    : null;
                const endDate = req.query.endDate
                    ? new Date(req.query.endDate)
                    : null;
                const { transactions, totalTransactions } = yield this.dashboardUtils.getUserTransactions(userId, page, limit, startDate, endDate);
                const totalPages = Math.ceil(totalTransactions / limit);
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("TRANSACTION_HISTORY_SUCCESS"), {
                    transactions,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        limit,
                        totalData: totalTransactions,
                    },
                }, true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("INTERNAL_SERVER_ERROR"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.getTransactionHistoryByAdminController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: authUser } = req;
                const adminId = authUser.id;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const { transactions, totalTransactions } = yield this.dashboardUtils.getUserTransactionsByType(adminId, page, limit, req.query.type, req.query.today && req.query.today === "true" ? true : false);
                const transactionsData = transactions.map((data) => (Object.assign(Object.assign({}, data), { userId: data.user.id, userName: data.user.fullName, phoneNumber: data.user.phoneNumber })));
                const totalPages = Math.ceil(totalTransactions / limit);
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("TRANSACTION_HISTORY_SUCCESS"), {
                    data: transactionsData,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        limit,
                        totalData: totalTransactions,
                    },
                }, true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("INTERNAL_SERVER_ERROR"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.updateTxnByAdminController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: authUser } = req;
                const { status, userId, txnType, amount } = req.body;
                const adminId = authUser.id;
                const txnId = +req.params.id;
                const updateStatus = yield this.dashboardUtils.updateStatusAndGiveAmount(+userId, +txnId, status, txnType, +amount);
                if (!updateStatus) {
                    throw updateStatus;
                }
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("TRANSACTION_STATUS_CHANGE"), {}, true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("INTERNAL_SERVER_ERROR"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.addDashboardByAdminController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                // const totalGames = await this.dashboardUtils.getTotalGames();
                // const totalMarkets = await this.dashboardUtils.getTotalMarkets();
                const totalBidsActive = yield this.dashboardUtils.getTotalBidsActive();
                const totalDeposits = yield this.dashboardUtils.getTotalDeposits();
                const totalBidsActiveToday = yield this.dashboardUtils.getActiveBidsForToday();
                const totalDepositsToday = yield this.dashboardUtils.getTotalDepositsToday();
                const totalWithdrawals = yield this.dashboardUtils.getTotalWithdrawals();
                const totalWithdrawalsToday = yield this.dashboardUtils.getTotalWithdrawalsToday();
                const totalWalletMoney = yield this.dashboardUtils.getTotalWalletMoney();
                const totalUsers = yield this.dashboardUtils.getTotalUsers();
                const totalTodaysUsers = yield this.dashboardUtils.getTotalTodaysUsers();
                const totalWinningBids = yield this.dashboardUtils.getTotalWinningBids();
                const marketGameBids = yield this.dashboardUtils.getMarketGameBids();
                const totalBids = yield this.dashboardUtils.getTotalBids();
                const existingSetting = yield this.dashboardUtils.findExistingSetting();
                const totalWinningBidsToday = yield this.dashboardUtils.getTotalWinningBidsToday();
                //total today bids
                //today win
                //total wallet money where user list with wallet money from highest to lowest
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("DASHBOARD_LIST_FETCHED_SUCCESSFULLY"), {
                    // totalGames,
                    totalWinningBidsToday,
                    totalTodaysUsers,
                    totalWithdrawalsToday: totalWithdrawalsToday._sum.amount || 0,
                    totalDepositsToday: totalDepositsToday._sum.amount || 0,
                    // totalMarkets,
                    totalBidsActive,
                    totalBidsActiveToday,
                    totalBids,
                    totalDeposits: totalDeposits._sum.amount || 0,
                    totalWithdrawals: totalWithdrawals._sum.amount || 0,
                    totalWalletMoney: totalWalletMoney._sum.wallet || 0,
                    totalUsers,
                    totalWinningBidsAmount: totalWinningBids._sum.winAmount || 0,
                    marketGameBids: marketGameBids,
                    minBid: existingSetting.minBet || 0,
                    maxBid: existingSetting.maxBet,
                }, true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("INTERNAL_SERVER_ERROR"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.addBannerController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: authUser } = req;
                const userId = authUser.id;
                const { files } = req;
                const addBanner = yield this.dashboardUtils.createBanne(files);
                if (!addBanner) {
                    throw addBanner;
                }
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("BANNER_CREATED_SUCCESSFULL"), {}, true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("INTERNAL_SERVER_ERROR"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.getBannerController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const getBanner = yield this.dashboardUtils.getBanner();
                if (!getBanner) {
                    throw getBanner;
                }
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("BANNER_FETCH_SUCCESSFULL"), getBanner, true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("INTERNAL_SERVER_ERROR"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.updateBannerController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: authUser } = req;
                const userId = authUser.id;
                const { files } = req;
                const updateBanner = yield this.dashboardUtils.updateBanner(+req.params.id, files);
                if (!updateBanner) {
                    throw updateBanner;
                }
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("BANNER_UPDATED_SUCCESSFULL"), {}, true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("INTERNAL_SERVER_ERROR"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.setSettingController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                let { minBet, maxBet } = req.body;
                maxBet = maxBet ? maxBet : null;
                const existingSetting = yield this.dashboardUtils.findExistingSetting();
                let settingResponse;
                if (existingSetting) {
                    settingResponse = yield this.dashboardUtils.updateSetting(existingSetting.id, minBet, maxBet);
                }
                else {
                    settingResponse = yield this.dashboardUtils.createSetting(minBet, maxBet);
                }
                // Success response
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("SETTING_UPDATE_SUCCESS"), { setting: settingResponse }, true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                // Error handling
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("INTERNAL_SERVER_ERROR"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.changeMarketStatusController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { markets, status } = req.body;
                // Call the utility function to update market statuses
                yield this.dashboardUtils.updateMarketStatuses(markets, status);
                // Fetch market names for notification
                const marketNames = yield this.dashboardUtils.getMarketNamesByIds(markets);
                const notificationTitle = status === "active" ? "Markets Opened" : "Markets Closed";
                const notificationDescription = `The following markets have been marked as ${status}: ${marketNames.join(", ")}`;
                // Create notification for all users
                yield this.dashboardUtils.createNotification({
                    title: notificationTitle,
                    description: notificationDescription,
                    userId: 0,
                    isForAllUser: true,
                });
                // Prepare the success response
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("SETTING_UPDATE_SUCCESS"), {}, true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("INTERNAL_SERVER_ERROR"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.getTransactionHistoryByUserIdController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = +req.params.id;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 3;
                const startDate = req.query.startDate
                    ? new Date(req.query.startDate)
                    : null;
                const endDate = req.query.endDate
                    ? new Date(req.query.endDate)
                    : null;
                const { transactions, totalTransactions } = yield this.dashboardUtils.getUserTransactions(userId, page, limit, startDate, endDate);
                const totalPages = Math.ceil(totalTransactions / limit);
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("TRANSACTION_HISTORY_SUCCESS"), {
                    transactions,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        limit,
                        totalData: totalTransactions,
                    },
                }, true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("INTERNAL_SERVER_ERROR"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.getMarketGameBidsByTypeController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const marketId = +req.params.marketId;
                const type = req.query.type;
                // Pagination
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const date = req.query.date ? (0, moment_1.default)(req.query.date) : null;
                let startDate = null;
                let endDate = null;
                if (date) {
                    startDate = date.startOf("day").toDate();
                    endDate = date.endOf("day").toDate();
                }
                else {
                    startDate = (0, moment_1.default)().tz("Asia/Kolkata").startOf("day").toDate();
                    endDate = (0, moment_1.default)().tz("Asia/Kolkata").endOf("day").toDate();
                }
                const { marketGameBids, totalBids } = yield this.dashboardUtils.getMarketGameBidsByType(marketId, type, page, limit, startDate, endDate);
                // Calculate total pages
                const totalPages = Math.ceil(totalBids / limit);
                const filteredData = marketGameBids.map(market => {
                    const filteredGames = market.games.filter(game => !["Family Jodi", "Family Panel", "Family Pannel"].includes(game.gameName));
                    return Object.assign(Object.assign({}, market), { games: filteredGames });
                });
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("BID_FETCH_SUCCESS"), // Assuming translation key exists
                {
                    data: filteredData,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        limit,
                        totalData: totalBids,
                    },
                }, true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                // Error handling
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("INTERNAL_SERVER_ERROR"), // Assuming translation key exists
                err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.getActvityByUserIdController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = +req.params.id;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 3;
                const startDate = req.query.startDate
                    ? new Date(req.query.startDate)
                    : null;
                const endDate = req.query.endDate
                    ? new Date(req.query.endDate)
                    : null;
                const { transactions, totalTransactions } = yield this.dashboardUtils.getUserActivity(userId, page, limit, startDate, endDate);
                const totalPages = Math.ceil(totalTransactions / limit);
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("USER_ACTIVITY_HISTORY_SUCCESS"), {
                    transactions,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        limit,
                        totalData: totalTransactions,
                    },
                }, true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("INTERNAL_SERVER_ERROR"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.getGamesByMarketController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const getBanner = yield this.dashboardUtils.getGamesByMarket(+req.params.marketId);
                if (!getBanner) {
                    throw getBanner;
                }
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("BANNER_FETCH_SUCCESSFULL"), getBanner, true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("INTERNAL_SERVER_ERROR"), err);
                return res.status(response.statusCode).json(response);
            }
        });
    }
}
exports.DashboardController = DashboardController;
//# sourceMappingURL=dashboardController.js.map