# Testing Guide

## 🚀 Quick Start

### Test Electron Version
```bash
npm run electron:dev
```

## ✅ Testing Checklist

## ✅ Testing Checklist

Use this checklist to verify the application works correctly.

### Basic Document Operations

#### Create Document
- [ ] Click "New Document" button on Dashboard
- [ ] Should navigate to `/document`
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
- [ ] Save dialog should appear
- [ ] Save the file
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
- [ ] Quit app (Cmd+Q / Alt+F4), restart
- [ ] Your document should still be there
- [ ] Content should be intact



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

### Application Environment
- [ ] Window should be titled "Mockvue"
- [ ] Check console: Should log "Running on: electron"
- [ ] Close window → Quit app
- [ ] Reopen → Data should persist

## 🐛 Common Issues

### Issue: Documents Not Persisting

- Check that IPC handlers are implemented in `electron/main.ts`
- Check storage location permissions

### Issue: Search Not Working
- Check browser console for errors
- Ensure documents have content to search
- Try clearing cache and reloading

### Issue: Router Not Working
- Should use HashRouter (URLs like `#/document`)
- Check `App.tsx` router configuration

### Issue: Notifications Not Showing

- Check console for errors
- Should work via native OS notifications



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

## 🔒 Security Checks

- [ ] Check console for security warnings
- [ ] Verify no external resources are loaded without protection
- [ ] Confirm context isolation is active

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

If all tests pass, the Electron application is working correctly!

You now have a fully functional desktop application.

## 📝 Reporting Issues

If you find issues:

1. Describe steps to reproduce
2. Check console for errors
4. Check browser/electron console for errors
5. Include any error messages

## 🚀 Next Steps

Once testing is complete:

1. Review `PHASE_2_COMPLETE.md` for summary
2. Check `MIGRATION_CHECKLIST.md` for remaining work
3. Consider Phase 3: Electron main process implementation

