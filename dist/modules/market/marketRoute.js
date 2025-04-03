"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketRoute = void 0;
// Import only what we need from express
const express_1 = require("express");
const middleware_1 = require("../../helpers/middleware");
const marketController_1 = require("./marketController");
const marketMiddleware_1 = require("./marketMiddleware");
// Assign router to the express.Router() instance
const router = (0, express_1.Router)();
// const v: Validator = new Validator();
const marketController = new marketController_1.MarketController();
const marketMiddleware = new marketMiddleware_1.MarketMiddleware();
const middleware = new middleware_1.Middleware();
const addMarketMiddleware = [
    middleware.adminAuthenticationMiddleware,
    marketController.addMarketController
];
router.post('/add-market', addMarketMiddleware);
const getMarketMiddleware = [
    middleware.adminAuthenticationMiddleware,
    marketController.getMarketController
];
router.get('/get-market', getMarketMiddleware);
const updateMarketMiddleware = [
    middleware.adminAuthenticationMiddleware,
    marketController.updateMarketController
];
router.put('/update-market', updateMarketMiddleware);
const deleteMarketMiddleware = [
    middleware.adminAuthenticationMiddleware,
    marketController.deleteMarketController
];
router.delete('/delete-market/:id', deleteMarketMiddleware);
exports.MarketRoute = router;
//# sourceMappingURL=marketRoute.js.map