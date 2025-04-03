"use strict";
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
exports.UserMiddleware = void 0;
const userUtils_1 = require("./userUtils");
const constants_1 = require("../../config/constants");
const commonUtils_1 = require("../../helpers/commonUtils");
const jwt_1 = require("../../helpers/jwt");
class UserMiddleware {
    constructor() {
        this.userUtils = new userUtils_1.UserUtils();
        this.commonUtils = new commonUtils_1.CommonUtils();
        this.checkIfUserExists = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Check in valid user
                const token = req.headers.authorization;
                const userId = jwt_1.Jwt.decodeAuthToken(token);
                const currentUser = yield this.userUtils.getUserByid({ id: userId.id });
                if (currentUser) {
                    return next();
                }
                // If no user is found
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.notFound, req.t("USER_NOT_FOUND"), {});
                return res.status(response.statusCode).json(response);
            }
            catch (error) {
                console.warn(error, "error");
                // Handle any unexpected errors
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("INTERNAL_SERVER_ERROR"), {});
                return res.status(response.statusCode).json(response);
            }
        });
    }
}
exports.UserMiddleware = UserMiddleware;
//# sourceMappingURL=userMiddleware.js.map