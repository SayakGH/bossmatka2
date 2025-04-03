"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BidMiddleware = void 0;
const bidUtils_1 = require("./bidUtils");
const commonUtils_1 = require("../../helpers/commonUtils");
class BidMiddleware {
    constructor() {
        this.bidUtils = new bidUtils_1.BidUtils();
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
exports.BidMiddleware = BidMiddleware;
//# sourceMappingURL=bidMiddleware.js.map