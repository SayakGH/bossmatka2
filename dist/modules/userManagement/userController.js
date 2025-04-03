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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const userHelper_1 = require("./userHelper");
const userUtils_1 = require("./userUtils");
const commonUtils_1 = require("../../helpers/commonUtils");
const constants_1 = require("../../config/constants");
const jwt_1 = require("../../helpers/jwt");
const bcrypt_1 = __importDefault(require("bcrypt"));
const notificationUtils_1 = require("../notification/notificationUtils");
const notification_1 = require("../../helpers/notification");
class UserController {
    constructor() {
        this.userUtils = new userUtils_1.UserUtils();
        this.userHelper = new userHelper_1.UserHelper();
        this.commonUtils = new commonUtils_1.CommonUtils();
        this.notificationUtils = new notificationUtils_1.NotificationUtils();
        this.notification = new notification_1.Notification();
        this.login = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { user, password, deviceToken } = req.body;
                const userDetail = yield this.userUtils.checkForEitherEmailOrNumber({
                    userEmail: user,
                    userPhoneNumber: user,
                });
                if (!userDetail) {
                    const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.notFound, req.t("USER_NOT_FOUND"), {});
                    return res.status(response.statusCode).json(response);
                }
                const match = password === userDetail.password;
                if (userDetail.deviceToken && userDetail.deviceToken != deviceToken) {
                    yield this.userUtils.updateUserByid({
                        id: userDetail.id,
                        deviceToken: deviceToken
                    });
                }
                if (!match) {
                    const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.notFound, req.t("INCORRECT_PASSWORD"), {});
                    return res.status(response.statusCode).json(response);
                }
                let jwtPayload = {
                    id: userDetail.id,
                    email: userDetail.email,
                    phoneNumber: userDetail.phoneNumber,
                    fullName: userDetail.fullName,
                    deviceToken: deviceToken ? deviceToken : userDetail.deviceToken
                };
                const userProfileBuffer = yield this.userUtils.getUserProfileBufferByUserId({
                    id: userDetail.id,
                });
                // Encode the payload into a JWT
                const token = jwt_1.Jwt.getAuthToken(jwtPayload);
                const responsePayload = Object.assign({ token,
                    userProfileBuffer }, jwtPayload);
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("LOGIN_SUCESS"), responsePayload, true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("LOGIN_FAILED"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.signUp = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, phoneNumber, password, fullName, deviceToken } = req.body;
                //THROW ERROR IF PASSWORD IS NOT DEFINED
                if (!password) {
                    const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.badRequest, req.t("PASSWORD_REQUIRED"));
                    return res.status(response.statusCode).json(response);
                }
                const userExist = yield this.userUtils.checkForEitherEmailOrNumber({
                    userEmail: email,
                    userPhoneNumber: phoneNumber,
                });
                if (userExist) {
                    const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.duplicateFound, req.t("USER_ALREADY_EXISTS"));
                    return res.status(response.statusCode).json(response);
                }
                // hash password
                // const salt = await bcrypt.genSalt(10);
                // const hashedPassord = await bcrypt.hash(password, salt);
                let payload = { password: password, email, phoneNumber, fullName, deviceToken };
                const user = yield this.userUtils.addUser(payload);
                if (!user) {
                    const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("SIGNUP_FAILED"));
                    return res.status(response.statusCode).json(response);
                }
                yield this.notificationUtils.createNotification({
                    title: `New User Registered`,
                    description: `${fullName} has registered into our app.`,
                    userId: user.id,
                    isForAllUser: false,
                });
                if (deviceToken) {
                    yield this.notification.sendPushNotification(deviceToken, `Registration completed`, `${fullName} welcome to our app.`, {
                        description: `${fullName} welcome to our app.`, type: "notification"
                    });
                }
                const response = yield this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("SIGNUP_SUCCESS"), user);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                console.warn(err, "err");
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("LOGIN_FAILED"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.changePassword = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const token = req.headers.authorization;
                const { oldPassword, newPassword, confirmPassword } = req.body;
                const userId = jwt_1.Jwt.decodeAuthToken(token);
                if (!newPassword || !confirmPassword || !oldPassword) {
                    const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.badRequest, req.t("PASSWORD_REQUIRED"));
                    return res.status(response.statusCode).json(response);
                }
                if (newPassword !== confirmPassword) {
                    const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.badRequest, req.t("INCORRECT_CONFIRM_PASSWORD"));
                    return res.status(response.statusCode).json(response);
                }
                const currentUser = yield this.userUtils.getUserByid({
                    id: userId.id,
                    includePassword: true,
                });
                // const match = await bcrypt.compare(oldPassword, currentUser?.password);
                if (oldPassword != (currentUser === null || currentUser === void 0 ? void 0 : currentUser.password)) {
                    const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.notFound, req.t("INCORRECT_PASSWORD"), {});
                    return res.status(response.statusCode).json(response);
                }
                // const samePassword = await bcrypt.compare(
                //   newPassword,
                //   currentUser?.password
                // );
                if (newPassword == (currentUser === null || currentUser === void 0 ? void 0 : currentUser.password)) {
                    const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.notFound, req.t("NEW_PASSWORD_SIMILIAR_TO_CURRENT"), {});
                    return res.status(response.statusCode).json(response);
                }
                // hash password
                // const salt = await bcrypt.genSalt(10);
                // const hashedPassord = await bcrypt.hash(newPassword, salt);
                const payload = { id: userId.id, password: newPassword };
                const user = yield this.userUtils.updateUserByid(payload);
                if (!user) {
                    const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("PASSWORD_UPDATED_FAILED"));
                    return res.status(response.statusCode).json(response);
                }
                const response = yield this.commonUtils.genSuccessResponse(constants_1.Constants.resStatusCode.success, req.t("PASSWORD_UPDATED"));
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                console.warn(err, "err");
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("LOGIN_FAILED"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.updateProfile = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const token = req.headers.authorization;
                const { fullName, email, phoneNumber } = req.body;
                const { files } = req;
                const userId = jwt_1.Jwt.decodeAuthToken(token);
                let existingUser;
                if (email) {
                    existingUser = yield this.userUtils.checkForEitherEmailOrNumber({
                        userEmail: email,
                        excludeId: userId.id,
                    });
                    if (existingUser) {
                        const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.duplicateFound, req.t("OTHER_USER_EMAIL_EXIST"));
                        return res.status(response.statusCode).json(response);
                    }
                }
                if (phoneNumber) {
                    existingUser = yield this.userUtils.checkForEitherEmailOrNumber({
                        userPhoneNumber: phoneNumber,
                        excludeId: userId.id,
                    });
                    if (existingUser) {
                        const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.duplicateFound, req.t("OTHER_USER_PHONE_EXIST"));
                        return res.status(response.statusCode).json(response);
                    }
                }
                let payload = { phoneNumber, email, fullName, id: userId.id };
                if (files && files.length > 0) {
                    payload.fileName = files[0].originalname;
                    payload.fileType = files[0].mimetype;
                    payload.fileData = files[0].buffer;
                }
                const user = yield this.userUtils.updateUserByid(payload);
                if (!user) {
                    const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("FAILED_USER_UPDATE"));
                    return res.status(response.statusCode).json(response);
                }
                const response = yield this.commonUtils.genSuccessResponse(constants_1.Constants.resStatusCode.success, req.t("SUCCESS_USER_UPDATE"));
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                console.warn(err, "err");
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("INTERNAL_SERVER_ERROR"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.getProfile = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const token = req.headers.authorization;
                const userId = jwt_1.Jwt.decodeAuthToken(token);
                if (!userId.id) {
                    const response = yield this.commonUtils.genSuccessResponse(constants_1.Constants.resStatusCode.error.duplicateFound, req.t("INTERNAL_SERVER_ERROR"));
                    return res.status(response.statusCode).json(response);
                }
                const userDetails = yield this.userUtils.getUserByid({
                    id: userId.id,
                });
                if (!userDetails) {
                    const response = yield this.commonUtils.genSuccessResponse(constants_1.Constants.resStatusCode.error.duplicateFound, req.t("USER_NOT_FOUND"));
                    return res.status(response.statusCode).json(response);
                }
                const response = yield this.commonUtils.genSuccessResponse(constants_1.Constants.resStatusCode.success, req.t("GET_USER_SUCCESS"), userDetails);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("INTERNAL_SERVER_ERROR"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.adminSignUp = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, phoneNumber, password, fullName } = req.body;
                //THROW ERROR IF PASSWORD IS NOT DEFINED
                if (!password) {
                    const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.badRequest, req.t("PASSWORD_REQUIRED"));
                    return res.status(response.statusCode).json(response);
                }
                // hash password
                const salt = yield bcrypt_1.default.genSalt(10);
                const hashedPassord = yield bcrypt_1.default.hash(password, salt);
                let payload = { password: hashedPassord, email, phoneNumber, fullName };
                const user = yield this.userUtils.addAdmin(payload);
                if (!user) {
                    const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("SIGNUP_FAILED"));
                    return res.status(response.statusCode).json(response);
                }
                const response = yield this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("ADMIN_ADDED"));
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                console.warn(err, "err");
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("LOGIN_FAILED"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.adminLogin = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { user, password } = req.body;
                const userDetail = yield this.userUtils.checkForEitherEmailOrNumberOfAdmin({
                    userEmail: user,
                    userPhoneNumber: user,
                });
                if (!userDetail) {
                    const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.notFound, req.t("USER_NOT_FOUND"), {});
                    return res.status(response.statusCode).json(response);
                }
                const match = yield bcrypt_1.default.compare(password, userDetail.password);
                if (!match) {
                    const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.notFound, req.t("INCORRECT_PASSWORD"), {});
                    return res.status(response.statusCode).json(response);
                }
                let jwtPayload = {
                    id: userDetail.id,
                    email: userDetail.email,
                    phoneNumber: userDetail.phoneNumber,
                    fullName: userDetail.fullName,
                    isAdmin: true,
                };
                // Encode the payload into a JWT
                const token = jwt_1.Jwt.getAuthToken(jwtPayload);
                const responsePayload = Object.assign(Object.assign({ token }, jwtPayload), { isAdmin: true });
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("LOGIN_SUCESS"), responsePayload, true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("LOGIN_FAILED"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.updateAdminProfile = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: authUser } = req;
                const adminsId = authUser.id;
                const { fullName, email, phoneNumber } = req.body;
                let existingUser;
                if (email) {
                    existingUser = yield this.userUtils.checkForEitherEmailOrNumberOfAdmin({
                        userEmail: email,
                        excludeId: authUser.id,
                    });
                    if (existingUser) {
                        const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.duplicateFound, req.t("OTHER_ADMIN_EMAIL_EXIST"));
                        return res.status(response.statusCode).json(response);
                    }
                }
                if (phoneNumber) {
                    existingUser = yield this.userUtils.checkForEitherEmailOrNumberOfAdmin({
                        userPhoneNumber: phoneNumber,
                        excludeId: authUser.id,
                    });
                    if (existingUser) {
                        const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.duplicateFound, req.t("OTHER_ADMIN_PHONE_EXIST"));
                        return res.status(response.statusCode).json(response);
                    }
                }
                const payload = { phoneNumber, email, fullName, id: adminsId };
                const user = yield this.userUtils.updateAdminByid(payload);
                if (!user) {
                    const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("FAILED_ADMINUPDATE"));
                    return res.status(response.statusCode).json(response);
                }
                const response = yield this.commonUtils.genSuccessResponse(constants_1.Constants.resStatusCode.success, req.t("SUCCESS_ADMIN_UPDATE"));
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                console.warn(err, "err");
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("INTERNAL_SERVER_ERROR"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.changeAdminPassword = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const token = req.headers.authorization;
                const { oldPassword, newPassword, confirmPassword } = req.body;
                const userId = jwt_1.Jwt.decodeAuthToken(token);
                if (!newPassword || !confirmPassword || !oldPassword) {
                    const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.badRequest, req.t("PASSWORD_REQUIRED"));
                    return res.status(response.statusCode).json(response);
                }
                if (newPassword !== confirmPassword) {
                    const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.badRequest, req.t("INCORRECT_CONFIRM_PASSWORD"));
                    return res.status(response.statusCode).json(response);
                }
                const currentUser = yield this.userUtils.getAdminByid({
                    id: userId.id,
                    includePassword: true,
                });
                const match = yield bcrypt_1.default.compare(oldPassword, currentUser === null || currentUser === void 0 ? void 0 : currentUser.password);
                if (!match) {
                    const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.notFound, req.t("INCORRECT_PASSWORD"), {});
                    return res.status(response.statusCode).json(response);
                }
                const samePassword = yield bcrypt_1.default.compare(newPassword, currentUser === null || currentUser === void 0 ? void 0 : currentUser.password);
                if (samePassword) {
                    const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.notFound, req.t("NEW_PASSWORD_SIMILIAR_TO_CURRENT"), {});
                    return res.status(response.statusCode).json(response);
                }
                // hash password
                const salt = yield bcrypt_1.default.genSalt(10);
                const hashedPassord = yield bcrypt_1.default.hash(newPassword, salt);
                const payload = { id: userId.id, password: hashedPassord };
                const user = yield this.userUtils.updateAdminByid(payload);
                if (!user) {
                    const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("PASSWORD_UPDATED_FAILED"));
                    return res.status(response.statusCode).json(response);
                }
                const response = yield this.commonUtils.genSuccessResponse(constants_1.Constants.resStatusCode.success, req.t("PASSWORD_UPDATED"));
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                console.warn(err, "err");
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("LOGIN_FAILED"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.addUserByAdminController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const adminsId = req.user.id;
                const { email, phoneNumber, password, fullName } = req.body;
                if (!password) {
                    const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.badRequest, req.t("PASSWORD_REQUIRED"));
                    return res.status(response.statusCode).json(response);
                }
                const userExist = yield this.userUtils.checkForEitherEmailOrNumber({
                    userEmail: email,
                    userPhoneNumber: phoneNumber,
                });
                if (userExist) {
                    const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.duplicateFound, req.t("USER_ALREADY_EXISTS"));
                    return res.status(response.statusCode).json(response);
                }
                // hash password
                // const salt = await bcrypt.genSalt(10);
                // const hashedPassord = await bcrypt.hash(password, salt);
                let payload = {
                    password: password,
                    email,
                    phoneNumber,
                    fullName,
                    adminsId,
                };
                const user = yield this.userUtils.addUser(payload);
                if (!user) {
                    const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("SIGNUP_FAILED"));
                    return res.status(response.statusCode).json(response);
                }
                const response = yield this.commonUtils.genSuccessResponse(constants_1.Constants.resStatusCode.success, req.t("PASSWORD_UPDATED"));
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                console.warn(err, "err");
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("LOGIN_FAILED"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.getAllUserController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const adminsId = +req.user.id;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 3;
                const searchParams = req.query.searchParams
                    ? String(req.query.searchParams)
                    : "";
                const today = req.query.today === "true"; // Check if the today query is present and true
                const wallet = req.query.wallet === "true";
                const { users, totalUsers } = yield this.userUtils.getUsersListing(adminsId, page, limit, searchParams, today, wallet);
                const totalPages = Math.ceil(totalUsers / limit);
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("USERS_LIST_SUCCESS"), {
                    users,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        limit,
                        totalData: totalUsers,
                    },
                }, searchParams != "" ? false : true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("INTERNAL_SERVER_ERROR"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.deleteUserByAdminController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const adminsId = +req.user.id;
                const userId = +req.params.id;
                const deleteUser = yield this.userUtils.deleteUserByAdmin(userId);
                const response = this.commonUtils.genMobileApiSuccessResponse(true, constants_1.Constants.resStatusCode.success, req.t("USER_DELETED"), {}, true);
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("INTERNAL_SERVER_ERROR"), err);
                return res.status(response.statusCode).json(response);
            }
        });
        this.addUserTxnDetailsByAdminController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { accNumber, ifsc, phonePe, googlePay, paytm, upi, userId, addWallet, subWallet, status, } = req.body;
                let updateData = {};
                if (upi || upi == "") {
                    updateData.upi = upi;
                }
                if (paytm || paytm == "") {
                    updateData.paytm = paytm;
                }
                if (googlePay || googlePay == "") {
                    updateData.googlePay = googlePay;
                }
                if (phonePe || phonePe == "") {
                    updateData.phonePe = phonePe;
                }
                if (ifsc || ifsc == "") {
                    updateData.ifsc = ifsc;
                }
                if (accNumber || accNumber == "") {
                    updateData.accNumber = accNumber;
                }
                if (userId) {
                    updateData.id = +userId;
                }
                if (status) {
                    updateData.status = status;
                }
                if (addWallet) {
                    updateData.wallet = { increment: +addWallet };
                }
                if (subWallet) {
                    updateData.wallet = { decrement: +subWallet };
                }
                const updateUser = yield this.userUtils.updateUserByid(updateData);
                if (!updateUser) {
                    throw updateUser;
                }
                const response = yield this.commonUtils.genSuccessResponse(constants_1.Constants.resStatusCode.success, req.t("SUCCESS_USER_UPDATE"));
                return res.status(response.statusCode).json(response);
            }
            catch (err) {
                console.warn(err, "err");
                const response = yield this.commonUtils.genErrorResponse(constants_1.Constants.resStatusCode.error.internalServerError, req.t("LOGIN_FAILED"), err);
                return res.status(response.statusCode).json(response);
            }
        });
    }
}
exports.UserController = UserController;
//# sourceMappingURL=userController.js.map