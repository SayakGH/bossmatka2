"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRoute = void 0;
// Import only what we need from express
const express_1 = require("express");
const middleware_1 = require("../../helpers/middleware");
const notificationController_1 = require("./notificationController");
// Assign router to the express.Router() instance
const router = (0, express_1.Router)();
const notificationController = new notificationController_1.NotificationController();
const middleware = new middleware_1.Middleware();
const addNotificationMiddleware = [
    middleware.authenticationMiddleware,
    middleware.reqValidator,
    notificationController.addNotificationController,
];
router.post("/add-notification", addNotificationMiddleware);
const getNoticeMiddleware = [
    middleware.authenticationMiddleware,
    middleware.reqValidator,
    notificationController.getNotificationController,
];
router.get("/get-notification", getNoticeMiddleware);
const UpdateNoticeMiddleware = [
    middleware.authenticationMiddleware,
    middleware.reqValidator,
    notificationController.updateNotificationReadController,
];
router.post("/update-notification", UpdateNoticeMiddleware);
const getNoticeByAdminMiddleware = [
    middleware.adminAuthenticationMiddleware,
    notificationController.getNotificationControllerByAdmin,
];
router.get("/get-notification-by-admin", getNoticeByAdminMiddleware);
exports.NotificationRoute = router;
//# sourceMappingURL=notificationRoute.js.map