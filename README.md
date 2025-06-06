# app-hook-pkg

Package which enables to hook functions to the app lifecycle events like install, init or shutdown.

---

## AppHook Service

Instance of `AppHookService` used for registering hook functions.

### AppHookService methods

| Method | Argument Types | Returns | Description |
| - | - | - | - |
| `hookOn(appCycleEvent, hookFunction, prepend)` | `appCycleEvent: AppCycleEvent`,<br>`hookFunction: () => Promise<void>`<br>`prepend: boolean = true` | `void` | Hook a function to an app cycle event |

## AppCycleEvent enum options

| Name | Description |
| - | - |
| Install | Runs when app is installed for the first time |
| Init | Runs every time the app runs/restarts |
| Shutdown | Runs when any of the app termination signals ('SIGINT', 'SIGTERM', 'SIGUSR2') is received |

---

## Imports

```ts
import { appHookService, AppCycleEvent } from 'app-hook-pkg';
```
