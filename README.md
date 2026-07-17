Plugin System Plan
Goal

Create a simple plugin system where plugins are single JavaScript files that can be dropped into a plugins/ folder and loaded automatically.

Plugin Format

Each plugin builds into:

plugin-name.min.js


The file contains:

Plugin metadata
Plugin setup code
Services provided by the plugin
Dependencies

Example:

definePlugin({
    id: "example",
    version: "1.0.0",
    dependencies: [],

    setup(ctx) {
        // register services
    },

    dispose(ctx) {
        // cleanup
    }
});

Plugin Loading

Startup flow:

Scan the plugins/ folder.
Import every plugin.
Read metadata.
Store plugins by ID.
Load requested plugins.

When loading a plugin:

Check if it is already loaded.
Check if it is currently loading.
If yes, throw a circular dependency error.
Load all dependencies.
Run the plugin setup function.
Mark the plugin as loaded.
Dependencies

Plugins can depend on other plugins:

dependencies: [
    "express",
    "database"
]


Dependencies are resolved automatically.

Example:

dashboard
 └── react
      └── express


Loads as:

express
react
dashboard

Services

Plugins provide runtime services.

Example:

ctx.provide(
    "express",
    expressService
);


Other plugins access them:

const express = ctx.require("express");


The plugin manifest only contains metadata. Runtime objects are registered during setup.

Building Plugins

Plugins are developed normally with TypeScript.

Build process:

src/index.ts
      |
      v
   esbuild
      |
      v
plugin.min.js


Bundling rules:

Bundle all npm dependencies.
Externalize Node built-ins (node:*).
Output one JavaScript file.
Development Watch Mode

Plugin projects use esbuild watch mode:

plugin source
      |
      v
esbuild --watch
      |
      v
plugins/plugin.js


The main application watches the plugins folder.

When a plugin changes:

Dispose old plugin.
Clear module cache.
Import new plugin.
Setup new plugin.
Plugin Lifecycle

Plugins support:

setup()
dispose()


setup():

Register services.
Start listeners.
Create resources.

dispose():

Remove listeners.
Stop timers.
Close connections.
Future Ideas
Plugin version checking.
Optional dependencies.
Plugin permissions.
Plugin enable/disable states.
Shared runtime dependencies.
Plugin marketplace/installer.