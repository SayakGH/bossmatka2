"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCtr = exports.validate = void 0;
// imports
const lodash_1 = __importDefault(require("lodash"));
const isemail_1 = __importDefault(require("isemail"));
const is_alphanumeric_1 = __importDefault(require("is-alphanumeric"));
const is_valid_domain_1 = __importDefault(require("is-valid-domain"));
const password_validator_1 = __importDefault(require("password-validator"));
const validate_phone_number_node_js_1 = __importDefault(require("validate-phone-number-node-js"));
// schema for password validator
const schema = new password_validator_1.default();
schema
    .is()
    .min(6) // Minimum length 6
    .is()
    .max(30); // Maximum length 30
// Validation controller object
const validateCtr = {
    // Check for boolean values
    isDefined: (value) => {
        return typeof value === 'boolean';
    },
    // Validate email
    validEmail: (email) => {
        return email ? isemail_1.default.validate(email) : false;
    },
    // Validate phone number
    validPhoneNo: (mobile) => {
        return mobile ? validate_phone_number_node_js_1.default.validate(mobile) : false;
    },
    // Validate input as either email or phone number
    validEmailOrPhone: function (input) {
        return this.validEmail(input) || this.validPhoneNo(input);
    },
    // Validate password
    validPassword: (password) => {
        return password ? schema.validate(password) : false;
    },
    // Check if input is alphanumeric
    isAlphaNumeric: (input) => {
        return input ? (0, is_alphanumeric_1.default)(input) : false;
    },
    // Check if a value is not empty
    notEmpty: (str) => {
        return lodash_1.default.isNumber(str) || (!lodash_1.default.isEmpty(str) && !((str === null || str === void 0 ? void 0 : str.toString().trim()) === ''));
    },
    // Check if an array is not empty
    notEmptyArray: (array) => {
        return lodash_1.default.isArray(array) && array.length > 0;
    },
    // Check if an object is not empty
    notEmptyObject: (obj) => {
        return lodash_1.default.isObject(obj) && !lodash_1.default.isEmpty(obj);
    },
    // Validate domain
    validDomain: (domain) => {
        return (0, is_valid_domain_1.default)(domain, {
            subdomain: false,
            wildcard: false,
        });
    },
    // Validate MIME type
    isValidMime: (str, options) => {
        return str ? validateCtr.isValidEnum(str.type, options) : true;
    },
    // Validate enum values
    isValidEnum: (str, options) => {
        const { aEnum } = options;
        if (!lodash_1.default.isEmpty(str)) {
            if (!lodash_1.default.isEmpty(aEnum)) {
                // Check if aEnum is a Map
                if (aEnum instanceof Map && aEnum.has(str)) {
                    return true;
                }
                // Check if aEnum is an Array
                if (Array.isArray(aEnum) && aEnum.includes(str)) {
                    return true;
                }
            }
            return false;
        }
        return false;
    },
    // Check if value is numeric
    isNumeric: (value) => {
        return /^\d+$/.test(value);
    },
};
exports.validateCtr = validateCtr;
// Validate request body
const validate = (req, validationRules, parentKey = '') => {
    const { body, files, query } = req;
    const orgBody = req.orgBody || body;
    let input = {};
    let error = {};
    if (!lodash_1.default.isEmpty(validationRules)) {
        Object.keys(validationRules).every((key) => {
            let validations = validationRules[key];
            if (validations.isFile) {
                input = files;
            }
            else if (validations.isQueryParams) {
                input = query;
            }
            else {
                input = body;
            }
            if (validations.isOptional && input[key] === undefined) {
                return error;
            }
            if (validations.hasChilds && validations.hasChilds === true) {
                if (lodash_1.default.isEmpty(input[key])) {
                    const generatedError = validateCtr.getGeneratedError(`${parentKey ? `${parentKey}.` : ''}${key}`, 'notEmpty');
                    error = {
                        success: false,
                        statusCode: 400,
                        message: generatedError,
                    };
                }
                else {
                    error = validate({
                        body: input[key],
                        orgBody: body,
                    }, validations.childs, key);
                }
            }
            if (!lodash_1.default.isArray(validations)) {
                validations = validations.rules || [validations];
            }
            validations.every((validation) => {
                if (!lodash_1.default.isEmpty(validation)) {
                    const { type, msg, options, statusCode, replace } = validation;
                    if (!validateCtr[type](input[key], options)) {
                        const generatedError = validateCtr.getGeneratedError(`${parentKey ? `${parentKey}.` : ''}${key}`, type, options, input[key]);
                        error = {
                            success: false,
                            statusCode: statusCode || 400,
                            message: msg
                                ? replace && replace.key && replace.value
                                    ? req.t(msg).replace(replace.key, replace.value)
                                    : req.t(msg)
                                : generatedError,
                        };
                        return false;
                    }
                }
                return true;
            });
            if (!lodash_1.default.isEmpty(error)) {
                return false;
            }
            return true;
        });
    }
    return error;
};
exports.validate = validate;
// Generate error message
validateCtr.getGeneratedError = (field, type, options, str) => {
    switch (type) {
        case 'notEmpty':
            return `${field} is required`;
        case 'isValidPhoneNumber':
            return `${field} is not valid`;
        case 'isValidMime':
            return `${field} - Unsupported file format`;
        case 'validPassword':
            return schema.validate(str);
        case 'isAlphaNumeric':
            return `${field} - Invalid input, only supported Alphanumeric chars.`;
        case 'isNumberInRange': {
            if (options.max === options.min) {
                return `${field} should be exactly ${options.min}.`;
            }
            if (options.max && options.min) {
                return `${field} should be at least ${options.min} and maximum ${options.max}.`;
            }
            if (options.max) {
                return `${field} should maximum be ${options.max}.`;
            }
            if (options.min) {
                return `${field} should be at least ${options.min}.`;
            }
            return `${field} - error - ${type}`;
        }
        case 'checkLength':
            if (lodash_1.default.isFinite(options.max) === lodash_1.default.isFinite(options.min)) {
                return `${field} should be exactly ${options.min} characters`;
            }
            if (lodash_1.default.isFinite(options.max) && lodash_1.default.isFinite(options.min)) {
                return `${field} should be at least ${options.min} and maximum ${options.max} characters`;
            }
            if (lodash_1.default.isFinite(options.max)) {
                return `${field} should maximum be ${options.max} characters`;
            }
            if (lodash_1.default.isFinite(options.min)) {
                return `${field} should be at least ${options.min} characters`;
            }
            return `${field} - error - ${type}`;
        default:
            return `${field} - error - ${type}`;
    }
};
//# sourceMappingURL=validation.js.map