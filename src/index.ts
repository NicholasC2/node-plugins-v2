import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { loadPlugins } from "./PluginLoader";
import { PluginManager } from "./PluginManager";
import { PluginState } from "../types";
import { watch } from "node:fs";

const rl = readline.createInterface({
    input: stdin,
    output: stdout,
});

rl.on("SIGINT", () => {
    console.log()
    rl.close();
    process.exit(0);
});

async function start() {
    const manager = new PluginManager(await loadPlugins("./plugins"));

    for(const plugin of manager.plugins) {
        if(plugin.state === PluginState.RUNNING) continue;
        console.log(`> start "${plugin.name.replaceAll(`"`, `\\"`)}"`);
        try {
            await manager.startPluginWithDeps(plugin);
        } catch {}
    }

    console.log("> list")

    await manager.getCommand("list")?.run([], manager)

    while (true) {
        try {
            const command = await rl.question("> ");

            const args = tokenize(command);

            const cmdName = args.shift();

            if(!cmdName) continue;

            const cmd = manager.getCommand(cmdName);

            if(!cmd) {
                console.error(`command "${cmdName}" doesn't exist`);
                continue;
            }

            await cmd.run(args, manager);
        } catch {}
    }
}

start()

function tokenize(input: string): string[] {
    const tokens: string[] = [];
    let current = "";
    let quote: string | null = null;
    let escaped = false;

    for (const char of input) {
        if (escaped) {
            current += char;
            escaped = false;
            continue;
        }

        if (char === "\\") {
            escaped = true;
            continue;
        }

        if (quote) {
            if (char === quote) {
                quote = null;
            } else {
                current += char;
            }
            continue;
        }

        if (char === '"' || char === "'") {
            quote = char;
            continue;
        }

        if (/\s/.test(char)) {
            if (current.length > 0) {
                tokens.push(current);
                current = "";
            }
            continue;
        }

        current += char;
    }

    if (current.length > 0) {
        tokens.push(current);
    }

    return tokens;
}