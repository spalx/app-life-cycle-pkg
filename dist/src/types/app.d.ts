export declare enum AppLifeCycleEvent {
    Install = "Install",
    Init = "Init",
    Shutdown = "Shutdown"
}
export interface IAppPkg {
    init?(): Promise<void>;
    install?(): Promise<void>;
    shutdown?(): Promise<void>;
}
