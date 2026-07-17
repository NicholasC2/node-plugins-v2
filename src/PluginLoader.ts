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
            const module = await import(
                pathToFileURL(path.join(pluginPath)).href
            );

            const plugin: Plugin = module.default;

            if (!plugin?.start) {
                console.warn(
                    `skipping "${entry.name}": invalid plugin`
                );
                continue;
            }

            const loadedPlugin: LoadedPlugin = {
                ...plugin,
                state: PluginState.STOPPED,
                logs: []
            };

            plugins.push(loadedPlugin);

        } catch (error) {
            console.error(
                `Failed to load plugin ${entry.name}`,
                error
            );
        }
    }

    return plugins;
}