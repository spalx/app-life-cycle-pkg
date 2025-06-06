import { HookFunction, AppLifeCycleEvent, IAppPkg } from '../types/app';
declare class AppService {
    private hookFunctions;
    constructor();
    init(app: IAppPkg): Promise<void>;
    hookOn(appLifeCycleEvent: AppLifeCycleEvent, hookFunction: HookFunction, prepend?: boolean): void;
    run(): Promise<void>;
    private runHookFunctions;
    private registerSignalHandlers;
}
declare const _default: AppService;
export default _default;
