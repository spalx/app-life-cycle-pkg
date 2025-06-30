import { promises as fs } from 'fs';
import * as path from 'path';
import { logger } from 'common-loggers-pkg';

import { AppLifeCycleEvent, IAppPkg } from '@/types/app';

const INSTALL_FILE_PATH = path.resolve(__dirname, 'installed.txt');

class AppService {
  private apps: IAppPkg[] = [];

  constructor() {
    this.registerSignalHandlers();
  }

  use(app: IAppPkg): void {
    this.apps.push(app);
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
      await this.runLifeCycleFunctions(AppLifeCycleEvent.Install);

      const fileContents = '1';
      await fs.writeFile(INSTALL_FILE_PATH, fileContents);
    }

    await this.runLifeCycleFunctions(AppLifeCycleEvent.Init);
  }

  private async runLifeCycleFunctions(appLifeCycleEvent: AppLifeCycleEvent): Promise<void> {
    for (const app of this.apps) {
      switch (appLifeCycleEvent) {
        case AppLifeCycleEvent.Install:
          await app.install?.();
          break;
        case AppLifeCycleEvent.Init:
          await app.init?.();
          break;
        case AppLifeCycleEvent.Shutdown:
          await app.shutdown?.();
          break;
      }
    }
  }

  private registerSignalHandlers(): void {
    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGUSR2'];
    signals.forEach(signal => {
      process.on(signal, async () => {
        logger.info(`Received ${signal}, shutting down...`);
        try {
          await this.runLifeCycleFunctions(AppLifeCycleEvent.Shutdown);
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
