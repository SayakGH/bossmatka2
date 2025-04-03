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
exports.MarketController = void 0;
const marketHelper_1 = require("./marketHelper");
const marketUtils_1 = require("./marketUtils");
const commonUtils_1 = require("../../helpers/commonUtils");
const constants_1 = require("../../config/constants");
var mongoose = require('mongoose');
class MarketController {
    constructor() {
        this.marketUtils = new marketUtils_1.MarketUtils();
        this.marketHelper = new marketHelper_1.MarketHelper();
        this.commonUtils = new commonUtils_1.CommonUtils();
        this.addMarketController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { openTime, closeTime, marketName, weekdayStatus } = req.body;
                const adminsId = +req.user.id;
                const newMarket = yield this.marketUtils.createMarket({
                    openTime,
                    closeTime,
                    marketName,
                    adminsId,
                    weekdayStatus
                });
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t('MARKET_ADDED_SUCCESSFULLY'), { market: newMarket }, true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t('INTERNAL_SERVER_ERROR'), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.getMarketController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const adminsId = +req.user.id;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const { markets, totalMarkets } = yield this.marketUtils.getMarket(adminsId, page, limit);
                const formattedMarkets = markets.map((market) => (Object.assign(Object.assign({}, market), { openTime: this.marketUtils.formatTimeTo12Hour(market.openTime), closeTime: this.marketUtils.formatTimeTo12Hour(market.closeTime) })));
                const totalPages = Math.ceil(totalMarkets / limit);
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t('MARKET_FETCHED'), {
                    data: formattedMarkets,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        limit,
                        totalData: totalMarkets
                    },
                }, true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t('INTERNAL_SERVER_ERROR'), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.updateMarketController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { openTime, closeTime, marketName, resultDate, marketId, weekdayStatus } = req.body;
                const adminsId = +req.user.id;
                let updateData = {};
                if (openTime) {
                    updateData.openTime = openTime;
                }
                if (closeTime) {
                    updateData.closeTime = closeTime;
                }
                if (marketName) {
                    updateData.marketName = marketName;
                }
                if (resultDate) {
                    updateData.resultDate = new Date(resultDate);
                }
                if (adminsId) {
                    updateData.adminsId = adminsId;
                }
                if (weekdayStatus) {
                    updateData.weekdayStatus = weekdayStatus;
                }
                const newMarket = yield this.marketUtils.updateMarket(marketId, updateData);
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t('MARKET_UPDATE_SUCCESSFULL'), {}, true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t('INTERNAL_SERVER_ERROR'), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.deleteMarketController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedMarket = yield this.marketUtils.deleteMarket(+req.params.id);
                if (!updatedMarket) {
                    throw updatedMarket;
                }
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t('MARKET_DELETED_SUCCESSFULLY'), {}, true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t('INTERNAL_SERVER_ERROR'), err);
                return res.status(response.statusCode).json(response);
            }
        });
    }
}
exports.MarketController = MarketController;
//# sourceMappingURL=marketController.js.map