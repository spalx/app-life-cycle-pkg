export enum AppLifeCycleEvent {
  Init = 'Init',
  Shutdown = 'Shutdown'
}

export enum AppRunPriority {
  Highest = 0,
  High = 16,
  Medium = 64,
  Low = 256,
  Lowest = 1024
}

export interface IAppPkg {
  init?(): Promise<void>;
  shutdown?(): Promise<void>;
  used?(): void;
  getPriority?(): number;
}
