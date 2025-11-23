# Electron Setup Guide

## Installation

First, install all dependencies:

```bash
npm install
```

## Running in Development Mode

To run the Electron app in development mode:

```bash
npm run electron:dev
```

This will:
1. Compile the Electron TypeScript files (main.ts and preload.ts)
2. Start the Vite development server
3. Wait for the server to be ready
4. Launch the Electron app with hot-reload for React code

## Building for Production

### Build for Current Platform

```bash
npm run electron:build
```

### Build for Specific Platforms

```bash
# macOS
npm run electron:build:mac

# Windows
npm run electron:build:win

# Linux
npm run electron:build:linux
```

The built applications will be in the `release/` directory.

## Architecture

### Main Process (`electron/main.ts`)
- Creates the application window
- Handles system events
- Manages IPC communication
- Will integrate with SQLite database

### Preload Script (`electron/preload.ts`)
- Provides secure bridge between main and renderer processes
- Exposes limited API via `window.electronAPI`
- Uses context isolation for security

### Renderer Process (`src/`)
- React application
- UI components
- Communicates with main process via `window.electronAPI`

## IPC API

The following methods are available in the renderer process via `window.electronAPI`:

### Document Operations
- `getDocuments()` - Get all documents
- `createDocument(data)` - Create a new document
- `updateDocument(id, data)` - Update a document
- `deleteDocument(id)` - Delete a document

### Platform Info
- `platform` - Current OS platform

## Security Best Practices

✅ **Implemented:**
- Context isolation enabled
- Node integration disabled
- Sandbox enabled
- Preload script for secure IPC

## Next Steps

1. Integrate SQLite database in main process
2. Implement CRUD operations for documents
3. Add file system operations
4. Implement calendar data persistence
5. Add application menu
6. Implement auto-updates

## Troubleshooting

### Electron fails to start
- Make sure you've run `npm run build:electron` or that the TypeScript files have been compiled
- Check that `dist-electron/main.js` exists

### Window is blank
- Check the console for errors
- Make sure the Vite dev server is running on port 5173
- Try running `npm run dev` separately to test the React app

### Build fails
- Ensure all dependencies are installed
- Check that you have the necessary tools for your platform (Xcode for macOS, etc.)
- Review the electron-builder logs in the console

