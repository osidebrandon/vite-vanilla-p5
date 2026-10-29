# actor-sync

`actor-sync` is one private Bun workspace package with three subdirectory
exports:

- `actor-sync/core` - shared functionality.
- `actor-sync/client` - client-specific functionality.
- `actor-sync/server` - server-specific functionality.

There is one `package.json` at the project root, not one per directory:

```text
actor-sync/
  package.json
  core/index.ts
  client/index.ts
  server/index.ts
  tests/actor-sync.test.ts
```

`core` contains shared APIs; there is no separate `shared` package.

## Importing the package

Declare `"actor-sync": "workspace:*"` in a consumer's `dependencies`, then run
`bun install` from the repository root. Import from the package's subpaths:

```ts
// Browser app
import { logClientMessage } from "actor-sync/client";
import { logCoreMessage } from "actor-sync/core";

logClientMessage();
logCoreMessage();
```

```ts
// Bun server
import { logServerMessage } from "actor-sync/server";
import { logCoreMessage } from "actor-sync/core";

logServerMessage();
logCoreMessage();
```

The example client uses the client and core functions. The example server uses
the server and core functions. Use these subpaths rather than a bare
`actor-sync` import; there is no root export.

## Adding exports

Add a named export to the relevant directory's `index.ts`. For example, add
this to `core/index.ts`:

```ts
export function anotherCoreFunction(): void {
  console.log("Another core function.");
}
```

It can then be imported from `actor-sync/core` without changing the package
manifest. To keep an implementation in another file, re-export it from that
directory's `index.ts`.

For a new public subpath, create its entry file and add it to the single
`package.json` `exports` map. For example, to expose `utilities/index.ts`:

```json
{
  "exports": {
    "./core": "./core/index.ts",
    "./client": "./client/index.ts",
    "./server": "./server/index.ts",
    "./utilities": "./utilities/index.ts"
  }
}
```

Consumers can then import from `actor-sync/utilities`. Do not add another
package manifest inside the subdirectory. Add or update tests under `tests/`
using Bun's test framework, including the public export-shape test when adding
exports.

## Local updates

Bun links the consumer's `actor-sync` dependency to this workspace directory.
The package exports point directly at TypeScript source, so no package build,
copy, publish, or reinstall is required for source edits.

Run the examples from the repository root in separate terminals:

```sh
bun run dev:client
bun run dev:server
```

Vite watches the linked source and applies HMR or reloads the client when an
imported module changes. Bun's `--watch` mode restarts the console server when
its imported package sources change, printing both messages again. Only
modules imported by an app affect that app; server-only edits do not reload
the browser. Restart the dev processes after changing the `exports` map.

The server's dev script sets Bun's working directory to the repository root
so its watcher includes workspace package sources outside the app directory.

This source-only package is intended for local Vite/Bun workspace consumers,
not registry publishing or direct execution with plain Node.js.

## Tests

Only actor-sync has tests. From the repository root:

```sh
bun run test
```

Or run `bun run test` from this package directory. Tests use `bun:test` and
exercise the same subpath imports as the apps.
