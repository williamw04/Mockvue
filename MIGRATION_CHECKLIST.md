# Migration Checklist - Dual Platform Support

This checklist helps you migrate your existing Electron app to support both Electron and Web deployment.

## ✅ Phase 1: Abstraction Layer (COMPLETED)

- [x] Create platform detection utilities (`src/utils/platform.ts`)
- [x] Define service interfaces (`src/services/interfaces.ts`)
- [x] Implement Electron service adapters
  - [x] Storage service
  - [x] File service  
  - [x] Notification service
- [x] Implement Web service adapters
  - [x] Storage service (IndexedDB)
  - [x] File service (File System Access API + fallbacks)
  - [x] Notification service (Web Notifications API + toast fallback)
- [x] Create service factory pattern
- [x] Create React Context and hooks for services
- [x] Wrap app with `ServicesProvider` in `main.tsx`

## 🔄 Phase 2: Update Existing Components (TO DO)

### Update Components Using Electron APIs

Replace direct `window.electronAPI` calls with service hooks:

- [ ] Update `Dashboard.tsx`
  - [ ] Replace `useElectron` with `useServices`
  - [ ] Use `storage.getDocuments()` instead of direct IPC
  - [ ] Add error handling with notifications
  
- [ ] Update `MyEditor.tsx`
  - [ ] Use `useStorage()` for document operations
  - [ ] Use `useFiles()` for import/export
  - [ ] Add auto-save functionality
  
- [ ] Update `DocumentGrid.tsx`
  - [ ] Use `storage.getDocuments()` for loading
  - [ ] Add search functionality with `storage.searchDocuments()`
  
- [ ] Update `RecentlyOpened.tsx`
  - [ ] Use storage service to track recent docs
  - [ ] Add click handlers to open documents

### Add New Features Using Services

- [ ] Add document import functionality
  ```typescript
  const files = useFiles();
  const file = await files.pickFile({ accept: ['.json', '.txt'] });
  if (file) {
    const data = await files.importDocument(file);
    await storage.createDocument(data);
  }
  ```

- [ ] Add document export functionality
  ```typescript
  const files = useFiles();
  await files.exportDocument(document, 'html');
  ```

- [ ] Add search functionality
  ```typescript
  const storage = useStorage();
  const results = await storage.searchDocuments(query);
  ```

## 🔄 Phase 3: Update Electron Main Process (TO DO)

### Enhance IPC Handlers in `electron/main.ts`

- [ ] Implement actual file system storage
  ```typescript
  // Example: Store documents as JSON files
  const documentsDir = path.join(app.getPath('userData'), 'documents');
  ```

- [ ] Add file dialog handlers
  ```typescript
  ipcMain.handle('open-file-dialog', async () => {
    return dialog.showOpenDialog({ properties: ['openFile'] });
  });
  ```

- [ ] Add database integration (optional)
  - [ ] Install SQLite: `npm install better-sqlite3`
  - [ ] Create database schema
  - [ ] Implement CRUD operations

- [ ] Update preload.ts with new IPC methods
  ```typescript
  contextBridge.exposeInMainWorld('electronAPI', {
    // Existing methods
    getDocuments: () => ipcRenderer.invoke('get-documents'),
    
    // New methods
    openFileDialog: (options) => ipcRenderer.invoke('open-file-dialog', options),
    saveFileDialog: (content, options) => ipcRenderer.invoke('save-file-dialog', content, options),
  });
  ```

## 🔄 Phase 4: Router Configuration (TO DO)

### Make Router Conditional

- [ ] Update `App.tsx` to use conditional router:
  ```typescript
  import { HashRouter, BrowserRouter } from "react-router-dom";
  import { isElectron } from "./utils/platform";
  
  const Router = isElectron() ? HashRouter : BrowserRouter;
  
  function App() {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/document/:id?" element={<MyEditor />} />
        </Routes>
      </Router>
    );
  }
  ```

- [ ] Update navigation links to work with both routers
- [ ] Test routing in both environments

## 🔄 Phase 5: Build Configuration (TO DO)

### Update Package Scripts

- [ ] Add web-specific build script:
  ```json
  "scripts": {
    "dev": "vite",
    "dev:electron": "npm run electron:dev",
    "build:web": "tsc && vite build",
    "build:electron": "tsc && vite build && npm run build:electron",
    "preview:web": "vite preview"
  }
  ```

### Update Vite Config

- [ ] Create conditional base path:
  ```typescript
  // vite.config.ts
  export default defineConfig(({ mode }) => ({
    base: mode === 'electron' ? './' : '/',
    // ...
  }));
  ```

### Environment Variables

- [ ] Create `.env.development`
  ```
  VITE_PLATFORM=web
  ```

- [ ] Create `.env.electron`
  ```
  VITE_PLATFORM=electron
  ```

- [ ] Use environment variables for configuration

## 🔄 Phase 6: Testing (TO DO)

### Unit Tests

- [ ] Test services with mocks
  ```typescript
  const mockStorage = {
    getDocuments: jest.fn().mockResolvedValue([]),
  };
  ```

- [ ] Test components with mock services
- [ ] Test platform detection utilities

### Integration Tests

- [ ] Test Electron build
  - [ ] Run: `npm run electron:build`
  - [ ] Test installer
  - [ ] Verify all features work

- [ ] Test web build
  - [ ] Run: `npm run build:web`
  - [ ] Test in different browsers
  - [ ] Test offline functionality

### Cross-Platform Testing

- [ ] Test on macOS
- [ ] Test on Windows  
- [ ] Test on Linux
- [ ] Test in Chrome, Firefox, Safari, Edge

## 🔄 Phase 7: Web Deployment (TO DO)

### Prepare for Web Deployment

- [ ] Add PWA support (optional)
  - [ ] Create `manifest.json`
  - [ ] Add service worker
  - [ ] Configure caching strategy

- [ ] Add backend API (if needed)
  - [ ] Set up Express/Fastify server
  - [ ] Create REST/GraphQL API
  - [ ] Add authentication

- [ ] Configure hosting
  - [ ] Vercel: Add `vercel.json`
  - [ ] Netlify: Add `netlify.toml`
  - [ ] Custom: Configure nginx/Apache

### Security for Web

- [ ] Add authentication system
- [ ] Implement CORS policies
- [ ] Add rate limiting
- [ ] Configure CSP headers
- [ ] Enable HTTPS

## 🔄 Phase 8: Polish & Documentation (TO DO)

### User Experience

- [ ] Add loading states
- [ ] Add error boundaries
- [ ] Improve error messages
- [ ] Add keyboard shortcuts
- [ ] Add tooltips/help text

### Documentation

- [ ] Update README with deployment instructions
- [ ] Add API documentation
- [ ] Create user guide
- [ ] Add contributing guidelines
- [ ] Document environment setup

### Performance

- [ ] Add code splitting
- [ ] Optimize bundle size
- [ ] Add lazy loading for routes
- [ ] Optimize images
- [ ] Add performance monitoring

## 📋 Quick Reference Commands

```bash
# Development
npm run dev              # Web development server
npm run electron:dev     # Electron development

# Building
npm run build:web        # Build for web deployment
npm run electron:build   # Build Electron app

# Testing
npm run preview:web      # Preview web build locally

# Deployment
# Web: Push to Vercel/Netlify or deploy dist/ folder
# Electron: Distribute files from release/ folder
```

## ⚠️ Common Issues & Solutions

### Issue: Services not working in Electron
- **Solution**: Ensure `ServicesProvider` is wrapping your app
- **Check**: Verify `window.electronAPI` is exposed in preload.ts

### Issue: IndexedDB not working in web
- **Solution**: Check browser console for errors
- **Note**: Some browsers restrict IndexedDB in private mode

### Issue: File System Access not working
- **Solution**: This API requires HTTPS in production
- **Fallback**: The implementation already includes fallbacks

### Issue: Notifications not showing
- **Solution**: Request permission explicitly
- **Check**: Browser might be blocking notifications

### Issue: Router not working in Electron
- **Solution**: Use HashRouter for Electron, BrowserRouter for web
- **Check**: Verify conditional router setup in App.tsx

## 🎯 Success Criteria

Your migration is complete when:

- [x] ✅ Service abstraction layer is implemented
- [ ] ✅ All components use services instead of direct APIs
- [ ] ✅ App runs in both Electron and web browser
- [ ] ✅ Data persists correctly on both platforms
- [ ] ✅ File operations work on both platforms
- [ ] ✅ Notifications work on both platforms
- [ ] ✅ Tests pass for both platforms
- [ ] ✅ Build process works for both platforms
- [ ] ✅ Documentation is updated

## 📚 Additional Resources

- See `ARCHITECTURE.md` for system overview
- See `SERVICES_USAGE.md` for code examples
- Check `src/services/` for implementation details

