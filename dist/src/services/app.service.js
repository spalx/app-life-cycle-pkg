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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path = __importStar(require("path"));
const common_loggers_pkg_1 = require("common-loggers-pkg");
const app_1 = require("../types/app");
const INSTALL_FILE_PATH = path.resolve(__dirname, 'installed.txt');
class AppService {
    constructor() {
        this.hookFunctions = {
            [app_1.AppLifeCycleEvent.Install]: [],
            [app_1.AppLifeCycleEvent.Init]: [],
            [app_1.AppLifeCycleEvent.Shutdown]: []
        };
        this.registerSignalHandlers();
    }
    async init(app) {
        await app.init();
    }
    hookOn(appLifeCycleEvent, hookFunction, prepend = true) {
        if (prepend) {
            this.hookFunctions[appLifeCycleEvent].unshift(hookFunction);
        }
        else {
            this.hookFunctions[appLifeCycleEvent].push(hookFunction);
        }
    }
    async run() {
        let installed = false;
        try {
            await fs_1.promises.access(INSTALL_FILE_PATH);
            installed = true;
        }
        catch (err) {
            installed = false;
        }
        if (!installed) {
            await this.runHookFunctions(app_1.AppLifeCycleEvent.Install);
            const fileContents = '1';
            await fs_1.promises.writeFile(INSTALL_FILE_PATH, fileContents);
        }
        await this.runHookFunctions(app_1.AppLifeCycleEvent.Init);
    }
    async runHookFunctions(appLifeCycleEvent) {
        for (const hookFunction of this.hookFunctions[appLifeCycleEvent]) {
            await hookFunction();
        }
    }
    registerSignalHandlers() {
        const signals = ['SIGINT', 'SIGTERM', 'SIGUSR2'];
        signals.forEach(signal => {
            process.on(signal, async () => {
                common_loggers_pkg_1.logger.info(`Received ${signal}, shutting down...`);
                try {
                    await this.runHookFunctions(app_1.AppLifeCycleEvent.Shutdown);
                }
                catch (error) {
                    common_loggers_pkg_1.logger.error('Error during shutdown', error);
                }
                common_loggers_pkg_1.logger.info('Shutdown complete.');
                process.exit(0);
            });
        });
    }
}
exports.default = new AppService();
