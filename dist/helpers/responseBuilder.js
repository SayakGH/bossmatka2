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
exports.ResponseBuilder = void 0;
const l10n = __importStar(require("jm-ez-l10n"));
const constants_1 = require("../config/constants");
class ResponseBuilder {
    static successMessage(msgCode) {
        const rb = new ResponseBuilder();
        rb.status = true;
        rb.code = 200;
        // rb.key = msgCode != null ? msgCode : "SUCCESS";
        rb.message = msgCode != null ? l10n.t(msgCode) : l10n.t('SUCCESS');
        return rb;
    }
    static errorMessage(msgCode) {
        const rb = new ResponseBuilder();
        rb.status = false;
        rb.code = 500;
        // rb.key = msgCode != null ? msgCode : "ERR_INTERNAL_SERVER";
        rb.error =
            msgCode != null ? l10n.t(msgCode) : l10n.t('ERR_INTERNAL_SERVER');
        return rb;
    }
    static authErrorMessage(msgCode) {
        const rb = new ResponseBuilder();
        rb.status = false;
        rb.code = 401;
        // rb.key = msgCode != null ? msgCode : "ERR_UNAUTH";
        rb.error = msgCode != null ? l10n.t(msgCode) : l10n.t('ERR_UNAUTH');
        return rb;
    }
    static badRequest(msgCode) {
        const appName = constants_1.Constants.appName;
        const rb = new ResponseBuilder();
        rb.status = false;
        rb.code = 400;
        // rb.key = msgCode != null ? msgCode : "FAILED";
        let message = msgCode != '{}' ? l10n.t(msgCode) : '';
        rb.error =
            msgCode != null
                ? message.replace('{APP_NAME}', appName)
                : l10n.t('FAILED');
        return rb;
    }
    static badRequestWithoutTranslate(msgCode) {
        const rb = new ResponseBuilder();
        rb.status = false;
        rb.code = 400;
        // rb.key = msgCode != null ? msgCode : "FAILED";
        rb.error = msgCode != null ? msgCode : l10n.t('FAILED');
        return rb;
    }
    static notFound(msgCode, replaceName, replaceValue) {
        const rb = new ResponseBuilder();
        rb.status = false;
        rb.code = 404;
        // rb.key = msgCode != null ? msgCode : "NOT_FOUND";
        rb.error =
            msgCode != null
                ? replaceName
                    ? l10n.t(msgCode).replace(`{${replaceName}}`, replaceValue)
                    : l10n.t(msgCode)
                : l10n.t('NOT_FOUND');
        return rb;
    }
    static duplicate(msgCode) {
        const rb = new ResponseBuilder();
        rb.status = false;
        rb.code = 409;
        // rb.key = msgCode != null ? msgCode : "NOT_FOUND";
        rb.error = msgCode != null ? l10n.t(msgCode) : l10n.t('DUPLICATE');
        return rb;
    }
    static data(result, msgCode) {
        const rb = new ResponseBuilder();
        rb.status = true;
        rb.code = 200;
        rb.result = result;
        // rb.key = msgCode != null ? msgCode : "SUCCESS";
        rb.message = msgCode != null ? l10n.t(msgCode) : l10n.t('SUCCESS');
        return rb;
    }
    static dataWithPaginate(result, pagination, msgCode) {
        const rb = new ResponseBuilder();
        rb.status = true;
        rb.code = 200;
        rb.result = result;
        rb.pagination = pagination;
        // rb.key = msgCode != null ? msgCode : "SUCCESS";
        rb.message = msgCode != null ? l10n.t(msgCode) : l10n.t('SUCCESS');
        return rb;
    }
    static error(err) {
        const rb = new ResponseBuilder();
        if (err.type === constants_1.Constants.BAD_DATA) {
            rb.status = false;
            rb.code = 400;
            rb.error = err.title;
            rb.description = err.description;
            rb.result = err.data;
            return rb;
        }
        rb.status = false;
        rb.code = 500;
        rb.error = err.title || l10n.t('ERR_INTERNAL_SERVER');
        rb.description = err.description;
        rb.result = err.data;
        return rb;
    }
}
exports.ResponseBuilder = ResponseBuilder;
ResponseBuilder.pagination = (total, limit) => {
    const pages = Math.ceil(total / (limit || total));
    return {
        pages: pages || 1,
        total,
        max: parseInt(limit) || parseInt(total),
    };
};
//# sourceMappingURL=responseBuilder.js.map