"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoute = void 0;
// Import only what we need from express
const express_1 = require("express");
const middleware_1 = require("../../helpers/middleware");
const userController_1 = require("./userController");
const userMiddleware_1 = require("./userMiddleware");
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// Assign router to the express.Router() instance
const router = (0, express_1.Router)();
// const v: Validator = new Validator();
const userController = new userController_1.UserController();
const userMiddleware = new userMiddleware_1.UserMiddleware();
const middleware = new middleware_1.Middleware();
const signUpMiddleware = [middleware.reqValidator, userController.signUp];
router.post("/signup", signUpMiddleware);
const loginMiddleware = [middleware.reqValidator, userController.login];
router.post("/login", loginMiddleware);
const changePasswordMiddleware = [
    userMiddleware === null || userMiddleware === void 0 ? void 0 : userMiddleware.checkIfUserExists,
    middleware.reqValidator,
    userController.changePassword,
];
router.put("/change-password", changePasswordMiddleware);
const updateProfileMiddleware = [
    userMiddleware === null || userMiddleware === void 0 ? void 0 : userMiddleware.checkIfUserExists,
    middleware.reqValidator,
    upload.array('files'),
    userController.updateProfile,
];
router.put("/update-profile", updateProfileMiddleware);
const getProfileMiddleware = [
    userMiddleware === null || userMiddleware === void 0 ? void 0 : userMiddleware.checkIfUserExists,
    middleware.reqValidator,
    userController.getProfile,
];
router.get("/get-profile", getProfileMiddleware);
const adminSignUpMiddleware = [
    userController.adminSignUp
];
router.post("/admin-signup", adminSignUpMiddleware);
const adminLoginMiddleware = [
    userController.adminLogin
];
router.post("/admin-login", adminLoginMiddleware);
const updateProfileAdminMiddleware = [
    middleware.adminAuthenticationMiddleware,
    userController.updateAdminProfile,
];
router.put("/update-admin-profile", updateProfileAdminMiddleware);
const changeAdminPasswordMiddleware = [
    middleware.adminAuthenticationMiddleware,
    userController.changeAdminPassword,
];
router.put("/change-admin-password", changeAdminPasswordMiddleware);
const addUserByAdminMiddleware = [
    middleware.adminAuthenticationMiddleware,
    userController.addUserByAdminController,
];
router.post("/add-user-by-admin", addUserByAdminMiddleware);
const getAllUserMiddleware = [
    middleware.adminAuthenticationMiddleware,
    userController.getAllUserController,
];
router.get("/get-all-users", getAllUserMiddleware);
const deleteUserByAdminMiddleware = [
    middleware.adminAuthenticationMiddleware,
    userController.deleteUserByAdminController,
];
router.delete("/delete-user-by-admin/:id", deleteUserByAdminMiddleware);
const addUserTxnDetailsByAdminMiddleware = [
    middleware.adminAuthenticationMiddleware,
    userController.addUserTxnDetailsByAdminController,
];
router.post("/update-user-by-admin", addUserTxnDetailsByAdminMiddleware);
exports.UserRoute = router;
//# sourceMappingURL=userRoute.js.map