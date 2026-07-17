import { Command, LoadedPlugin, PluginState } from "../types";
import { createPluginLogger } from "./PluginLogger";

export class PluginManager {
    private readonly commands = new Map<string, Command>();

    readonly plugins: readonly LoadedPlugin[];

    private readonly services = new Map<string, unknown>();

    constructor(plugins: LoadedPlugin[]) {
        this.plugins = plugins;

        this.registerCommand("help", {
            description: "displays a list of commands",
            run: () => {
                console.log([...this.commands]
                    .map(c => `   ${c[0]} - ${c[1].description}`)
                    .join("\n"))
            }
        });

        this.registerCommand("list", {
            description: "lists the loaded plugins",
            run: () => {
                console.log([...this.plugins]
                    .map(p => `   ${p.name}-${p.version} : ${p.state}`)
                    .join("\n"))
            }
        });

        this.registerCommand("start", {
            description: "starts a plugin",
            run: async (args) => {
                const pluginName = args[0];

                const plugin = this.plugins.find(p => p.name === pluginName);

                if(!plugin) {
                    console.error(`plugin "${pluginName}" doesn't exist`)
                    return;
                }

                try {
                    await this.startPlugin(plugin);
                } catch (err) {
                    console.error(err);
                }
            }
        });

        this.registerCommand("stop", {
            description: "stops a plugin",
            run: async (args) => {
                const pluginName = args[0];

                const plugin = this.plugins.find(p => p.name === pluginName);

                if(!plugin) {
                    console.error(`plugin "${pluginName}" doesn't exist`)
                    return;
                }

                try {
                    await this.stopPlugin(plugin);
                } catch (err) {
                    console.error(err);
                }
            }
        });
    }

    registerCommand(name: string,command: Command): void {
        this.commands.set(name, command);
    }

    getCommand(name: string): any {
        return this.commands.get(name);
    }

    setService<T>(name: string, service: T): void {
        this.services.set(name, service);
    }

    getService<T>(name: string): T | undefined {
        return this.services.get(name) as T | undefined;
    }

    hasService(name: string): boolean {
        return this.services.has(name);
    }

    async startPlugin(plugin: LoadedPlugin): Promise<void> {
        if (plugin.state === PluginState.RUNNING) {
            console.error(`plugin "${plugin.name}" is already running!`);
            return;
        }

        const oldConsole = console;

        console = {
            ...oldConsole,
            ...createPluginLogger(plugin)
        };

        try {
            await plugin.start(this);
            plugin.state = PluginState.RUNNING;
        } catch (err) {
            plugin.state = PluginState.CRASHED;
            console.error(err);
        } finally {
            console = oldConsole;
        }
    }

    async stopPlugin(plugin: LoadedPlugin): Promise<void> {
        const oldConsole = console;

        console = {
            ...oldConsole,
            ...createPluginLogger(plugin)
        };

        try {
            await plugin.stop(this);
            plugin.state = PluginState.STOPPED;
        } finally {
            console = oldConsole;
        }
    }
}