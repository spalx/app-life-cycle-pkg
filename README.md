# app-life-cycle-pkg

Package which enables to register functions to app lifecycle events like init or shutdown.

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
import { someService } from 'some-pkg';
// More imports here

import app from './app';

async function startServer(): Promise<void> {
  try {
    // Other code

    appService.use(app);
    appService.use(someService); // Using other apps from other packages

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

class App implements IAppPkg {
  async init(): Promise<void> {
    // This will be called on every app run
  }

  async shutdown(): Promise<void> {
    // Graceful shutdown: cleanup anything you want here
  }

  used(): void {
    // Do something here, maybe chain other use() calls
  }

  getPriority(): number {
    return 0; // 0 means highest priority
  }
}

export default new App();
```

## IAppPkg interface functions

| Name | Description |
| - | - |
| init | Runs every time the app runs/restarts |
| shutdown | Runs when any of the app termination signals ('SIGINT', 'SIGTERM', 'SIGUSR2') is received |
| used | Gets called immediately after the app is given to use() function |
| getPriority | Returns the priority of the app initialization. The lowest the number, the highest the priority |

---

## Imports

```ts
import { appService, IAppPkg } from 'app-life-cycle-pkg';
```
