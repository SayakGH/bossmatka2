"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardMiddleware = void 0;
const dashboardUtils_1 = require("./dashboardUtils");
const commonUtils_1 = require("../../helpers/commonUtils");
class DashboardMiddleware {
    constructor() {
        this.dashboardUtils = new dashboardUtils_1.DashboardUtils();
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
exports.DashboardMiddleware = DashboardMiddleware;
//# sourceMappingURL=dashboardMiddleware.js.map