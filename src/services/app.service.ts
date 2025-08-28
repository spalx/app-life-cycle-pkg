import { logger } from 'common-loggers-pkg';

import { AppLifeCycleEvent, AppRunPriority, IAppPkg } from '../types/app';

interface IPrioritizedApp {
  app: IAppPkg;
  priority: number;
}

class AppService {
  private apps: IPrioritizedApp[] = [];

  constructor() {
    this.registerSignalHandlers();
  }

  use(app: IAppPkg): void {
    const priority: number = app.getPriority?.() || AppRunPriority.Highest;
    this.apps.push({ app, priority });
    app.used?.();
  }

  async run(): Promise<void> {
    await this.runLifeCycleFunctions(AppLifeCycleEvent.Init);
  }

  private async runLifeCycleFunctions(appLifeCycleEvent: AppLifeCycleEvent): Promise<void> {
    this.apps.sort((a, b) => a.priority - b.priority);

    for (const prioritizedApp of this.apps) {
      const app: IAppPkg = prioritizedApp.app;
      switch (appLifeCycleEvent) {
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
