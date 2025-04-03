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
exports.SpFailure = exports.Failure = void 0;
const l10n = __importStar(require("jm-ez-l10n"));
const constants_1 = require("../config/constants");
class Failure extends Error {
    static error(err, data) {
        if (err instanceof SpFailure) {
            err.data = err.data === undefined ? data : err.data;
            return err;
        }
        if (err instanceof Failure) {
            err.type = err.type ? err.type : constants_1.Constants.BAD_DATA;
            err.data = err.data === undefined ? data : err.data;
            return err;
        }
        const error = new Failure(l10n.t('ERR_INTERNAL_SERVER'), 'Error is thrown by code', err, false, data);
        error.type = constants_1.Constants.CODE;
        error.errorStack = err;
        error.data = data;
        return error;
    }
    static spError(err, isSpError) {
        if (err instanceof Failure) {
            err.type = isSpError ? constants_1.Constants.CODE : constants_1.Constants.BAD_DATA;
            return err;
        }
        const error = new Failure(l10n.t('ERR_INTERNAL_SERVER'), 'Error is thrown by code');
        error.type = constants_1.Constants.CODE;
        error.errorStack = err;
        return error;
    }
    static throwApiError(response) {
        if (response && response.responseCode === '01') {
            return new Failure(response.responseDescription || l10n.t('ERR_THIRD_PARTY'), response.responseDescription || l10n.t('ERR_THIRD_PARTY'), response, false);
        }
        return new Failure(l10n.t('ERR_THIRD_PARTY'), response.responseDescription || l10n.t('ERR_THIRD_PARTY'), response, false);
    }
    // Better approach need to be found for type
    constructor(title, description, errStack, isError, data) {
        super(title);
        this.title = title;
        this.type = isError ? constants_1.Constants.CODE : constants_1.Constants.BAD_DATA;
        this.description = description;
        if (errStack) {
            this.errorStack = errStack;
        }
        if (data) {
            this.data = data;
        }
    }
}
exports.Failure = Failure;
class SpFailure extends Failure {
    constructor(title, description, isSpError, data) {
        super(title, description);
        this.type = isSpError ? constants_1.Constants.CODE : constants_1.Constants.BAD_DATA;
        this.data = data;
    }
}
exports.SpFailure = SpFailure;
//# sourceMappingURL=error.js.map