import winston, {format, LeveledLogMethod, transports} from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import {Configuration} from "./configuration";

export class Logger {
    public static readonly appFormat = format.printf((info: any) => {
        return `${info.timestamp} [${info.type}] ${info.level}: ${info.message}`;
    });
    private static instance: Logger;
    private winstonLogger: winston.Logger;
    private everyWhereLogger: winston.Logger;

    private get combinedTransport(): DailyRotateFile {
        return new DailyRotateFile({
            dirname: Configuration.server.logs.dirname,
            filename: "combined-%DATE%.log",
            datePattern: Configuration.server.logs.date_pattern,
            zippedArchive: false,
            level: "debug",
            handleExceptions: true,
            maxFiles: Configuration.server.logs.max_files,
            utc: true,
            auditFile: Configuration.server.logs.dirname + "/combined-audit.json",
            format: winston.format.combine(format.timestamp(), Logger.appFormat),
        });
    }

    private get consoleTransport(): transports.ConsoleTransportInstance {
        return new transports.Console({
            format: winston.format.combine(format.timestamp(), format.colorize(), Logger.appFormat),
        });
    }

    private get loggerOptions(): winston.LoggerOptions {
        return {
            level: "debug",
            levels: {...winston.config.cli.levels, warning: 1},
            transports: Configuration.server.logs.silent ? [this.combinedTransport] : [this.consoleTransport, this.combinedTransport],
        };
    }

    constructor() {
        this.winstonLogger = winston.createLogger(this.loggerOptions);
        this.everyWhereLogger = winston.loggers.add("everyWhere", {
            ...this.loggerOptions,
            defaultMeta: {type: "GLOBAL"},
        });
        this.everyWhereLogger.add(this.databaseTransport);

        process.on("uncaughtException", (err) => this.winstonLogger.error("uncaught exception: ", err));
        process.on("unhandledRejection", (reason, p) => this.winstonLogger.error("unhandled rejection: ", reason, p));
    }

    public static get winston(): winston.Logger {
        return this.getInstance().winstonLogger;
    }

    public static get error(): LeveledLogMethod {
        return this.getInstance().winstonLogger.error.bind(this.winston);
    }

    public static get warn(): LeveledLogMethod {
        return this.getInstance().winstonLogger.warn.bind(this.winston);
    }

    public static get warning(): LeveledLogMethod {
        return this.getInstance().winstonLogger.warn.bind(this.winston);
    }

    public static get help(): LeveledLogMethod {
        return this.getInstance().winstonLogger.help.bind(this.winston);
    }

    public static get data(): LeveledLogMethod {
        return this.getInstance().winstonLogger.data.bind(this.winston);
    }

    public static get info(): LeveledLogMethod {
        return this.getInstance().winstonLogger.info.bind(this.winston);
    }

    public static get debug(): LeveledLogMethod {
        return this.getInstance().winstonLogger.debug.bind(this.winston);
    }

    public static get prompt(): LeveledLogMethod {
        return this.getInstance().winstonLogger.prompt.bind(this.winston);
    }

    public static get http(): LeveledLogMethod {
        return this.getInstance().winstonLogger.http.bind(this.winston);
    }

    public static get verbose(): LeveledLogMethod {
        return this.getInstance().winstonLogger.verbose.bind(this.winston);
    }

    public static get input(): LeveledLogMethod {
        return this.getInstance().winstonLogger.input.bind(this.winston);
    }

    public static get silly(): LeveledLogMethod {
        return this.getInstance().winstonLogger.silly.bind(this.winston);
    }

    public static get everyWhere(): winston.Logger {
        return this.getInstance().everyWhereLogger;
    }

    private get databaseTransport(): DailyRotateFile {
        return new DailyRotateFile({
            dirname: Configuration.server.logs.dirname,
            filename: "db-%DATE%.log",
            datePattern: Configuration.server.logs.date_pattern,
            zippedArchive: false,
            maxFiles: Configuration.server.logs.max_files,
            level: "debug",
            handleExceptions: true,
            utc: true,
            auditFile: Configuration.server.logs.dirname + "/db-audit.json",
            format: winston.format.combine(format.timestamp(), Logger.appFormat),
        });
    }

    public static get databaseTransport() {
        return this.getInstance().databaseTransport;
    }

    public static child(options: { logger: string, type: string }): winston.Logger {
        return (winston.loggers.has(options.logger) ? winston.loggers.get(options.logger) : winston.loggers.add(options.logger, this.getInstance().loggerOptions)).child({type: options.type});
        // return this.getInstance().winstonLogger.child.bind(this.winston);
    }

    private static getInstance(): Logger {
        if (!this.instance) {
            this.instance = new Logger();
        }

        return this.instance;
    }
}
