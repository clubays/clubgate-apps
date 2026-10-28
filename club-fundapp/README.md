# My Clubgate

## Develop

```bash
pnpm install
pnpm dev        # terminal 1: your app on :5174
pnpm emulator   # terminal 2: mock Clubays host on :5199
```

Open the URL the emulator prints. Edit `scopes` in the emulator's mock data to test `scope_denied`.

## Package

```bash
pnpm build
pnpm package    # creates <id>-<version>.zip
```

Upload the zip to Clubays. Bump `version` in `clubgate.json` for every release.
Only request the scopes you need.
