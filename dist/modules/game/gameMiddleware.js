"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameMiddleware = void 0;
const gameUtils_1 = require("./gameUtils");
const commonUtils_1 = require("../../helpers/commonUtils");
class GameMiddleware {
    constructor() {
        this.gameUtils = new gameUtils_1.GameUtils();
        this.commonUtils = new commonUtils_1.CommonUtils();
        this.validateSendOtpBody = (req, res, next) => {
            if (!req.body.number || req.body.number === '') {
                req.validations = Object.assign(Object.assign({}, req.validations), { number: {
                        rules: [
                            {
                                type: 'notEmpty',
                                msg: 'REQ_NUMBER',
                            },
                        ],
                    } });
            }
            next();
        };
    }
}
exports.GameMiddleware = GameMiddleware;
//# sourceMappingURL=gameMiddleware.js.map