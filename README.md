# app-life-cycle-pkg

Package which enables to register functions to app lifecycle events like install, init or shutdown.

---

## Dependencies

This package depends on the following package:

[common-loggers-pkg](https://github.com/spalx/common-loggers-pkg)

## appService

Instance of `AppService` used for registering classes to the app life cycle and for running the app during initialization.

### appService methods

NOTE: call the following methods only inside your project's root file (for example: index.ts).

| Method | Argument Types | Returns | Description |
| - | - | - | - |
| `use(app)` | `app: IAppPkg` | `void` | Register an IAppPkg subclass instance to the app life cycle |
| `run(app)` | | `void` | Run the app service |

### Usage example

How to run the app-life-cycle-pkg in your app root file (index.ts for example):

```ts
import { appService } from 'app-life-cycle-pkg';
import { kafkaService } from 'kafka-pkg';
// More imports here

import app from './app';

async function startServer(): Promise<void> {
  try {
    // Other code

    appService.use(app);
    appService.use(kafkaService); // Using other apps from other packages

    await appService.run();

    // Other code
  } catch (error) {
    process.exit(1);
  }
}

startServer();
```

And this is how app.ts file looks like:

```ts
import { IAppPkg } from 'app-life-cycle-pkg';
import { kafkaService } from 'kafka-pkg';

class App implements IAppPkg {
  async init(): Promise<void> {
    await kafkaService.createTopics([
      // Create kafka topics here
    ]);

    await kafkaService.subscribe({
      // Subscribe to kafka topics here
    });
  }

  async install(): Promise<void> {
  	// This will be called only during install
  }

  async shutdown(): Promise<void> {
    // Graceful shutdown: cleanup anything you want here
  }
}

export default new App();
```

## IAppPkg interface functions

| Name | Description |
| - | - |
| init | Runs every time the app runs/restarts |
| install | Runs when app is installed for the first time |
| shutdown | Runs when any of the app termination signals ('SIGINT', 'SIGTERM', 'SIGUSR2') is received |

---

## Imports

```ts
import { appService, IAppPkg } from 'app-life-cycle-pkg';
```
