"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = void 0;
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;
const myFormat = printf(({ level, message, label, timestamp }) => `${timestamp} ${'debug'}: ${message}`);
class Log {
    static getLogger() {
        return createLogger({
            format: combine(timestamp(), myFormat, colorize()),
            transports: [new transports.Console()],
        });
    }
}
exports.Log = Log;
//# sourceMappingURL=logger.js.map