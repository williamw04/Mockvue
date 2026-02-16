# Mockvue - Dual Platform Architecture

## Overview

Mockvue is designed as an **Electron desktop application**. This is achieved through a service abstraction layer that provides a unified API.

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
                           ▼
               ┌─────────────────────┐
               │  Electron Platform  │
               │   Implementation    │
               └─────────────────────┘
                          │
                          ▼
               ┌─────────────────────┐
               │    IPC + Node.js    │
               │    File System      │
               │    Native Dialogs   │
               └─────────────────────┘
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
  return 'electron';
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
  
  // Default to Electron
  return {
    storage: new ElectronStorageService(),
    files: new ElectronFileService(),
    notifications: new ElectronNotificationService(),
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



## Data Flow Examples

### Creating a Document

```
```
Component (Dashboard.tsx)
    │
    ├─> useStorage() hook
    │
    ├─> storage.createDocument(data)
    │
    └─> Electron: IPC call to main process
              └─> File system write
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
# Electron development
npm run electron:dev
```

### Production Builds

```bash
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



## Future Enhancements

### Short Term
1. Complete Electron file system implementation
2. Add database integration (SQLite for Electron)
3. Implement proper error boundaries


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



## Resources

- [Electron Documentation](https://www.electronjs.org/docs)


