# Testing Guide - Dual Platform App

## 🚀 Quick Start

### Test Web Version
```bash
npm run dev
```
Then open: http://localhost:5173

### Test Electron Version
```bash
npm run electron:dev
```

## ✅ Testing Checklist

Use this checklist to verify everything works on **both platforms**.

### Basic Document Operations

#### Create Document
- [ ] Click "New Document" button on Dashboard
- [ ] Should navigate to `/document` (or `#/document` in Electron)
- [ ] Enter title and description
- [ ] Type some content in editor
- [ ] Click "Save Document"
- [ ] Should see "Document saved!" notification
- [ ] URL should update to `/document/:id`

#### View Documents
- [ ] Return to Dashboard (`/`)
- [ ] Should see your new document in the grid
- [ ] Should see document in "Recently Opened" section
- [ ] Word count should be displayed
- [ ] Last modified time should show

#### Edit Document
- [ ] Click on a document card
- [ ] Should open in editor
- [ ] Title and description should be editable
- [ ] Content should load in editor
- [ ] Make changes to content
- [ ] Wait 2 seconds (auto-save should trigger)
- [ ] Should see "Saved [time]" at bottom of sidebar

#### Delete Document
- [ ] On Dashboard, hover over a document card
- [ ] Click the three-dot menu button
- [ ] Click "Delete"
- [ ] Confirm deletion
- [ ] Should see "Document deleted" notification
- [ ] Document should disappear from grid

### Search & Filter

#### Search Documents
- [ ] On Dashboard, type in search box
- [ ] Should see loading spinner briefly
- [ ] Results should filter as you type
- [ ] Should search title, description, content, and tags
- [ ] Click X button to clear search

#### Sort Documents
- [ ] On Dashboard, use sort dropdown
- [ ] Try "Most Recent" - newest first
- [ ] Try "Alphabetical" - A to Z by title
- [ ] Try "Word Count" - highest to lowest

### Export Documents

#### Export as HTML
- [ ] Open a document in editor
- [ ] Hover over "Export" button in sidebar
- [ ] Click "Export as HTML"
- [ ] **Web**: File should download
- [ ] **Electron**: Save dialog should appear (once implemented)
- [ ] Open exported file - should be nicely formatted HTML

#### Export as JSON
- [ ] Follow same process but choose "Export as JSON"
- [ ] File should contain all document data in JSON format

#### Export as Text
- [ ] Follow same process but choose "Export as Text"
- [ ] File should be plain text with document content

### Navigation

#### Routes
- [ ] Click Dashboard logo/home button
- [ ] Should navigate to `/`
- [ ] Click "New Document"
- [ ] Should navigate to `/document`
- [ ] Click a document card
- [ ] Should navigate to `/document/:id`
- [ ] Use browser back button (or window navigation in Electron)
- [ ] Should work correctly

#### Recent Documents
- [ ] Open several documents
- [ ] Return to Dashboard
- [ ] "Recently Opened" section should show last 6 documents
- [ ] Click a recent document
- [ ] Should open that document

### Persistence

#### Data Persistence Test
- [ ] Create a new document with recognizable content
- [ ] Save it
- [ ] **Web**: Close browser tab, reopen http://localhost:5173
- [ ] **Electron**: Quit app (Cmd+Q / Alt+F4), restart
- [ ] Your document should still be there
- [ ] Content should be intact

#### Multiple Sessions (Web Only)
- [ ] Open app in two browser tabs
- [ ] Create document in Tab 1
- [ ] Refresh Tab 2
- [ ] Document should appear in Tab 2

### Error Handling

#### Empty States
- [ ] Delete all documents
- [ ] Dashboard should show "No documents yet" message
- [ ] Search for non-existent text
- [ ] Should show "No documents found matching your search"

#### Loading States
- [ ] On Dashboard load, should see loading spinner briefly
- [ ] When saving, "Save Document" button should show "Saving..."
- [ ] When searching, should see loading spinner in search box

### Platform-Specific Tests

#### Web-Specific
- [ ] Open DevTools → Application → IndexedDB
- [ ] Should see `mockvue-db` database
- [ ] Should see `documents` object store
- [ ] Your documents should be stored there
- [ ] Notifications should appear (or toast if permission denied)

#### Electron-Specific
- [ ] Window should be titled "Mockvue"
- [ ] Check console: Should log "Running on: electron"
- [ ] Close window → Quit app
- [ ] Reopen → Data should persist

## 🐛 Common Issues

### Issue: Documents Not Persisting

**Web:**
- Check browser console for IndexedDB errors
- Try different browser (some restrict IndexedDB)
- Check if in private/incognito mode (may disable IndexedDB)

**Electron:**
- Check that IPC handlers are implemented in `electron/main.ts`
- Currently using placeholder handlers - data won't persist until fully implemented

### Issue: Search Not Working
- Check browser console for errors
- Ensure documents have content to search
- Try clearing cache and reloading

### Issue: Router Not Working in Electron
- Should use HashRouter (URLs like `#/document`)
- Check that `window.electronAPI` is detected
- Check `App.tsx` router selection logic

### Issue: Notifications Not Showing

**Web:**
- Browser might need permission
- Check browser notification settings
- Should fall back to toast notifications if blocked

**Electron:**
- Should work without permission
- Check console for errors

## 🎯 Platform Comparison

| Feature | Web | Electron | Notes |
|---------|-----|----------|-------|
| Storage | IndexedDB | IPC/File System | Both work offline |
| Search | Client-side | Client-side | Fast, local |
| Export | Download | Save Dialog | Web uses download link |
| Notifications | Web API + Toast | Native | Electron more reliable |
| Routing | BrowserRouter | HashRouter | Different URL formats |
| Offline | Yes (PWA ready) | Yes | Both fully offline capable |

## 📊 Performance Benchmarks

Test these for acceptable performance:

- [ ] Dashboard loads in < 1 second
- [ ] Document opens in < 500ms
- [ ] Search returns results in < 200ms
- [ ] Save completes in < 500ms
- [ ] Export completes in < 1 second

## 🎨 UI/UX Checks

- [ ] All buttons have hover states
- [ ] Loading spinners show for async operations
- [ ] Notifications appear and dismiss automatically
- [ ] Smooth transitions and animations
- [ ] No layout shift when loading
- [ ] Responsive design works on different screen sizes

## 🔒 Security Checks (Production Only)

For web deployment:

- [ ] HTTPS enabled
- [ ] CSP headers configured
- [ ] No sensitive data in localStorage
- [ ] Proper error handling (no stack traces to user)
- [ ] Input validation

## ✅ Sign-Off Checklist

Before considering Phase 2 complete:

- [ ] All basic CRUD operations work
- [ ] Search and sort work correctly
- [ ] Export works (at least for web)
- [ ] Navigation works
- [ ] Data persists across sessions
- [ ] No console errors in either platform
- [ ] Loading and error states display correctly
- [ ] Notifications work
- [ ] UI is responsive and polished

## 🎉 Success!

If all tests pass on **both web and Electron**, Phase 2 is successfully complete!

You now have a truly dual-platform application that shares the same codebase but works natively on both web and desktop.

## 📝 Reporting Issues

If you find issues:

1. Note which platform (Web/Electron)
2. Note which browser (if Web)
3. Describe steps to reproduce
4. Check browser/electron console for errors
5. Include any error messages

## 🚀 Next Steps

Once testing is complete:

1. Review `PHASE_2_COMPLETE.md` for summary
2. Check `MIGRATION_CHECKLIST.md` for remaining work
3. Consider Phase 3: Electron main process implementation
4. Consider Phase 4: Web deployment preparation

