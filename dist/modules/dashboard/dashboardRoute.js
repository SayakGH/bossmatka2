"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardRoute = void 0;
// Import only what we need from express
const express_1 = require("express");
const middleware_1 = require("../../helpers/middleware");
const dashboardController_1 = require("./dashboardController");
const dashboardMiddleware_1 = require("./dashboardMiddleware");
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// Assign router to the express.Router() instance
const router = (0, express_1.Router)();
// const v: Validator = new Validator();
const dashboardController = new dashboardController_1.DashboardController();
const dashboardMiddleware = new dashboardMiddleware_1.DashboardMiddleware();
const middleware = new middleware_1.Middleware();
const addDashboardMiddleware = [
    middleware.authenticationMiddleware,
    dashboardController.addDashboardController
];
router.get('/dashboard', addDashboardMiddleware);
const addTransactionMiddleware = [
    middleware.authenticationMiddleware,
    dashboardController.addTransactionController
];
router.post('/add-transaction', addTransactionMiddleware);
const getTransactionMiddleware = [
    middleware.authenticationMiddleware,
    dashboardController.getTransactionHistoryController
];
router.get('/get-transaction-history', getTransactionMiddleware);
const getTransactionByAdminMiddleware = [
    middleware.authenticationMiddleware,
    dashboardController.getTransactionHistoryByAdminController
];
router.get('/get-transaction-history-by-admin', getTransactionByAdminMiddleware);
const updateTxnByAdminMiddleware = [
    middleware.authenticationMiddleware,
    dashboardController.updateTxnByAdminController
];
router.put('/update-txn-by-admin/:id', updateTxnByAdminMiddleware);
const addDashboardByAdminMiddleware = [
    middleware.adminAuthenticationMiddleware,
    dashboardController.addDashboardByAdminController
];
router.get('/dashboard-by-admin', addDashboardByAdminMiddleware);
const addBannerMiddleware = [
    middleware.adminAuthenticationMiddleware,
    upload.array('files'),
    dashboardController.addBannerController
];
router.post('/add-banner', addBannerMiddleware);
const updateBannerMiddleware = [
    middleware.adminAuthenticationMiddleware,
    upload.array('files'),
    dashboardController.updateBannerController
];
router.post('/update-banner/:id', updateBannerMiddleware);
const getBannerMiddleware = [
    dashboardController.getBannerController
];
router.post('/get-banner', getBannerMiddleware);
const addSettingMiddleware = [
    middleware.adminAuthenticationMiddleware,
    dashboardController.setSettingController
];
router.post('/set-setting', addSettingMiddleware);
const changeMarketStatusMiddleware = [
    middleware.adminAuthenticationMiddleware,
    dashboardController.changeMarketStatusController
];
router.post('/change-market-status', changeMarketStatusMiddleware);
const getTransactionByIdMiddleware = [
    middleware.authenticationMiddleware,
    dashboardController.getTransactionHistoryByUserIdController
];
router.get('/get-transaction-history-by-admin/:id', getTransactionByIdMiddleware);
const getLoadDetailsMiddleware = [
    middleware.authenticationMiddleware,
    dashboardController.getMarketGameBidsByTypeController
];
router.get('/get-load-details/:marketId', getLoadDetailsMiddleware);
const getActvityByUserIdMiddleware = [
    middleware.authenticationMiddleware,
    dashboardController.getActvityByUserIdController
];
router.get('/get-activity-history-by-admin/:id', getActvityByUserIdMiddleware);
const gamesDetailsWithMarketMiddleware = [
    middleware.authenticationMiddleware,
    dashboardController.getGamesByMarketController
];
router.get('/get-games-by-market/:marketId', gamesDetailsWithMarketMiddleware);
exports.DashboardRoute = router;
//# sourceMappingURL=dashboardRoute.js.map