import { promises as fs } from 'fs';
import * as path from 'path';
import { logger } from 'common-loggers-pkg';

import { HookFunction, AppLifeCycleEvent, IAppPkg } from '../types/app';

const INSTALL_FILE_PATH = path.resolve(__dirname, 'installed.txt');

class AppService {
  private hookFunctions: Record<AppLifeCycleEvent, HookFunction[]>;

  constructor() {
    this.hookFunctions = {
      [AppLifeCycleEvent.Install]: [],
      [AppLifeCycleEvent.Init]: [],
      [AppLifeCycleEvent.Shutdown]: []
    };

    this.registerSignalHandlers();
  }

  async init(app: IAppPkg): Promise<void> {
    await app.init();
  }

  hookOn(appLifeCycleEvent: AppLifeCycleEvent, hookFunction: HookFunction, prepend: boolean = true): void {
    if (prepend) {
      this.hookFunctions[appLifeCycleEvent].unshift(hookFunction);
    } else {
      this.hookFunctions[appLifeCycleEvent].push(hookFunction);
    }
  }

  async run(): Promise<void> {
    let installed = false;

    try {
      await fs.access(INSTALL_FILE_PATH);
      installed = true;
    } catch (err) {
      installed = false;
    }

    if (!installed) {
      await this.runHookFunctions(AppLifeCycleEvent.Install);

      const fileContents = '1';
      await fs.writeFile(INSTALL_FILE_PATH, fileContents);
    }

    await this.runHookFunctions(AppLifeCycleEvent.Init);
  }

  private async runHookFunctions(appLifeCycleEvent: AppLifeCycleEvent): Promise<void> {
    for (const hookFunction of this.hookFunctions[appLifeCycleEvent]) {
      await hookFunction();
    }
  }

  private registerSignalHandlers(): void {
    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGUSR2'];
    signals.forEach(signal => {
      process.on(signal, async () => {
        logger.info(`Received ${signal}, shutting down...`);
        try {
          await this.runHookFunctions(AppLifeCycleEvent.Shutdown);
        } catch (error) {
          logger.error('Error during shutdown', error);
        }

        logger.info('Shutdown complete.');
        process.exit(0);
      });
    });
  }
}

export default new AppService();
