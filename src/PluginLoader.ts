import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { PluginState, type LoadedPlugin, type Plugin } from "../types";

export async function loadPlugins(directory: string): Promise<LoadedPlugin[]> {
    const plugins: LoadedPlugin[] = [];

    const absoluteDirectory = path.resolve(directory);

    const entries = await fs.readdir(absoluteDirectory, {
        withFileTypes: true
    });

    for (const entry of entries) {
        if (entry.isDirectory()) continue;

        const pluginPath = path.join(
            absoluteDirectory,
            entry.name
        );

        try {
            plugins.push(await loadPlugin(pluginPath));
        } catch {}
    }

    return plugins;
}

export async function loadPlugin(filename: string): Promise<LoadedPlugin> {
    const pluginPath = path.resolve(filename);

    const module = await import(
        `${pathToFileURL(pluginPath).href}?t=${Date.now()}`
    );

    const plugin: Plugin = module.default;

    if (!plugin?.start) {
        throw new Error(`invalid plugin`)
    }

    const loadedPlugin: LoadedPlugin = {
        ...plugin,
        state: PluginState.STOPPED,
        logs: []
    };

    return loadedPlugin
}