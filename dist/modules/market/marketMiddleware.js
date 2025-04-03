"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketMiddleware = void 0;
const marketUtils_1 = require("./marketUtils");
const commonUtils_1 = require("../../helpers/commonUtils");
class MarketMiddleware {
    constructor() {
        this.marketUtils = new marketUtils_1.MarketUtils();
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
exports.MarketMiddleware = MarketMiddleware;
//# sourceMappingURL=marketMiddleware.js.map