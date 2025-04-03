"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Constants = void 0;
class Constants {
}
exports.Constants = Constants;
Constants.CODE = 'CODE';
Constants.appName = 'Doctor Site Management';
Constants.BAD_DATA = 'BAD_DATA';
Constants.resStatusCode = {
    success: 200,
    created: 201,
    error: {
        internalServerError: 500,
        badRequest: 400,
        unauthorized: 401,
        forbidden: 403,
        notFound: 404,
        duplicateFound: 409,
    },
};
//# sourceMappingURL=constants.js.map