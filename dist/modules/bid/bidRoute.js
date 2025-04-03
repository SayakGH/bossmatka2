"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BidRoute = void 0;
// Import only what we need from express
const express_1 = require("express");
const middleware_1 = require("../../helpers/middleware");
const bidController_1 = require("./bidController");
const bidMiddleware_1 = require("./bidMiddleware");
// Assign router to the express.Router() instance
const router = (0, express_1.Router)();
// const v: Validator = new Validator();
const bidController = new bidController_1.BidController();
const bidMiddleware = new bidMiddleware_1.BidMiddleware();
const middleware = new middleware_1.Middleware();
const addBidMiddleware = [
    middleware.authenticationMiddleware,
    bidController.addBidController
];
router.post('/add-bid', addBidMiddleware);
const bidHistoryMiddleware = [
    middleware.authenticationMiddleware,
    bidController.bidHistoryController
];
router.get('/bid-history', bidHistoryMiddleware);
const winHistoryMiddleware = [
    middleware.authenticationMiddleware,
    bidController.winHistoryController
];
router.get('/win-history', winHistoryMiddleware);
const winHistoryAdminMiddleware = [
    middleware.adminAuthenticationMiddleware,
    bidController.winHistoryAdminController
];
router.get('/win-history-admin', winHistoryAdminMiddleware);
const bidHistoryByAdminMiddleware = [
    middleware.adminAuthenticationMiddleware,
    bidController.bidHistoryByAdminController
];
router.get('/bid-history-admin', bidHistoryByAdminMiddleware);
const updateBidMiddleware = [
    middleware.authenticationMiddleware,
    bidController.updateBidController
];
router.post('/update-bid/:id', updateBidMiddleware);
const declareBidResultMiddleware = [
    middleware.adminAuthenticationMiddleware,
    bidController.declareBidResultController
];
router.post('/declare-bid-result', declareBidResultMiddleware);
const resultHistoryByAdminMiddleware = [
    middleware.adminAuthenticationMiddleware,
    bidController.resultHistoryByAdminController
];
router.get('/result-history-admin', resultHistoryByAdminMiddleware);
const getFamilyDigitMiddleware = [
    middleware.adminAuthenticationMiddleware,
    bidController.getFamilyBidNumberController
];
router.get('/generate-digits', getFamilyDigitMiddleware);
exports.BidRoute = router;
//# sourceMappingURL=bidRoute.js.map