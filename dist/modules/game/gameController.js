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
exports.GameController = void 0;
const gameHelper_1 = require("./gameHelper");
const gameUtils_1 = require("./gameUtils");
const commonUtils_1 = require("../../helpers/commonUtils");
const constants_1 = require("../../config/constants");
var mongoose = require('mongoose');
class GameController {
    constructor() {
        this.gameUtils = new gameUtils_1.GameUtils();
        this.gameHelper = new gameHelper_1.GameHelper();
        this.commonUtils = new commonUtils_1.CommonUtils();
        this.addGameController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { gameName, rate } = req.body;
                const { files } = req;
                const { user: authUser } = req;
                const adminsId = +authUser.id;
                if (!files || files.length === 0) {
                    const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.error.badRequest, req.t('SELECT_FILE'), {}, true);
                    return res.status(response.statusCode).json(response);
                }
                // Create the game using the utility function
                const newGame = yield this.gameUtils.createGame({ gameName, rate, adminsId, files });
                // Connect the game to all non-deleted markets
                yield this.gameUtils.connectGameToActiveMarkets(newGame.id);
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t('GAME_ADDED_AND_CONNECTED_SUCCESSFULLY'), { game: newGame }, true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t('INTERNAL_SERVER_ERROR'), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.getGameRateController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const gamesData = yield this.gameUtils.getAllGame();
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t('SUCCSSFULLY_GOT_ALL_GAMES'), { gamesData }, true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t('INTERNAL_SERVER_ERROR'), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.getGamesAdminController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const { games, totalGames } = yield this.gameUtils.getAllGameWithAdminId(+req.user.id, page, limit);
                const totalPages = Math.ceil(totalGames / limit);
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t('SUCCSSFULLY_GOT_ALL_GAMES'), {
                    data: games,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        limit,
                        totalData: totalGames
                    },
                }, true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t('INTERNAL_SERVER_ERROR'), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.getGameRateByAdminController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const { games, totalGames } = yield this.gameUtils.getAllGameWithAdminId(+req.user.id, page, limit);
                const totalPages = Math.ceil(totalGames / limit);
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t('SUCCSSFULLY_GOT_ALL_GAMES'), {
                    data: games,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        limit,
                        totalData: totalGames
                    },
                }, true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t('INTERNAL_SERVER_ERROR'), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.updateGameController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { gameName, rate } = req.body;
                const { files } = req;
                let updateData = {};
                if (gameName) {
                    updateData.gameName = gameName;
                }
                if (rate) {
                    updateData.rate = rate;
                }
                if (files && files.length > 0) {
                    updateData.fileName = files[0].originalname;
                    updateData.fileType = files[0].mimetype;
                    updateData.fileData = files[0].buffer;
                }
                const newGame = yield this.gameUtils.updateGame(+req.params.id, updateData);
                if (!newGame) {
                    throw newGame;
                }
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t('GAME_UPDATE_SUCCESSFULL'), {}, true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t('INTERNAL_SERVER_ERROR'), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.deleteGameController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedGame = yield this.gameUtils.deleteGame(+req.params.id);
                if (!updatedGame) {
                    throw updatedGame;
                }
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t('GAME_DELETED_SUCCESSFULLY'), {}, true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t('INTERNAL_SERVER_ERROR'), err);
                return res.status(response.statusCode).json(response);
            }
        });
    }
}
exports.GameController = GameController;
//# sourceMappingURL=gameController.js.map