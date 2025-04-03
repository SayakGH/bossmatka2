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
exports.Notification = void 0;
const admin = __importStar(require("firebase-admin"));
const dotenv = __importStar(require("dotenv"));
const logger_1 = require("./logger");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount = require('../config/ak-online-e3871-firebase-adminsdk-r2nyu-918fc690b9.json');
dotenv.config();
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DB_URL,
});
class Notification {
    constructor() {
        this.logger = logger_1.Log.getLogger();
        this.sendPushNotification = (token_1, title_1, body_1, ...args_1) => __awaiter(this, [token_1, title_1, body_1, ...args_1], void 0, function* (token, title, body, data = {}) {
            const newData = Object.assign(Object.assign({}, data), { title, click_action: 'FLUTTER_NOTIFICATION_CLICK' });
            const payload = {
                "token": token,
                "notification": {
                    "body": body,
                    "title": title
                },
            };
            const options = {
                priority: 'high',
                timeToLive: 60 * 60 * 24,
            };
            admin
                .messaging()
                .send(payload)
                .then((response) => {
                this.logger.info('Notification Result', JSON.stringify(response));
                return true;
            })
                .catch((error) => {
                this.logger.error('Error sending Notification:', error);
                return true;
            });
        });
    }
}
exports.Notification = Notification;
//# sourceMappingURL=notification.js.map