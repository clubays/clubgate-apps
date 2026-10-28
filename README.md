<div align="center">

# 🚪 clubgate-apps

**Open-source apps for Clubays Clubgate**

Build an app for every club on Clubays.

[![Made for Clubays](https://img.shields.io/badge/made%20for-Clubays-blue?style=for-the-badge)](https://clubays.com)
[![Schema](https://img.shields.io/badge/manifest-v1-success?style=for-the-badge)](https://asset-ark.clubays.com/schemas/clubgate/v1.json)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge)](#-contributing)

</div>

---

## ✨ What is this?

This repository contains the open-source **Clubgate apps** built for [Clubays](https://clubays.com). Each app is a self-contained web app described by a `clubgate.json` manifest. Clubgate reads the manifest, loads the app's entry point, and grants it only the scopes it asks for.

## 🛠️ Build an app

Go from an empty folder to a zip you can upload. You'll need **Node.js** and **npm** installed. Commands below use npm; if you prefer pnpm, swap in the equivalent.

### 1. Create the app

Scaffolds a Vite + React project with the ClubGate SDK already installed.

```bash
npm create @clubays/clubgate-app@latest my-app
```

Use lowercase letters, numbers, and dashes for the app name.

### 2. Install dependencies

Run this inside the new folder.

```bash
cd my-app
npm install
```

`@clubays/clubgate-sdk` is installed with it.

### 3. Run it locally

Open two terminals and keep both running. The emulator stands in for the real Clubays host while you build.

```bash
# Terminal 1: your app
npm run dev
```

```bash
# Terminal 2: mock Clubays host
npm run emulator
```

### 4. Build for production

Creates the `dist` folder that gets packaged. Do this before every pack.

```bash
npm run build
```

You should end up with `dist/index.html`.

> **Seeing "dist/index.html not found"?** The build hasn't run, or it failed. Run `npm run build` again and check the output for errors.

### 5. Package the app

Bundles `dist` and your `clubgate.json` manifest into one zip.

```bash
npx clubgate-pack
```

Output: `my-app-0.1.0.zip`. This is the file you upload to Clubays.

### 6. Check the zip

Lists what's inside without unpacking it.

```bash
tar -tf my-app-0.1.0.zip
```

You should see:

```
clubgate.json
assets/
assets/index-[hash].js
index.html
```

> **Seeing "Failed to open archive"?** The zip is missing or the filename doesn't match. Check that `npx clubgate-pack` finished successfully and that you're using the exact name and version it printed.

### 7. Upload

Upload and validation are **coming soon**. Keep your zip handy and you'll submit it to Clubays.

## 🧾 The manifest

Every app has a `clubgate.json` at its root:

```json
{
  "$schema": "https://asset-ark.clubays.com/schemas/clubgate/v1.json",
  "schemaVersion": 1,
  "id": "club-fundapp",
  "name": "Club Fundapp",
  "version": "0.1.4",
  "description": "A Clubays application, clubgate",
  "entry": "index.html",
  "scopes": ["user.read", "profile.read"]
}
```

| Field           | Description                                        |
| --------------- | -------------------------------------------------- |
| `$schema`       | Link to the manifest schema, for editor validation |
| `schemaVersion` | Version of the manifest format                     |
| `id`            | Unique, stable identifier for the app              |
| `name`          | Display name                                       |
| `version`       | App version                                        |
| `description`   | Short summary of what the app does                 |
| `entry`         | File Clubgate loads first                          |
| `scopes`        | Permissions the app requests                       |

### 🔐 Scopes

| Scope          | Grants                  |
| -------------- | ----------------------- |
| `user.read`    | Read basic user info    |
| `profile.read` | Read the user's profile |

Request only what your app needs.

> 💡 **Editor tip:** in VS Code, trust the schema domain once via
> **JSON: Manage Trusted Schema Domains** → `https://asset-ark.clubays.com`
> to get validation and autocomplete in your manifest.

## 📦 Repository layout

```
clubgate-apps/
├── club-fundapp/
│   ├── clubgate.json
│   ├── package.json
│   └── src/
├── another-app/
│   └── ...
└── README.md
```

Each app lives in its own folder, created with the scaffold command above.

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a branch: `git checkout -b feature/my-app`
3. Commit your changes: `git commit -m "Add my-app"`
4. Push the branch: `git push origin feature/my-app`
5. Open a Pull Request

Please make sure your `clubgate.json` validates against the schema and that `id` is unique.

## 📄 License

Add your license here (e.g. MIT) and include a `LICENSE` file in the repo root.

---

<div align="center">

Built with ❤️ by the **Clubays** team

</div>
