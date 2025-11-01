# Mockvue - Dual Platform Architecture

## Overview

Mockvue is designed to run as both an **Electron desktop application** and a **web application** using a shared codebase. This is achieved through a service abstraction layer that provides a unified API regardless of the platform.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     React Application                        │
│  (Components, Hooks, UI - Platform Agnostic)                │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  Service Abstraction Layer                   │
│                    (services/interfaces.ts)                  │
│  ┌───────────────┬──────────────────┬──────────────────┐   │
│  │   Storage     │      Files       │  Notifications   │   │
│  │   Service     │     Service      │     Service      │   │
│  └───────────────┴──────────────────┴──────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                 ┌─────────┴──────────┐
                 ▼                    ▼
     ┌──────────────────┐   ┌──────────────────┐
     │ Electron Platform│   │   Web Platform   │
     │   Implementation │   │  Implementation  │
     └──────────────────┘   └──────────────────┘
              │                       │
              ▼                       ▼
     ┌──────────────────┐   ┌──────────────────┐
     │  IPC + Node.js   │   │  Browser APIs    │
     │  File System     │   │  IndexedDB       │
     │  Native Dialogs  │   │  File System API │
     └──────────────────┘   └──────────────────┘
```

## Directory Structure

```
src/
├── components/           # React components (platform-agnostic)
├── hooks/               # React hooks
│   └── useElectron.ts   # Legacy - can be replaced with useServices
├── services/            # Service abstraction layer ⭐
│   ├── interfaces.ts    # Service interface definitions
│   ├── factory.ts       # Platform detection & service creation
│   ├── context.tsx      # React context provider & hooks
│   ├── index.ts         # Public API exports
│   ├── electron/        # Electron implementations
│   │   ├── storage.ts
│   │   ├── files.ts
│   │   ├── notifications.ts
│   │   └── index.ts
│   └── web/             # Web implementations
│       ├── storage.ts
│       ├── files.ts
│       ├── notifications.ts
│       └── index.ts
├── utils/               # Utility functions
│   └── platform.ts      # Platform detection utilities ⭐
├── types.ts             # TypeScript type definitions
├── App.tsx              # Main app component
└── main.tsx             # Entry point with ServicesProvider

electron/                # Electron main process
├── main.ts             # Electron main process
└── preload.ts          # Electron preload script
```

## Key Concepts

### 1. Service Abstraction

Instead of directly using platform-specific APIs, components use services through a common interface:

```typescript
// ❌ Bad - Direct Electron API usage
if (window.electronAPI) {
  const docs = await window.electronAPI.getDocuments();
}

// ✅ Good - Service abstraction
const storage = useStorage();
const docs = await storage.getDocuments();
```

### 2. Platform Detection

The platform is automatically detected at runtime:

```typescript
// src/utils/platform.ts
export const getPlatform = (): Platform => {
  if (typeof window !== 'undefined' && window.electronAPI) {
    return 'electron';
  }
  return 'web';
};
```

### 3. Automatic Service Selection

The service factory automatically creates the right implementation:

```typescript
// src/services/factory.ts
export function createServices(): IAppServices {
  const platform = getPlatform();

  if (platform === 'electron') {
    return {
      storage: new ElectronStorageService(),
      files: new ElectronFileService(),
      notifications: new ElectronNotificationService(),
    };
  }

  return {
    storage: new WebStorageService(),
    files: new WebFileService(),
    notifications: new WebNotificationService(),
  };
}
```

### 4. React Integration

Services are provided through React Context:

```typescript
// src/main.tsx
<ServicesProvider>
  <App />
</ServicesProvider>

// In any component
const { storage, files, notifications } = useServices();
```

## Platform-Specific Implementations

### Electron Implementation

**Storage**: Uses IPC to communicate with main process for file system operations
- Documents can be stored as files
- Can use SQLite or other Node.js databases
- Full file system access

**Files**: Uses native Electron dialogs
- `dialog.showOpenDialog()` for file picker
- `dialog.showSaveDialog()` for save dialog
- Direct file system access via Node.js

**Notifications**: Uses Electron's native notification system
- No permission required
- Native OS notifications
- Tray icon support available

### Web Implementation

**Storage**: Uses IndexedDB for browser-based persistence
- Structured data storage
- Works offline
- No server required (but can be added)

**Files**: Uses File System Access API with fallbacks
- Modern browsers: File System Access API
- Fallback: Traditional file input + download links
- Limited to user-selected files

**Notifications**: Uses Web Notifications API
- Requires user permission
- Fallback to toast notifications if not supported
- Works across modern browsers

## Data Flow Examples

### Creating a Document

```
Component (Dashboard.tsx)
    │
    ├─> useStorage() hook
    │
    ├─> storage.createDocument(data)
    │
    ├─> Platform detected (Electron or Web)
    │
    ├─────┬─> Electron: IPC call to main process
    │     │              └─> File system write
    │     │
    │     └─> Web: IndexedDB transaction
    │              └─> Store in browser database
    │
    └─> Document returned to component
```

### Exporting a Document

```
Component
    │
    ├─> useFiles() hook
    │
    ├─> files.exportDocument(doc, 'html')
    │
    ├─────┬─> Electron: Native save dialog
    │     │              └─> Write file to disk
    │     │
    │     └─> Web: File System Access API or download
    │              └─> Browser download
    │
    └─> Success/failure returned
```

## Benefits of This Architecture

### ✅ **Code Reusability**
- Write business logic once
- Shared components across platforms
- Single codebase to maintain

### ✅ **Type Safety**
- TypeScript interfaces ensure consistency
- Compile-time checks for both platforms
- Autocomplete for all service methods

### ✅ **Testability**
- Services can be mocked easily
- Test components independently of platform
- Dependency injection via React Context

### ✅ **Flexibility**
- Easy to add new platforms (mobile, etc.)
- Can swap implementations without changing components
- Feature detection built-in

### ✅ **Performance**
- Platform-native features used when available
- Graceful degradation in browsers
- Efficient data storage for each platform

## Build & Deployment

### Development

```bash
# Web development
npm run dev

# Electron development
npm run electron:dev
```

### Production Builds

```bash
# Web build (deploy to Vercel, Netlify, etc.)
npm run build

# Electron build (generates installers)
npm run electron:build:mac    # macOS
npm run electron:build:win    # Windows
npm run electron:build:linux  # Linux
```

## Migration Path

### From Direct Electron API Usage

```typescript
// Before
const { isElectron, electronAPI } = useElectron();
if (isElectron && electronAPI) {
  const docs = await electronAPI.getDocuments();
}

// After
const storage = useStorage();
const docs = await storage.getDocuments(); // Works on both platforms!
```

### From Browser-Only Code

```typescript
// Before
const docs = JSON.parse(localStorage.getItem('docs') || '[]');

// After
const storage = useStorage();
const docs = await storage.getDocuments(); // Uses IndexedDB on web, files on Electron
```

## Future Enhancements

### Short Term
1. Complete Electron file system implementation
2. Add database integration (SQLite for Electron)
3. Implement proper error boundaries
4. Add offline sync for web version

### Long Term
1. Add authentication service
2. Cloud sync between devices
3. Collaborative editing
4. Mobile apps (React Native with same services)
5. Plugin system for extensibility

## Technical Decisions

### Why IndexedDB over localStorage?
- localStorage limited to 5-10MB
- IndexedDB can store much larger amounts
- Better performance for complex queries
- Structured data with indexes

### Why HashRouter for Electron?
- File protocol doesn't support traditional routing
- HashRouter works with `file://` URLs
- Web version can use BrowserRouter

### Why Context over Props?
- Services needed throughout the app
- Avoids prop drilling
- Easy to mock for testing
- Clean component APIs

## Troubleshooting

### Services not available in components
- Ensure `ServicesProvider` wraps your app in `main.tsx`
- Check that you're using `useServices()` inside a component

### Platform detection not working
- Check that `window.electronAPI` is properly exposed in `preload.ts`
- Verify contextBridge is working correctly

### IndexedDB errors in web version
- Some browsers limit IndexedDB in private/incognito mode
- Check browser console for quota errors
- Ensure HTTPS in production (required for some browsers)

## Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)
- [Web Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)

