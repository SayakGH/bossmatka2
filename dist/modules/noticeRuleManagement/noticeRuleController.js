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
exports.NoticeController = void 0;
const noticeRuleUtils_1 = require("./noticeRuleUtils");
const commonUtils_1 = require("../../helpers/commonUtils");
const constants_1 = require("../../config/constants");
class NoticeController {
    constructor() {
        this.noticeUtils = new noticeRuleUtils_1.NoticeUtils();
        this.commonUtils = new commonUtils_1.CommonUtils();
        this.addNoticeController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { description } = req.body;
                if (!description) {
                    const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("DESCRIPTION_IS_REQUIRED"));
                    return res.status(response.statusCode).json(response);
                }
                const newNotice = yield this.noticeUtils.createNoticeRule({
                    description,
                });
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("NOTICE_ADDED_SUCCESSFULLY"), { notice: newNotice }, true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("INTERNAL_SERVER_ERROR"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.getNoticeController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const notices = yield this.noticeUtils.getAllNotice();
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("NOTICE_FETCHED_SUCCESSFULLY"), { notice: notices }, true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("INTERNAL_SERVER_ERROR"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.updateNoticeController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id, description } = req.body;
                if (!id) {
                    const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("ID_IS_REQUIRED"));
                    return res.status(response.statusCode).json(response);
                }
                if (!description) {
                    const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("DESCRIPTION_IS_REQUIRED"));
                    return res.status(response.statusCode).json(response);
                }
                const updateNotice = yield this.noticeUtils.updateNoticeRule({
                    id,
                    description,
                });
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("NOTICE_UPDATE_SUCCESSFULLY"), { notice: updateNotice }, true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("INTERNAL_SERVER_ERROR"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.noticeStatusController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id, active } = req.body;
                if (!id) {
                    const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("ID_IS_REQUIRED"));
                    return res.status(response.statusCode).json(response);
                }
                if (!active && active != false) {
                    const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("NOTICE_STATUS_REQUIRED"));
                    return res.status(response.statusCode).json(response);
                }
                const updateNotice = yield this.noticeUtils.deactivateNoticeRule({
                    id,
                    active,
                });
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("NOTICE_UPDATE_SUCCESSFULLY"), { notice: updateNotice }, true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("INTERNAL_SERVER_ERROR"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.getNoticeByAdminController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const { notice, totalNotice } = yield this.noticeUtils.getAllNoticeByAdmin(page, limit);
                const totalPages = Math.ceil(totalNotice / limit);
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t('NOTICE_FETCHED_SUCCESSFULLY'), {
                    data: notice,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        limit,
                        totalData: totalNotice
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
exports.NoticeController = NoticeController;
//# sourceMappingURL=noticeRuleController.js.map