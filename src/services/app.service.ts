import { logger } from 'common-loggers-pkg';

import { AppLifeCycleEvent, AppRunPriority, IAppPkg } from '../types/app';

interface IPrioritizedApp {
  app: IAppPkg;
  priority: number;
}

class AppService {
  private apps: Map<string, IPrioritizedApp> = new Map<string, IPrioritizedApp>();

  constructor() {
    this.registerSignalHandlers();
  }

  async run(app: IAppPkg): Promise<void> {
    this.initDependencies(app);
    await this.runLifeCycleFunctions(AppLifeCycleEvent.Init);
  }

  private initDependencies(app: IAppPkg): void {
    const appName: string = app.getName();

    if (!this.apps.has(appName)) {
      const priority: number = app.getPriority?.() || AppRunPriority.Highest;
      this.apps.set(appName, { app, priority });
    }

    const dependencies: IAppPkg[] = app.getDependencies?.() ?? [];
    for (const dependency of dependencies) {
      this.initDependencies(dependency);
    }
  }

  private async runLifeCycleFunctions(appLifeCycleEvent: AppLifeCycleEvent): Promise<void> {
    const apps: IPrioritizedApp[] =  Array.from(this.apps.values()).sort((a, b) => a.priority - b.priority);

    for (const prioritizedApp of apps) {
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
    let shuttingDown = false;

    const shutdown = async (signal: NodeJS.Signals) => {
      if (shuttingDown) {
        logger.warn(`Already shutting down, ignoring ${signal}`);
        return;
      }

      shuttingDown = true;
      logger.info(`Received ${signal}, shutting down...`);

      try {
        await Promise.race([
          this.runLifeCycleFunctions(AppLifeCycleEvent.Shutdown),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Shutdown timeout')), 10000)
          )
        ]);
      } catch (error) {
        logger.error('Error during shutdown', error);
      } finally {
        logger.info('Shutdown complete.');
        // Allow event loop to drain naturally
        process.exitCode = 0;
      }
    };

    signals.forEach(signal => {
      process.on(signal, shutdown);
    });
  }
}

export default new AppService();
