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
exports.Middleware = void 0;
const jwt_1 = require("./jwt");
const responseBuilder_1 = require("./responseBuilder");
const validation_1 = require("./validation");
const _ = __importStar(require("lodash"));
const commonUtils_1 = require("./commonUtils");
class Middleware {
    constructor() {
        // public _v = new _V();
        this.commonUtils = new commonUtils_1.CommonUtils();
        this.authenticationMiddleware = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (req.headers.authorization && !_.isEmpty(req.headers.authorization)) {
                    const tokenInfo = jwt_1.Jwt.decodeAuthToken(req.headers.authorization.toString());
                    req.tokenInfo = tokenInfo;
                    if (tokenInfo) {
                        req.user = tokenInfo;
                        next();
                    }
                    else {
                        const responseData = responseBuilder_1.ResponseBuilder.authErrorMessage("ERR_UNAUTH");
                        return res.status(responseData.code).json(responseData);
                    }
                }
                else {
                    const responseData = responseBuilder_1.ResponseBuilder.authErrorMessage("ERR_UNAUTH");
                    return res.status(responseData.code).json(responseData);
                }
            }
            catch (err) {
                const responseData = responseBuilder_1.ResponseBuilder.error(err);
                responseData.toast = true;
                return res.status(responseData.code).json(responseData);
            }
        });
        this.reqValidator = (req, res, next) => {
            const { validations } = req;
            const error = (0, validation_1.validate)(req, validations);
            if (!_.isEmpty(error)) {
                res.status(error.statusCode).json(error);
            }
            else {
                next();
            }
        };
        this.adminAuthenticationMiddleware = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (req.headers.authorization && !_.isEmpty(req.headers.authorization)) {
                    const tokenInfo = jwt_1.Jwt.decodeAuthToken(req.headers.authorization.toString());
                    req.tokenInfo = tokenInfo;
                    if (tokenInfo) {
                        req.user = tokenInfo;
                        next();
                    }
                    else {
                        const responseData = responseBuilder_1.ResponseBuilder.authErrorMessage("ERR_UNAUTH");
                        return res.status(responseData.code).json(responseData);
                    }
                }
                else {
                    const responseData = responseBuilder_1.ResponseBuilder.authErrorMessage("ERR_UNAUTH");
                    return res.status(responseData.code).json(responseData);
                }
            }
            catch (err) {
                const responseData = responseBuilder_1.ResponseBuilder.error(err);
                responseData.toast = true;
                return res.status(responseData.code).json(responseData);
            }
        });
    }
}
exports.Middleware = Middleware;
//# sourceMappingURL=middleware.js.map