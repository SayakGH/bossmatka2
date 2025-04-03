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
exports.NotificationUtils = void 0;
const client_1 = require("@prisma/client");
const notification_1 = require("../../helpers/notification");
class NotificationUtils {
    constructor() {
        this.prisma = new client_1.PrismaClient();
        this.notification = new notification_1.Notification();
    }
    // Function to ensure uniqueness of the 6-digit ID
    createNotification(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { title, description, userId, isForAllUser = false } = payload;
            if (isForAllUser) {
                const getAllUser = yield this.prisma.users.findMany({
                    select: { id: true, deviceToken: true },
                });
                if (getAllUser === null || getAllUser === void 0 ? void 0 : getAllUser.length) {
                    yield Promise.all(getAllUser.map((user) => __awaiter(this, void 0, void 0, function* () {
                        yield this.prisma.notifications.create({
                            data: { title, description, userId: user.id },
                        });
                    })));
                    getAllUser.forEach((user) => __awaiter(this, void 0, void 0, function* () {
                        if (user.deviceToken) {
                            yield this.notification.sendPushNotification(user.deviceToken, title, description, { description: description, type: "notification" });
                        }
                    }));
                    return true;
                }
            }
            const notification = yield this.prisma.notifications.create({
                data: { title, description, userId },
            });
            return notification;
        });
    }
    updateNotificationRead(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, userId } = payload;
            const notice = yield this.prisma.notifications.update({
                data: { isRead: true },
                where: { id, userId },
            });
            return notice;
        });
    }
    getAllnotification(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, limit, page } = payload;
            const skip = (page - 1) * limit;
            const notification = yield this.prisma.notifications.findMany({
                where: { isRead: false, userId },
                orderBy: {
                    createdAt: "desc",
                },
                skip: skip,
                take: limit,
            });
            return notification;
        });
    }
    getAllnotificationByAdmin(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, page } = payload;
            const skip = (page - 1) * limit;
            const notifications = yield this.prisma.notifications.findMany({
                where: {},
                orderBy: {
                    createdAt: 'desc',
                },
                skip: skip,
                take: limit,
            });
            const totalNotification = yield this.prisma.notifications.count({
                where: {},
                orderBy: {
                    createdAt: 'desc',
                },
            });
            return { notifications, totalNotification };
        });
    }
}
exports.NotificationUtils = NotificationUtils;
//# sourceMappingURL=notificationUtils.js.map