export type HookFunction = () => Promise<void>;

export enum AppLifeCycleEvent {
  Install = 'Install',
  Init = 'Init',
  Shutdown = 'Shutdown'
}

export interface IAppPkg {
  init(): Promise<void>;
}
