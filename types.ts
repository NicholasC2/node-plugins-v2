export interface Plugin {
    name: string;
    version: string;
    dependencies?: string[];
    start(pluginManager: PluginManager): Promise<void> | void;
    stop(pluginManager: PluginManager): Promise<void> | void;
}

export enum PluginState {
    STOPPED = "Stopped",
    RUNNING = "Running",
    CRASHED = "Crashed!"
}

export enum LogType {
    LOG,
    WARNING,
    ERROR,
}

export interface Log {
    type: LogType;
    timestamp: Date;
    text: string;
}

export interface LoadedPlugin extends Plugin {
    state: PluginState;
    logs: Log[];
}

export interface Command {
    description: string;
    run(args: string[], pluginManager: PluginManager): Promise<void> | void;
}

export interface PluginManager {
    readonly plugins: readonly LoadedPlugin[];

    registerCommand(name: string,command: Command): void;
    getCommand(name: string): any;

    setService<T>(name: string, service: T): void;
    getService<T>(name: string): T | undefined;
    hasService(name: string): boolean;

    stopPlugin(plugin: LoadedPlugin): Promise<void>;
    startPluginWithDeps(plugin: LoadedPlugin, checked?: string[]): Promise<void>;
}