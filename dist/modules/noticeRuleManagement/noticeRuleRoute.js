"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoticeRoute = void 0;
// Import only what we need from express
const express_1 = require("express");
const middleware_1 = require("../../helpers/middleware");
const noticeRuleController_1 = require("./noticeRuleController");
// Assign router to the express.Router() instance
const router = (0, express_1.Router)();
const noticeController = new noticeRuleController_1.NoticeController();
const middleware = new middleware_1.Middleware();
const addNoticeMiddleware = [
    middleware.adminAuthenticationMiddleware,
    noticeController.addNoticeController,
];
router.post("/add-notice", addNoticeMiddleware);
const getNoticeMiddleware = [
    middleware.authenticationMiddleware,
    middleware.reqValidator,
    noticeController.getNoticeController,
];
router.get("/get-notice", getNoticeMiddleware);
const UpdateNoticeMiddleware = [
    middleware.adminAuthenticationMiddleware,
    noticeController.updateNoticeController,
];
router.post("/update-notice", UpdateNoticeMiddleware);
const updateNoticeStatusMiddleware = [
    middleware.adminAuthenticationMiddleware,
    noticeController.noticeStatusController,
];
router.post("/notice-status", updateNoticeStatusMiddleware);
const getNoticeByAdminMiddleware = [
    middleware.adminAuthenticationMiddleware,
    noticeController.getNoticeByAdminController,
];
router.get("/get-notice-by-admin", getNoticeByAdminMiddleware);
exports.NoticeRoute = router;
//# sourceMappingURL=noticeRuleRoute.js.map