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
exports.CommonUtils = void 0;
const logger_1 = require("./logger");
class CommonUtils {
    constructor() {
        this.logger = logger_1.Log.getLogger();
        this.logError = (message) => __awaiter(this, void 0, void 0, function* () { return yield this.logger.error(message); });
        this.logInfo = (message_1, ...args_1) => __awaiter(this, [message_1, ...args_1], void 0, function* (message, jsonData = null) {
            let data = '';
            if (jsonData != null) {
                data = JSON.stringify(jsonData);
            }
            return yield this.logger.info(`${message}, ${data}`);
        });
        this.genErrorResponse = (statusCode_1, error_1, ...args_2) => __awaiter(this, [statusCode_1, error_1, ...args_2], void 0, function* (statusCode, error, err = null, req = null) {
            let response = {};
            response.success = false;
            response.statusCode = statusCode;
            response.message = error;
            response.toast = true;
            if (err) {
                response.generatedError = err;
                yield this.logError(err);
            }
            ;
            return response;
        });
        this.genSuccessResponse = (statusCode, message, body = null) => {
            const response = {
                success: true,
                statusCode,
                message,
                body
            };
            return response;
        };
        this.genMobileApiSuccessResponse = (success, statusCode, message, body = {}, toast = false) => {
            const response = {
                success,
                statusCode,
                message,
                result: body,
                toast
            };
            return response;
        };
    }
    cleanPhoneNumber(phoneNumber) {
        let cleanedNumber = phoneNumber.replace(/\s+/g, '');
        if (cleanedNumber.startsWith('+91')) {
            cleanedNumber = cleanedNumber.substring(3);
        }
        return cleanedNumber;
    }
    maskPrice(price) {
        const priceStr = price.toString();
        return '*' + '*'.repeat(priceStr.length - 1);
    }
}
exports.CommonUtils = CommonUtils;
//# sourceMappingURL=commonUtils.js.map