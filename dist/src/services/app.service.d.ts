import { IAppPkg } from '../types/app';
declare class AppService {
    private apps;
    constructor();
    use(app: IAppPkg): void;
    run(): Promise<void>;
    private runLifeCycleFunctions;
    private registerSignalHandlers;
}
declare const _default: AppService;
export default _default;
