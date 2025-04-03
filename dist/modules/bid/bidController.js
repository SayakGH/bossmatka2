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
exports.BidController = void 0;
const bidHelper_1 = require("./bidHelper");
const bidUtils_1 = require("./bidUtils");
const commonUtils_1 = require("../../helpers/commonUtils");
const constants_1 = require("../../config/constants");
const client_1 = require("@prisma/client");
const notificationUtils_1 = require("../notification/notificationUtils");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const notification_1 = require("../../helpers/notification");
var mongoose = require("mongoose");
class BidController {
    constructor() {
        this.bidUtils = new bidUtils_1.BidUtils();
        this.bidHelper = new bidHelper_1.BidHelper();
        this.commonUtils = new commonUtils_1.CommonUtils();
        this.notificationUtils = new notificationUtils_1.NotificationUtils();
        this.notification = new notification_1.Notification();
        this.chartData = [
            ["128", "123", "137", "268", "236", "367", "678", "178"],
            ["129", "124", "147", "179", "246", "467", "679", "269"],
            ["120", "170", "157", "567", "256", "125", "670", "260"],
            ["130", "180", "158", "568", "680", "135", "456", "356"],
            ["140", "190", "159", "569", "145", "456", "690", "460"],
            ["245", "240", "290", "259", "470", "457", "579", "790"],
            ["345", "890", "390", "458", "480", "340", "588", "359"],
            ["139", "189", "148", "468", "346", "369", "134", "689"],
            ["789", "379", "347", "478", "248", "289", "239", "234"],
            ["230", "280", "258", "235", "357", "578", "780", "370"],
            ["380", "880", "335", "330", "588", "358"],
            ["570", "250", "255", "557", "200", "700"],
            ["247", "477", "779", "279", "229", "224"],
            ["167", "177", "112", "126", "266", "667"],
            ["249", "244", "799", "299", "447", "479"],
            ["489", "448", "344", "899", "399", "349"],
            ["138", "368", "336", "133", "688", "188"],
            ["445", "459", "599", "490", "990", "440"],
            ["149", "144", "446", "199", "699", "469"],
            ["348", "334", "339", "488", "889", "389"],
            ["100", "600", "155", "556", "560", "150"],
            ["660", "115", "110", "566", "156", "160"],
            ["300", "800", "580", "558", "355", "350"],
            ["400", "900", "455", "559", "590", "450"],
            ["168", "136", "113", "668", "366", "118"],
            ["146", "114", "669", "466", "119", "169"],
            ["778", "278", "237", "223", "228", "377"],
            ["337", "378", "238", "288", "788", "233"],
            ["220", "225", "770", "577", "257", "270"],
            ["122", "677", "177", "127", "267", "226"],
            ["227", "277", "777", "222"],
            ["499", "449", "444", "999"],
            ["166", "116", "111", "666"],
            ["338", "388", "888", "333"],
            ["500", "550", "555", "000"],
        ];
        this.jodiChartData = [
            ["12", "17", "21", "26", "62", "67", "71", "76"], // 12 FAMILY
            ["13", "18", "31", "36", "63", "68", "81", "86"], // 13 FAMILY
            ["14", "19", "41", "46", "64", "69", "91", "96"], // 14 FAMILY
            ["01", "06", "10", "15", "51", "56", "60", "65"], // 15 FAMILY
            ["23", "28", "32", "37", "73", "78", "82", "87"], // 23 FAMILY
            ["24", "29", "42", "47", "74", "79", "92", "97"], // 24 FAMILY
            ["02", "07", "20", "25", "52", "57", "70", "75"], // 25 FAMILY
            ["34", "39", "43", "48", "84", "89", "93", "98"], // 34 FAMILY
            ["03", "08", "30", "35", "53", "58", "80", "85"], // 35 FAMILY
            ["04", "09", "40", "45", "54", "59", "90", "95"], // 45 FAMILY
            ["05", "16", "27", "38", "49", "50", "61", "72", "83", "94"], // HALF RED
            ["00", "11", "22", "33", "44", "55", "66", "77", "88", "99"] // FULL RED
        ];
        this.addBidController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { user } = req;
                let { date, bidAmount, bidDigit, marketId, gameId, session, pannaDigit, familyBidArray, closeBidDigit, closePannaDigit, bidArray } = req.body;
                const userId = +user.id;
                const getUserInfo = yield this.bidUtils.getUserInfo(+user.id);
                const getMinBid = yield this.bidUtils.getMinBid();
                if (bidAmount && bidAmount != '' && +bidAmount > +getUserInfo.wallet) {
                    const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req
                        .t("WALLET_MONEY_RESTRICTION")
                        .replace("{AMOUNT}", +getUserInfo.wallet), {});
                    return res.status(response.statusCode).json(response);
                }
                if (bidAmount && bidAmount != '' && +bidAmount < +getMinBid.minBet) {
                    const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req
                        .t("MINBET_MONEY_RESTRICTION")
                        .replace("{MINBET}", +getMinBid.minBet), {});
                    return res.status(response.statusCode).json(response);
                }
                let currentTimeInIndia = (0, moment_timezone_1.default)().tz("Asia/Kolkata");
                const getMarketDetails = yield this.bidUtils.getMarketDetails(+marketId);
                const getGameDetails = yield this.bidUtils.getGameDetails(+gameId);
                if (bidArray && bidArray.length > 0) {
                    const totalBidAmount = bidArray.reduce((sum, bid) => sum + +bid.bidAmount, 0);
                    if (+totalBidAmount > +getUserInfo.wallet) {
                        const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req
                            .t("WALLET_MONEY_RESTRICTION")
                            .replace("{AMOUNT}", +getUserInfo.wallet), {});
                        return res.status(response.statusCode).json(response);
                    }
                    let createdBid;
                    if (getMarketDetails && session === "open") {
                        let openTime = this.bidUtils.formatTimeTo12Hour(getMarketDetails.openTime);
                        let finalOpenTIme = this.bidUtils.convert12HourTimeToMoment(openTime);
                        if (currentTimeInIndia.isAfter(finalOpenTIme)) {
                            const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("MARKET_CLOSED"), {});
                            return res.status(response.statusCode).json(response);
                        }
                    }
                    else if (getMarketDetails && session === "close") {
                        let closeTime = this.bidUtils.formatTimeTo12Hour(getMarketDetails.closeTime);
                        let finalCloseTIme = this.bidUtils.convert12HourTimeToMoment(closeTime);
                        if (currentTimeInIndia.isAfter(finalCloseTIme)) {
                            const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("MARKET_CLOSED"), {});
                            return res.status(response.statusCode).json(response);
                        }
                    }
                    let updatedWalletBalance = new client_1.Prisma.Decimal(getUserInfo.wallet).minus(new client_1.Prisma.Decimal(totalBidAmount));
                    for (let data of bidArray) {
                        let bidPayload = {
                            userId: +user.id,
                            marketId: +marketId,
                            gameId: +gameId,
                            date: (0, moment_timezone_1.default)(date, "DD-MM-YYYY")
                                .tz("Asia/Kolkata")
                                .set({
                                hour: (0, moment_timezone_1.default)().tz("Asia/Kolkata").hour(),
                                minute: (0, moment_timezone_1.default)().tz("Asia/Kolkata").minute(),
                                second: (0, moment_timezone_1.default)().tz("Asia/Kolkata").second(),
                                millisecond: (0, moment_timezone_1.default)().tz("Asia/Kolkata").millisecond(),
                            }),
                            bidAmount: new client_1.Prisma.Decimal(data.bidAmount),
                            bidDigit: data.bidDigit,
                            winAmount: new client_1.Prisma.Decimal((+data.bidAmount / +process.env.BIDDING_AMOUNT) * +getGameDetails.rate),
                            winStatus: false,
                            session,
                        };
                        let finalData = bidPayload;
                        let digits = data.bidDigit.split('').map(Number); // Converts "123" into [1, 2, 3]
                        if (digits.length === 2) {
                            const getDigitData = yield this.bidUtils.getGameId('Jodi Digit');
                            finalData.winAmount = new client_1.Prisma.Decimal((+data.bidAmount / +process.env.BIDDING_AMOUNT) * +getDigitData.rate),
                                finalData.gameId = +getDigitData.id;
                            finalData.bidDigit = data.bidDigit;
                        }
                        else if (digits.length === 1) {
                            const getDigitData = yield this.bidUtils.getGameId('Single Digit');
                            finalData.winAmount = new client_1.Prisma.Decimal((+data.bidAmount / +process.env.BIDDING_AMOUNT) * +getDigitData.rate),
                                finalData.gameId = +getDigitData.id;
                            finalData.bidDigit = data.bidDigit;
                        }
                        else {
                            if (digits[0] === digits[1] && digits[1] === digits[2]) {
                                const getDigitData = yield this.bidUtils.getGameId('Triple Panna');
                                finalData.winAmount = new client_1.Prisma.Decimal((+data.bidAmount / +process.env.BIDDING_AMOUNT) * +getDigitData.rate),
                                    finalData.gameId = +getDigitData.id;
                                finalData.bidDigit = data.bidDigit;
                            }
                            else if (digits[0] === digits[1] || digits[1] === digits[2] || digits[0] === digits[2]) {
                                const getDigitData = yield this.bidUtils.getGameId('Double Panna');
                                finalData.winAmount = new client_1.Prisma.Decimal((+data.bidAmount / +process.env.BIDDING_AMOUNT) * +getDigitData.rate),
                                    finalData.gameId = +getDigitData.id;
                                finalData.bidDigit = data.bidDigit;
                            }
                            else if (digits[0] < digits[1] && digits[1] < digits[2]) {
                                const getDigitData = yield this.bidUtils.getGameId('Single Panna');
                                finalData.winAmount = new client_1.Prisma.Decimal((+data.bidAmount / +process.env.BIDDING_AMOUNT) * +getDigitData.rate),
                                    finalData.bidDigit = data.bidDigit;
                                finalData.gameId = +getDigitData.id;
                            }
                        }
                        createdBid = yield this.bidUtils.addBid(finalData);
                        yield this.notificationUtils.createNotification({
                            title: `Bid Created By ${getUserInfo.fullName}`,
                            description: `${getUserInfo.fullName} has placed a bid of ${+bidAmount} in ${getMarketDetails.marketName} with digits ${bidPayload.bidDigit} ${bidPayload.pannaDigit ? bidPayload.pannaDigit : ""}`,
                            userId: userId,
                            isForAllUser: false,
                        });
                        if (user.deviceToken || getUserInfo.deviceToken) {
                            yield this.notification.sendPushNotification(user.deviceToken || getUserInfo.deviceToken, "Bid Created", `${getUserInfo.fullName} has placed a bid of ${+bidAmount} in ${getMarketDetails.marketName} with digits ${bidPayload.bidDigit} ${bidPayload.pannaDigit ? bidPayload.pannaDigit : ""}`, { description: `${getUserInfo.fullName} has placed a bid of ${+bidAmount} in ${getMarketDetails.marketName} with digits ${bidPayload.bidDigit} ${bidPayload.pannaDigit ? bidPayload.pannaDigit : ""}`, type: "notification" });
                        }
                    }
                    yield this.bidUtils.updateUser(getUserInfo, updatedWalletBalance);
                    const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("BID_SUCCESSFULL"), { createdBid }, true);
                    return res.status(response.statusCode).json(response);
                }
                else {
                    if (getGameDetails && getGameDetails.gameName === 'Half Sangam') {
                        session = 'open';
                    }
                    if (getMarketDetails && session === "open") {
                        let openTime = this.bidUtils.formatTimeTo12Hour(getMarketDetails.openTime);
                        let finalOpenTIme = this.bidUtils.convert12HourTimeToMoment(openTime);
                        if (currentTimeInIndia.isAfter(finalOpenTIme)) {
                            const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("MARKET_CLOSED"), {});
                            return res.status(response.statusCode).json(response);
                        }
                    }
                    else if (getMarketDetails && session === "close") {
                        let closeTime = this.bidUtils.formatTimeTo12Hour(getMarketDetails.closeTime);
                        let finalCloseTIme = this.bidUtils.convert12HourTimeToMoment(closeTime);
                        if (currentTimeInIndia.isAfter(finalCloseTIme)) {
                            const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("MARKET_CLOSED"), {});
                            return res.status(response.statusCode).json(response);
                        }
                    }
                    let updatedWalletBalance = new client_1.Prisma.Decimal(getUserInfo.wallet).minus(new client_1.Prisma.Decimal(bidAmount));
                    let bidPayload = {
                        userId: +user.id,
                        marketId: +marketId,
                        gameId: +gameId,
                        date: (0, moment_timezone_1.default)(date, "DD-MM-YYYY")
                            .tz("Asia/Kolkata")
                            .set({
                            hour: (0, moment_timezone_1.default)().tz("Asia/Kolkata").hour(),
                            minute: (0, moment_timezone_1.default)().tz("Asia/Kolkata").minute(),
                            second: (0, moment_timezone_1.default)().tz("Asia/Kolkata").second(),
                            millisecond: (0, moment_timezone_1.default)().tz("Asia/Kolkata").millisecond(),
                        }),
                        bidAmount: new client_1.Prisma.Decimal(bidAmount),
                        bidDigit: bidDigit,
                        winAmount: new client_1.Prisma.Decimal((+bidAmount / +process.env.BIDDING_AMOUNT) * +getGameDetails.rate),
                        winStatus: false,
                        session,
                    };
                    if (pannaDigit) {
                        bidPayload.pannaDigit = pannaDigit;
                    }
                    if (familyBidArray) {
                        bidPayload.familyBidArray = familyBidArray;
                    }
                    let createdBid;
                    if (bidPayload.familyBidArray && bidPayload.familyBidArray.length > 0) {
                        updatedWalletBalance = new client_1.Prisma.Decimal(getUserInfo.wallet).minus(new client_1.Prisma.Decimal(+bidAmount * familyBidArray.length));
                        for (let data of bidPayload.familyBidArray) {
                            let finalData = bidPayload;
                            delete finalData.familyBidArray;
                            let digits = data.split('').map(Number); // Converts "123" into [1, 2, 3]
                            if (digits.length === 2) {
                                const getDigitData = yield this.bidUtils.getGameId('Jodi Digit');
                                finalData.winAmount = new client_1.Prisma.Decimal((+bidAmount / +process.env.BIDDING_AMOUNT) * +getDigitData.rate),
                                    finalData.gameId = +getDigitData.id;
                                finalData.bidDigit = data;
                            }
                            else {
                                if (digits[0] === digits[1] && digits[1] === digits[2]) {
                                    const getDigitData = yield this.bidUtils.getGameId('Triple Panna');
                                    finalData.winAmount = new client_1.Prisma.Decimal((+bidAmount / +process.env.BIDDING_AMOUNT) * +getDigitData.rate),
                                        finalData.gameId = +getDigitData.id;
                                    finalData.bidDigit = data;
                                }
                                else if (digits[0] === digits[1] || digits[1] === digits[2] || digits[0] === digits[2]) {
                                    const getDigitData = yield this.bidUtils.getGameId('Double Panna');
                                    finalData.winAmount = new client_1.Prisma.Decimal((+bidAmount / +process.env.BIDDING_AMOUNT) * +getDigitData.rate),
                                        finalData.gameId = +getDigitData.id;
                                    finalData.bidDigit = data;
                                }
                                else if (digits[0] < digits[1] && digits[1] < digits[2]) {
                                    const getDigitData = yield this.bidUtils.getGameId('Single Panna');
                                    finalData.winAmount = new client_1.Prisma.Decimal((+bidAmount / +process.env.BIDDING_AMOUNT) * +getDigitData.rate),
                                        finalData.bidDigit = data;
                                    finalData.gameId = +getDigitData.id;
                                }
                            }
                            createdBid = yield this.bidUtils.addBid(finalData);
                            yield this.notificationUtils.createNotification({
                                title: `Bid Created By ${getUserInfo.fullName}`,
                                description: `${getUserInfo.fullName} has placed a bid of ${+bidAmount} in ${getMarketDetails.marketName} with digits ${bidPayload.bidDigit} ${bidPayload.pannaDigit ? bidPayload.pannaDigit : ""}`,
                                userId: userId,
                                isForAllUser: false,
                            });
                            if (user.deviceToken || getUserInfo.deviceToken) {
                                yield this.notification.sendPushNotification(user.deviceToken || getUserInfo.deviceToken, "Bid Created", `${getUserInfo.fullName} has placed a bid of ${+bidAmount} in ${getMarketDetails.marketName} with digits ${bidPayload.bidDigit} ${bidPayload.pannaDigit ? bidPayload.pannaDigit : ""}`, { description: `${getUserInfo.fullName} has placed a bid of ${+bidAmount} in ${getMarketDetails.marketName} with digits ${bidPayload.bidDigit} ${bidPayload.pannaDigit ? bidPayload.pannaDigit : ""}`, type: "notification" });
                            }
                        }
                    }
                    else {
                        delete bidPayload.familyBidArray;
                        if (getGameDetails && getGameDetails.gameName === 'Half Sangam') {
                            if (bidDigit && closePannaDigit && !pannaDigit && !closeBidDigit) {
                                bidPayload.bidDigit = bidDigit;
                                bidPayload.pannaDigit = closePannaDigit;
                                bidPayload.openDigit = bidDigit;
                                bidPayload.closePanna = closePannaDigit;
                                createdBid = yield this.bidUtils.addBid(bidPayload);
                            }
                            if (!bidDigit && !closePannaDigit && pannaDigit && closeBidDigit) {
                                bidPayload.bidDigit = closeBidDigit;
                                bidPayload.pannaDigit = pannaDigit;
                                bidPayload.closeDigit = closeBidDigit;
                                bidPayload.openPanna = pannaDigit;
                                createdBid = yield this.bidUtils.addBid(bidPayload);
                            }
                            if (bidDigit && closePannaDigit && pannaDigit && closeBidDigit) {
                                bidPayload.bidDigit = bidDigit;
                                bidPayload.pannaDigit = closePannaDigit;
                                bidPayload.openDigit = bidDigit;
                                bidPayload.closePanna = closePannaDigit;
                                createdBid = yield this.bidUtils.addBid(bidPayload);
                            }
                            if (bidDigit && closePannaDigit && pannaDigit && closeBidDigit) {
                                bidPayload.bidDigit = closeBidDigit;
                                bidPayload.pannaDigit = pannaDigit;
                                bidPayload.closeDigit = closeBidDigit;
                                bidPayload.openPanna = pannaDigit;
                                createdBid = yield this.bidUtils.addBid(bidPayload);
                            }
                        }
                        else {
                            createdBid = yield this.bidUtils.addBid(bidPayload);
                        }
                        yield this.notificationUtils.createNotification({
                            title: `Bid Created By ${getUserInfo.fullName}`,
                            description: `${getUserInfo.fullName} has placed a bid of ${+bidAmount} in ${getMarketDetails.marketName} with digits ${bidPayload.bidDigit} ${bidPayload.pannaDigit ? bidPayload.pannaDigit : ""}`,
                            userId: userId,
                            isForAllUser: false,
                        });
                        if (user.deviceToken || getUserInfo.deviceToken) {
                            yield this.notification.sendPushNotification(user.deviceToken || getUserInfo.deviceToken, "Bid Created", `${getUserInfo.fullName} has placed a bid of ${+bidAmount} in ${getMarketDetails.marketName} with digits ${bidPayload.bidDigit} ${bidPayload.pannaDigit ? bidPayload.pannaDigit : ""}`, { description: `${getUserInfo.fullName} has placed a bid of ${+bidAmount} in ${getMarketDetails.marketName} with digits ${bidPayload.bidDigit} ${bidPayload.pannaDigit ? bidPayload.pannaDigit : ""}`, type: "notification" });
                        }
                    }
                    yield this.bidUtils.updateUser(getUserInfo, updatedWalletBalance);
                    const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("BID_SUCCESSFULL"), { createdBid }, true);
                    return res.status(response.statusCode).json(response);
                }
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("INTERNAL_SERVER_ERROR"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.bidHistoryController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { user } = req;
                const page = parseInt(req.query.page) || 1;
                let limit = parseInt(req.query.limit) || 3;
                if (req.query.limit === 'all' || req.query.limit === 'All') {
                    limit = 10000000000000000;
                }
                const startDate = req.query.startDate
                    ? new Date(req.query.startDate)
                    : null;
                const endDate = req.query.endDate
                    ? new Date(req.query.endDate)
                    : null;
                const { bids, totalBids } = yield this.bidUtils.getUserBidHistory(req.query.userId ? +req.query.userId : +user.id, page, limit, startDate, endDate);
                const bidHistory = bids.map((bid) => ({
                    bidAmount: bid.bidAmount,
                    bidDigit: bid.bidDigit && bid.pannaDigit ? `${bid.bidDigit} - ${bid.pannaDigit}` : bid.bidDigit,
                    winAmount: bid.winAmount,
                    winStatus: bid.winStatus,
                    session: bid.session,
                    date: bid.date,
                    marketName: bid.market.marketName,
                    gameName: bid.game.gameName,
                }));
                const totalPages = Math.ceil(totalBids / limit);
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("BID_HISTORY_SUCCESS"), {
                    bidHistory,
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
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("INTERNAL_SERVER_ERROR"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.winHistoryController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { user } = req;
                const page = parseInt(req.query.page) || 1;
                let limit = parseInt(req.query.limit) || 3;
                if (req.query.limit === 'all' || req.query.limit === 'All') {
                    limit = 10000000000000000;
                }
                const startDate = req.query.startDate
                    ? new Date(req.query.startDate)
                    : null;
                const endDate = req.query.endDate
                    ? new Date(req.query.endDate)
                    : null;
                const { bids, totalBids } = yield this.bidUtils.getUserBidHistory(req.query.userId ? +req.query.userId : +user.id, page, limit, startDate, endDate);
                const bidHistory = bids
                    .filter((bid) => bid.status === "completed")
                    .map((bid) => ({
                    id: +bid.id,
                    userId: +bid.userId,
                    marketId: +bid.marketId,
                    gameId: +bid.gameId,
                    date: bid.date,
                    status: bid.status,
                    session: bid.session,
                    bidDigit: bid.bidDigit && bid.pannaDigit ? `${bid.bidDigit} - ${bid.pannaDigit}` : bid.bidDigit,
                    bidAmount: +bid.bidAmount,
                    winAmount: +bid.winAmount,
                    winStatus: bid.winStatus,
                    deletedAt: bid.deletedAt,
                    createdAt: bid.createdAt,
                    updatedAt: bid.updatedAt,
                    market: bid.market.marketName,
                    game: bid.game.gameName,
                    pannaDigit: bid.pannaDigit,
                }));
                const totalPages = Math.ceil(totalBids / limit);
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("BID_HISTORY_SUCCESS"), {
                    bidHistory,
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
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("INTERNAL_SERVER_ERROR"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.winHistoryAdminController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { user } = req;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const today = req.query.today === "true"; // Check if the today query is present and true
                const { bids, totalBids } = yield this.bidUtils.getAdminBidHistoryWinning(+user.id, page, limit, today);
                const bidHistory = bids
                    .filter((bid) => bid.status === "completed")
                    .map((bid) => ({
                    id: +bid.id,
                    userId: +bid.userId,
                    marketId: +bid.marketId,
                    gameId: +bid.gameId,
                    date: bid.date,
                    status: bid.status,
                    session: bid.session,
                    bidDigit: +bid.bidDigit,
                    bidAmount: +bid.bidAmount,
                    winAmount: +bid.winAmount,
                    winStatus: bid.winStatus,
                    deletedAt: bid.deletedAt,
                    createdAt: bid.createdAt,
                    updatedAt: bid.updatedAt,
                    market: bid.market.marketName,
                    game: bid.game.gameName,
                    userName: bid.user.fullName,
                    phoneNumber: bid.user.phoneNumber,
                    pannaDigit: bid.pannaDigit,
                }));
                const totalPages = Math.ceil(totalBids / limit);
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("BID_HISTORY_SUCCESS"), {
                    data: bidHistory,
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
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("INTERNAL_SERVER_ERROR"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.bidHistoryByAdminController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { user } = req;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                let startDate = req.query.startDate
                    ? new Date(req.query.startDate)
                    : null;
                let endDate = req.query.endDate
                    ? new Date(req.query.endDate)
                    : null;
                // If today is true, override startDate and endDate with today's date range
                if (req.query.today === "true") {
                    const today = (0, moment_timezone_1.default)().tz("Asia/Kolkata");
                    startDate = today.startOf("day").toDate();
                    endDate = today.endOf("day").toDate();
                }
                const { bids, totalBids } = yield this.bidUtils.getAdminBidHistory(+user.id, page, limit, startDate, endDate);
                const bidHistory = bids.map((bid) => ({
                    id: bid.id,
                    bidAmount: bid.bidAmount,
                    bidDigit: bid.bidDigit,
                    winAmount: bid.winAmount,
                    winStatus: bid.winStatus,
                    session: bid.session,
                    date: bid.date,
                    marketName: bid.market.marketName,
                    gameName: bid.game.gameName,
                    userId: bid.user.id,
                    userName: bid.user.fullName,
                    phoneNumber: bid.user.phoneNumber,
                    status: bid.status,
                    pannaDigit: bid.pannaDigit,
                }));
                const totalPages = Math.ceil(totalBids / limit);
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("BID_HISTORY_SUCCESS"), {
                    data: bidHistory,
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
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("INTERNAL_SERVER_ERROR"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.updateBidController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { user } = req;
                //win status not required
                const { status, winAmount, winStatus } = req.body;
                const getUserInfo = yield this.bidUtils.getUserInfo(+user.id);
                if (winStatus) {
                    const updatedWalletBalance = new client_1.Prisma.Decimal(getUserInfo.wallet).add(new client_1.Prisma.Decimal(+winAmount));
                    yield this.bidUtils.updateUser(getUserInfo, updatedWalletBalance);
                }
                yield this.bidUtils.updateBid(+req.params.id, status, winStatus, +winAmount);
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("BID_UPDATE_SUCCESSFULL"), {}, true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("INTERNAL_SERVER_ERROR"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.declareBidResultController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { marketId, bidDigit, pannaDigit, session, date } = req.body;
                const ourDate = (0, moment_timezone_1.default)(date).tz("Asia/Kolkata").startOf("day").toDate();
                const getMarketDetails = yield this.bidUtils.getMarketDetails(+marketId);
                yield this.bidUtils.updateMarketResult(marketId, session, ourDate, bidDigit, pannaDigit);
                this.bidUtils.declareBidResultUtil(+marketId, session, bidDigit, pannaDigit, ourDate);
                this.bidUtils.declareHalfSangamBidResultUtil(+marketId, ourDate);
                const getMarketDetailsFinal = yield this.bidUtils.getMarketDetails(+marketId);
                const firstThree = (getMarketDetailsFinal === null || getMarketDetailsFinal === void 0 ? void 0 : getMarketDetailsFinal.openPanna) ? getMarketDetailsFinal === null || getMarketDetailsFinal === void 0 ? void 0 : getMarketDetailsFinal.openPanna : 'XXX';
                const firstX = (getMarketDetailsFinal === null || getMarketDetailsFinal === void 0 ? void 0 : getMarketDetailsFinal.openResult) ? getMarketDetailsFinal === null || getMarketDetailsFinal === void 0 ? void 0 : getMarketDetailsFinal.openResult.charAt(0) : 'X';
                const secondX = (getMarketDetailsFinal === null || getMarketDetailsFinal === void 0 ? void 0 : getMarketDetailsFinal.closeResult) ? getMarketDetailsFinal === null || getMarketDetailsFinal === void 0 ? void 0 : getMarketDetailsFinal.closeResult.charAt(0) : 'X';
                const lastThree = (getMarketDetailsFinal === null || getMarketDetailsFinal === void 0 ? void 0 : getMarketDetailsFinal.closePanna) ? getMarketDetailsFinal === null || getMarketDetailsFinal === void 0 ? void 0 : getMarketDetailsFinal.closePanna : 'XXX';
                const finalResult = `${firstThree}-${firstX}${secondX}-${lastThree}`;
                yield this.notificationUtils.createNotification({
                    title: `${getMarketDetails.marketName}`,
                    description: finalResult,
                    userId: null,
                    isForAllUser: true,
                });
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("BID_UPDATE_SUCCESSFUL"), {}, true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("INTERNAL_SERVER_ERROR"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.resultHistoryByAdminController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { user } = req;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const { bids, totalBids } = yield this.bidUtils.getAdminResultHistory(+user.id, page, limit);
                const bidHistory = bids.map((bid) => ({
                    id: bid.id,
                    marketId: bid.marketId,
                    marketName: bid.market.marketName,
                    session: bid.session,
                    bidDigit: bid.bidDigit,
                    date: bid.date,
                    pannaDigit: bid.pannaDigit,
                }));
                const totalPages = Math.ceil(totalBids / limit);
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("BID_HISTORY_SUCCESS"), {
                    data: bidHistory,
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
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("INTERNAL_SERVER_ERROR"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.getFamilyBidNumberController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { number } = req.body;
                if (!number) {
                    return res.status(400).json({
                        success: false,
                        message: "Number is required.",
                    });
                }
                if (+req.query.gameId === 8) {
                    const parsedNumber = number;
                    const matchedArray = this.jodiChartData.find((box) => box.includes(parsedNumber));
                    if (matchedArray) {
                        const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("SUCCESS"), { data: matchedArray }, true);
                        return res.status(response.statusCode).json(response);
                    }
                    else {
                        const response = this.commonUtils.genMobileApiSuccessResponse(false, constants_1.Constants.resStatusCode.error.notFound, req.t("NO_DATA_FOUND"), {}, true);
                        return res.status(response.statusCode).json(response);
                    }
                }
                else if (+req.query.gameId === 9) {
                    const parsedNumber = number;
                    const matchedArray = this.chartData.find((box) => box.includes(parsedNumber));
                    if (matchedArray) {
                        const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("SUCCESS"), { data: matchedArray }, true);
                        return res.status(response.statusCode).json(response);
                    }
                    else {
                        const response = this.commonUtils.genMobileApiSuccessResponse(false, constants_1.Constants.resStatusCode.error.notFound, req.t("NO_DATA_FOUND"), {}, true);
                        return res.status(response.statusCode).json(response);
                    }
                }
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("INTERNAL_SERVER_ERROR"), err);
                return res.status(response.statusCode).json(response);
            }
        });
    }
}
exports.BidController = BidController;
//# sourceMappingURL=bidController.js.map