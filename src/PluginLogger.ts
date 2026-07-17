import { LogType, type LoadedPlugin } from "../types";

export function createPluginLogger(
    plugin: LoadedPlugin,
    baseConsole = console
) {
    return {
        log(...args: unknown[]) {
            baseConsole.log(...args);
            addLog(plugin, LogType.LOG, args);
        },

        warn(...args: unknown[]) {
            baseConsole.warn(...args);
            addLog(plugin, LogType.WARNING, args);
        },

        error(...args: unknown[]) {
            baseConsole.error(...args);
            addLog(plugin, LogType.ERROR, args);
        }
    };
}

function addLog(
    plugin: LoadedPlugin,
    type: LogType,
    args: unknown[]
) {
    const text = args
        .map(a =>
            typeof a === "string"
                ? a
                : JSON.stringify(a, null, 2)
        )
        .join(" ");

    plugin.logs.push({
        type,
        timestamp: new Date(),
        text
    });
}