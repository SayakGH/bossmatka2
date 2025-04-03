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
exports.NoticeUtils = void 0;
const logger_1 = require("../../helpers/logger");
const client_1 = require("@prisma/client");
class NoticeUtils {
    constructor() {
        this.prisma = new client_1.PrismaClient();
        this.logger = logger_1.Log.getLogger();
    }
    // Function to ensure uniqueness of the 6-digit ID
    createNoticeRule(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { description } = payload;
            const notice = yield this.prisma.noticesRules.create({
                data: { description },
            });
            return notice;
        });
    }
    updateNoticeRule(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { description, id } = payload;
            let updatePayload = { description };
            const notice = yield this.prisma.noticesRules.update({
                data: updatePayload,
                where: { id },
            });
            return notice;
        });
    }
    deactivateNoticeRule(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { active, id } = payload;
            const notice = yield this.prisma.noticesRules.update({
                data: { active },
                where: { id },
            });
            return notice;
        });
    }
    getAllNotice() {
        return __awaiter(this, void 0, void 0, function* () {
            const notices = yield this.prisma.noticesRules.findMany({
                where: { active: true },
            });
            return notices;
        });
    }
    getAllNoticeByAdmin(page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * limit;
            const notice = yield this.prisma.noticesRules.findMany({
                where: {
                    active: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip: skip,
                take: limit,
            });
            const totalNotice = yield this.prisma.noticesRules.count({
                where: {
                    active: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            return { notice, totalNotice };
        });
    }
}
exports.NoticeUtils = NoticeUtils;
//# sourceMappingURL=noticeRuleUtils.js.map