# Link Tooltips

Shows the full URL or file path in the browser's native tooltip when you hover
an ordinary link in BB. Works in desktop BB and remote browser clients,
including existing and newly streamed messages.

- Web URLs remain exact, including query strings and fragments.
- `file://` links display a decoded path, including line references.
- Existing tooltip text appears above the destination.
- Page fragment links (`#heading`) are left alone.
- Link navigation and context menus work as before.

No configuration, server storage, or network requests. Disabling or reloading
the plugin removes its listeners and restores the hovered link's original title.
Only ordinary `<a href>` links in the BB app document are covered; embedded
browser pages and links rendered as buttons are outside its scope. Tooltips use
the browser's normal hover delay and are intended for a mouse, not touch.

## Install

Install directly from GitHub:

```sh
bb plugin install https://github.com/SergeyZh/bb-plugin-link-tooltips.git
```

Or clone the repository and install from its directory:

```sh
npm install --include=dev
bb plugin build
bb plugin install .
```

The package and directory use BB's `bb-plugin-<name>` naming convention.
The installed plugin ID is `link-tooltips`.

## Development

```sh
npm run typecheck
npm test
npm run build
```

Tests use Node 22.6+ with TypeScript stripping and jsdom.

## License

[MIT](LICENSE) © 2026 Sergey Zhukov.
