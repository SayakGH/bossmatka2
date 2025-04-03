"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRoute = void 0;
// Import only what we need from express
const express_1 = require("express");
const middleware_1 = require("../../helpers/middleware");
const gameController_1 = require("./gameController");
const gameMiddleware_1 = require("./gameMiddleware");
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// Assign router to the express.Router() instance
const router = (0, express_1.Router)();
// const v: Validator = new Validator();
const gameController = new gameController_1.GameController();
const gameMiddleware = new gameMiddleware_1.GameMiddleware();
const middleware = new middleware_1.Middleware();
const addGameMiddleware = [
    middleware.adminAuthenticationMiddleware,
    upload.array('files'),
    gameController.addGameController
];
router.post('/add-game', addGameMiddleware);
const getGameRateMiddleware = [
    middleware.authenticationMiddleware,
    gameController.getGameRateController
];
router.get('/get-game-rate', getGameRateMiddleware);
const getGamesAdminMiddleware = [
    middleware.adminAuthenticationMiddleware,
    gameController.getGamesAdminController
];
router.get('/get-games', getGamesAdminMiddleware);
const getGameRateByAdminMiddleware = [
    middleware.adminAuthenticationMiddleware,
    gameController.getGameRateByAdminController
];
router.get('/get-game-rate-by-admin', getGameRateByAdminMiddleware);
const updateGameMiddleware = [
    middleware.adminAuthenticationMiddleware,
    upload.array('files'),
    gameController.updateGameController
];
router.post('/update-game/:id', updateGameMiddleware);
const deleteGameMiddleware = [
    middleware.adminAuthenticationMiddleware,
    gameController.deleteGameController
];
router.delete('/delete-game/:id', deleteGameMiddleware);
exports.GameRoute = router;
//# sourceMappingURL=gameRoute.js.map