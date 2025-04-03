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
exports.NotificationController = void 0;
const commonUtils_1 = require("../../helpers/commonUtils");
const constants_1 = require("../../config/constants");
const notificationUtils_1 = require("./notificationUtils");
const jwt_1 = require("../../helpers/jwt");
class NotificationController {
    constructor() {
        this.notificationUtils = new notificationUtils_1.NotificationUtils();
        this.commonUtils = new commonUtils_1.CommonUtils();
        this.addNotificationController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { title, description, userId, isForAllUser } = req.body;
                if (!description) {
                    const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("DESCRIPTION_IS_REQUIRED"));
                    return res.status(response.statusCode).json(response);
                }
                if (!title) {
                    const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("REQ_TITLE"));
                    return res.status(response.statusCode).json(response);
                }
                if (!userId && !isForAllUser) {
                    const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("REQ_NUMBER"));
                    return res.status(response.statusCode).json(response);
                }
                const newNotification = yield this.notificationUtils.createNotification({
                    description,
                    title,
                    userId,
                    isForAllUser,
                });
                if (!newNotification) {
                    const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("NOTIFICATION_NOT_ADDED_SUCCESSFULLY"));
                    return res.status(response.statusCode).json(response);
                }
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("NOTIFICATION_ADDED_SUCCESSFULLY"), { notification: newNotification }, true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("INTERNAL_SERVER_ERROR"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.getNotificationController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const token = req.headers.authorization;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 3;
                const userId = jwt_1.Jwt.decodeAuthToken(token);
                const notifications = yield this.notificationUtils.getAllnotification({
                    userId: userId.id,
                    page,
                    limit,
                });
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("NOTIFICATION_FETCH_SUCCESSFULLY"), notifications, true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("INTERNAL_SERVER_ERROR"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.updateNotificationReadController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id: notificationId } = req.body;
                const token = req.headers.authorization;
                const userId = jwt_1.Jwt.decodeAuthToken(token);
                if (!notificationId) {
                    const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("ID_IS_REQUIRED"));
                    return res.status(response.statusCode).json(response);
                }
                const updateNotification = yield this.notificationUtils.updateNotificationRead({
                    id: notificationId,
                    userId: userId.id,
                });
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("NOTIFICATION_READ_SUCCESSFULLY"), updateNotification, true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("INTERNAL_SERVER_ERROR"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.getNotificationControllerByAdmin = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const token = req.headers.authorization;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const { notifications, totalNotification } = yield this.notificationUtils.getAllnotificationByAdmin({ page, limit });
                const totalPages = Math.ceil(totalNotification / limit);
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("NOTIFICATION_FETCH_SUCCESSFULLY"), {
                    data: notifications,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        limit,
                        totalData: totalNotification,
                    },
                }, true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("INTERNAL_SERVER_ERROR"), err);
                return res.status(response.statusCode).json(response);
            }
        });
    }
}
exports.NotificationController = NotificationController;
//# sourceMappingURL=notificationController.js.map