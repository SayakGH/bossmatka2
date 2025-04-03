"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Routes = void 0;
const express = __importStar(require("express"));
const l10n = __importStar(require("jm-ez-l10n"));
const userRoute_1 = require("./modules/userManagement/userRoute");
const marketRoute_1 = require("./modules/market/marketRoute");
const gameRoute_1 = require("./modules/game/gameRoute");
const dashboardRoute_1 = require("./modules/dashboard/dashboardRoute");
const bidRoute_1 = require("./modules/bid/bidRoute");
const noticeRuleRoute_1 = require("./modules/noticeRuleManagement/noticeRuleRoute");
const notificationRoute_1 = require("./modules/notification/notificationRoute");
class Routes {
    constructor(NODE_ENV) {
        switch (NODE_ENV) {
            case "production":
                this.basePath = "/app/dist";
                break;
            case "development":
                this.basePath = "/app/public";
                break;
        }
    }
    defaultRoute(req, res) {
        res.json({
            message: "Hello !",
        });
    }
    path() {
        const router = express.Router();
        router.use("/user", userRoute_1.UserRoute);
        router.use("/market", marketRoute_1.MarketRoute);
        router.use("/game", gameRoute_1.GameRoute);
        router.use("/dashboard", dashboardRoute_1.DashboardRoute);
        router.use("/bid", bidRoute_1.BidRoute);
        router.use("/notice-rule", noticeRuleRoute_1.NoticeRoute);
        router.use("/notification", notificationRoute_1.NotificationRoute);
        router.all("/*", (req, res) => {
            return res.status(404).json({
                error: l10n.t("ERR_URL_NOT_FOUND"),
            });
        });
        return router;
    }
}
exports.Routes = Routes;
//# sourceMappingURL=routes.js.map