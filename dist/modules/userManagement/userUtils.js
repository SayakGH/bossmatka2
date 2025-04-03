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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserUtils = void 0;
const logger_1 = require("../../helpers/logger");
const moment_1 = __importDefault(require("moment"));
const client_1 = require("@prisma/client");
class UserUtils {
    constructor() {
        this.prisma = new client_1.PrismaClient();
        this.logger = logger_1.Log.getLogger();
    }
    checkForUniqueNumber(number, excludeId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.users.findUnique({
                where: { phoneNumber: number, NOT: { id: excludeId } },
            });
        });
    }
    checkForUniqueEmail(email, excludeId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.users.findUnique({
                where: { email, NOT: { id: excludeId } },
            });
        });
    }
    checkForEitherEmailOrNumber(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userEmail, userPhoneNumber, excludeId } = payload;
            const email = userEmail && (yield this.checkForUniqueEmail(userEmail, excludeId));
            if (email)
                return email;
            const phoneNumber = userPhoneNumber &&
                (yield this.checkForUniqueNumber(userPhoneNumber, excludeId));
            if (phoneNumber)
                return phoneNumber;
            return false;
        });
    }
    addUser(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!payload.adminsId) {
                const getAdminId = yield this.prisma.admins.findFirst({
                    where: { deletedAt: null },
                });
                payload.adminsId = +getAdminId.id;
            }
            return yield this.prisma.users.create({ data: payload });
        });
    }
    getUserByid(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, includePassword } = payload;
            const profile = yield this.prisma.users.findUnique({
                where: { id },
                select: {
                    password: !!includePassword,
                    email: true,
                    phoneNumber: true,
                    profileImage: true,
                    fullName: true,
                    fileData: true,
                    fileName: true,
                    fileType: true,
                    deviceToken: true
                },
            });
            if (!(profile === null || profile === void 0 ? void 0 : profile.profileImage)) {
                return profile;
            }
            const profileBuffer = yield this.prisma.file.findUnique({
                where: { id: profile === null || profile === void 0 ? void 0 : profile.profileImage },
            });
            if (profileBuffer) {
                return Object.assign({ profileBuffer }, profile);
            }
        });
    }
    updateUserByid(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = payload, rest = __rest(payload, ["id"]);
            yield this.prisma.users.update({
                data: Object.assign({}, rest),
                where: { id },
            });
            if (payload.wallet && payload.wallet.increment) {
                yield this.prisma.transaction.create({
                    data: {
                        type: "ADDITION",
                        status: "ACCEPTED",
                        amount: payload.wallet.increment,
                        userId: payload.id,
                    },
                });
            }
            if (payload.wallet && payload.wallet.decrement) {
                yield this.prisma.transaction.create({
                    data: {
                        type: "WITHDRAWAL",
                        status: "ACCEPTED",
                        amount: payload.wallet.decrement,
                        userId: payload.id,
                    },
                });
            }
            return true;
        });
    }
    getUserProfileBufferByUserId(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = payload;
            const file = yield this.prisma.file.findUnique({ where: { id } });
            return file;
        });
    }
    addAdmin(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.admins.create({ data: payload });
        });
    }
    checkForEitherEmailOrNumberOfAdmin(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userEmail, userPhoneNumber, excludeId } = payload;
            const email = userEmail && (yield this.checkForUniqueEmailAdmin(userEmail, excludeId));
            if (email)
                return email;
            const phoneNumber = userPhoneNumber &&
                (yield this.checkForUniqueNumberAdmin(userPhoneNumber, excludeId));
            if (phoneNumber)
                return phoneNumber;
            return false;
        });
    }
    checkForUniqueNumberAdmin(number, excludeId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.admins.findUnique({
                where: { phoneNumber: number, NOT: { id: excludeId } },
            });
        });
    }
    checkForUniqueEmailAdmin(email, excludeId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.admins.findUnique({
                where: { email, NOT: { id: excludeId } },
            });
        });
    }
    updateAdminByid(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, password } = payload, rest = __rest(payload, ["id", "password"]);
            if (password) {
                return yield this.prisma.admins.update({
                    data: { password },
                    where: { id },
                });
            }
            return yield this.prisma.admins.update({
                data: Object.assign({}, rest),
                where: { id },
            });
        });
    }
    getAdminByid(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, includePassword } = payload;
            return yield this.prisma.admins.findUnique({
                where: { id },
                select: {
                    password: !!includePassword,
                    email: true,
                    phoneNumber: true,
                    fullName: true,
                },
            });
        });
    }
    getUsersListing(adminsId, page, limit, searchParams, today, // New parameter for today filter
    wallet) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const skip = (page - 1) * limit;
                const whereClause = {
                    adminsId,
                    deletedAt: null,
                };
                // Add search params if provided
                if (searchParams) {
                    whereClause.OR = [
                        {
                            phoneNumber: {
                                contains: searchParams,
                            },
                        },
                        {
                            fullName: {
                                contains: searchParams,
                            },
                        },
                    ];
                }
                // Apply today's filter if the query parameter is "true"
                if (today) {
                    const startOfDay = (0, moment_1.default)().tz("Asia/Kolkata").startOf("day");
                    const endOfDay = (0, moment_1.default)().tz("Asia/Kolkata").endOf("day");
                    whereClause.createdAt = {
                        gte: startOfDay,
                        lte: endOfDay,
                    };
                }
                let orderByClause;
                if (wallet) {
                    orderByClause = {
                        wallet: "desc",
                    };
                }
                else {
                    orderByClause = {
                        createdAt: "desc",
                    };
                }
                const users = yield this.prisma.users.findMany({
                    where: whereClause,
                    orderBy: orderByClause,
                    select: {
                        id: true,
                        phoneNumber: true,
                        email: true,
                        fullName: true,
                        adminsId: true,
                        createdAt: true,
                        wallet: true,
                        password: true,
                        accNumber: true,
                        ifsc: true,
                        phonePe: true,
                        googlePay: true,
                        paytm: true,
                        upi: true,
                        status: true,
                    },
                    skip: skip,
                    take: limit,
                });
                const totalUsers = yield this.prisma.users.count({
                    where: whereClause,
                });
                return { users, totalUsers };
            }
            catch (err) {
                throw new Error(`Failed to fetch users: ${err.message}`);
            }
        });
    }
    deleteUserByAdmin(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.users.update({
                where: { id },
                data: {
                    deletedAt: new Date(),
                    wallet: 0
                },
            });
        });
    }
}
exports.UserUtils = UserUtils;
//# sourceMappingURL=userUtils.js.map