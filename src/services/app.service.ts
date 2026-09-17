import { logger } from '@spalx/common-loggers-pkg';

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

  getExtraEntities(): string[] {
    const apps: IAppPkg[] = this.getPrioritizedApps();
    const entities: string[] = [];

    for (const app of apps) {
      const appEntities = app.getExtraEntities?.();

      if (appEntities?.length) {
        entities.push(...appEntities);
      }
    }

    return entities;
  }

  getExtraMigrations(): string[] {
    const apps: IAppPkg[] = this.getPrioritizedApps();
    const migrations: string[] = [];

    for (const app of apps) {
      const appMigrations = app.getExtraMigrations?.();

      if (appMigrations?.length) {
        migrations.push(...appMigrations);
      }
    }

    return migrations;
  }

  private getPrioritizedApps(): IAppPkg[] {
    return Array.from(this.apps.values()).sort((a, b) => a.priority - b.priority).map(item => item.app);
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
    const apps: IAppPkg[] = this.getPrioritizedApps();

    for (const app of apps) {
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
    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
    let shuttingDown = false;

    const shutdown = async (signal: NodeJS.Signals) => {
      if (shuttingDown) return;
      shuttingDown = true;

      logger.info(`Received ${signal}, shutting down...`);

      try {
        await this.runLifeCycleFunctions(AppLifeCycleEvent.Shutdown);
      } catch (e) {
        logger.error(e);
      } finally {
        logger.info('Shutdown complete.');
        process.exit(0);
      }
    };

    signals.forEach(signal => {
      process.on(signal, shutdown);
    });
  }
}

export default new AppService();
