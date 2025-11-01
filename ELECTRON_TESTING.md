# Electron Testing Guide - Phase 3

## 🚀 Quick Start

```bash
npm run electron:dev
```

## ✅ Essential Tests

### 1. Data Persistence Test (Most Important!)

**Steps:**
1. Launch Electron app
2. Create a new document
3. Add title: "Persistence Test"
4. Add content: "This should survive app restart"
5. Click "Save Document"
6. **Quit app completely** (Cmd+Q on Mac, Alt+F4 on Windows)
7. Relaunch app
8. **✅ Document should still be there!**

### 2. Verify File System Storage

**macOS:**
```bash
open ~/Library/Application\ Support/Mockvue/documents/
```

**Windows (PowerShell):**
```powershell
explorer $env:APPDATA\Mockvue\documents
```

**Linux:**
```bash
nautilus ~/.config/Mockvue/documents/
```

**What to Check:**
- ✅ Folder exists
- ✅ JSON files for each document
- ✅ `documents-metadata.json` file
- ✅ Files are human-readable JSON

### 3. Native Save Dialog Test

**Steps:**
1. Open any document in editor
2. Click "Export" → "Export as HTML"
3. **✅ Native save dialog should appear** (not browser download!)
4. Choose location and save
5. Open saved file
6. **✅ Should contain formatted HTML**

### 4. Search Test

**Steps:**
1. Create 3 documents with different titles:
   - "JavaScript Tutorial"
   - "Python Guide"
   - "React Tips"
2. On dashboard, search for "Java"
3. **✅ Should find "JavaScript Tutorial"**
4. Search for "Python"
5. **✅ Should find "Python Guide"**
6. Search for "nonexistent"
7. **✅ Should show "No documents found"**

### 5. Edit and Auto-Save Test

**Steps:**
1. Open existing document
2. Make changes to title and content
3. Wait 2 seconds
4. **✅ Should see "Saved [time]" at bottom**
5. Close document and reopen
6. **✅ Changes should be persisted**

## 🔍 Advanced Tests

### 6. Storage Location Verification

**Create Test Document:**
```bash
npm run electron:dev
# Create document titled "Test Location"
# Note the exact time
```

**Find the File:**
```bash
# macOS
ls -la ~/Library/Application\ Support/Mockvue/documents/

# Should see file like: 1704067200000-abc123def.json
```

**Read the File:**
```bash
# macOS
cat ~/Library/Application\ Support/Mockvue/documents/*.json

# Should see JSON like:
# {
#   "id": "...",
#   "title": "Test Location",
#   "description": "...",
#   "content": "...",
#   "tags": [],
#   "wordCount": 2,
#   "lastModified": "2024-01-01T12:00:00.000Z",
#   "createdAt": "2024-01-01T12:00:00.000Z"
# }
```

### 7. Multiple Document Test

**Steps:**
1. Create 5 documents quickly
2. All should appear in dashboard
3. Sort by "Most Recent"
4. **✅ Newest should be first**
5. Sort by "Alphabetical"
6. **✅ Should sort A-Z**
7. Quit and reopen
8. **✅ All 5 documents should be there**

### 8. Delete and Cleanup Test

**Steps:**
1. Create a document titled "To Delete"
2. Note the document count
3. Hover over document → Click menu → Delete
4. Confirm deletion
5. **✅ Document disappears immediately**
6. Check file system (see command above)
7. **✅ JSON file should be gone**
8. Quit and reopen
9. **✅ Document should not reappear**

### 9. Word Count Accuracy Test

**Steps:**
1. Create document with known word count
2. Content: "one two three four five" (5 words)
3. Save document
4. **✅ Dashboard should show "5 words"**
5. Edit to add more words
6. **✅ Word count should update**

### 10. Error Recovery Test

**Steps:**
1. Open app, note documents count
2. **While app is running**, manually delete the documents folder:
   ```bash
   # macOS
   rm -rf ~/Library/Application\ Support/Mockvue/documents/
   ```
3. Try to create a new document
4. **✅ Should recreate folder automatically**
5. **✅ Document should save successfully**
6. **✅ No app crash**

## 🎯 Expected Results

### ✅ Success Indicators

- Documents persist across app restarts
- Native dialogs appear (not browser dialogs)
- Search works instantly
- File system has readable JSON files
- Word counts are accurate
- Deletes are immediate and permanent
- Auto-save works within 2 seconds
- No console errors
- App never crashes

### ❌ Failure Indicators

- Documents disappear after restart
- Browser download prompts instead of save dialogs
- Search doesn't work or is slow
- File system is empty
- Word counts are zero or incorrect
- Deletes don't persist
- Console shows errors
- App crashes on operations

## 🐛 Common Issues

### Issue: Documents Don't Persist

**Check:**
```bash
# Verify storage location exists
# macOS:
ls ~/Library/Application\ Support/Mockvue/

# Should see:
# documents/
# documents-metadata.json
```

**Fix:**
- Ensure app has write permissions
- Check console for errors
- Try running with: `npm run electron:dev` (not production build)

### Issue: Native Dialogs Don't Appear

**Symptoms:**
- Browser download instead of save dialog
- No file picker appears

**Fix:**
- Verify `window.electronAPI` exists (check console)
- Ensure running Electron, not web version
- Rebuild: `npm run build:electron && npm run electron:dev`

### Issue: Search Returns Nothing

**Check:**
1. Create document with obvious title like "FINDME"
2. Search for "FIND"
3. Should return result

**Fix:**
- Check console for IPC errors
- Verify documents exist in file system
- Try creating new document and searching immediately

## 📊 Performance Tests

### Document Creation Speed

**Test:**
```
Create 10 documents rapidly
All should appear within 1 second each
No lag or freezing
```

**Expected:** <500ms per document

### Search Speed

**Test:**
```
Create 50 documents
Search for term appearing in 5 documents
Results should appear instantly
```

**Expected:** <200ms for search

### Load Time

**Test:**
```
Create 100 documents
Quit and restart app
```

**Expected:** Dashboard loads in <2 seconds

## 🎓 Understanding the Stack

### When You Click "Save Document"

```
1. User clicks button
   ↓
2. MyEditor.tsx: saveDocument()
   ↓
3. ElectronStorageService: updateDocument()
   ↓
4. window.electronAPI.updateDocument()
   ↓
5. [IPC] → Main Process
   ↓
6. main.ts: ipcMain.handle('update-document')
   ↓
7. DocumentStorage: updateDocument()
   ↓
8. fs.writeFileSync() → Disk
   ↓
9. metadata index updated
   ↓
10. [IPC] ← Result returned
   ↓
11. UI updates: "Saved!"
```

### File System Structure

```
~/Library/Application Support/Mockvue/
├── documents/
│   ├── 1704067200000-abc123def.json    ← Document 1
│   ├── 1704067300000-xyz789ghi.json    ← Document 2
│   └── 1704067400000-mno456pqr.json    ← Document 3
└── documents-metadata.json              ← Fast index
```

### Each Document File

```json
{
  "id": "1704067200000-abc123def",
  "title": "My Document",
  "description": "A test document",
  "content": "[{\"type\":\"paragraph\",\"content\":\"Hello world\"}]",
  "tags": ["test", "example"],
  "wordCount": 2,
  "lastModified": "2024-01-01T12:00:00.000Z",
  "createdAt": "2024-01-01T12:00:00.000Z"
}
```

## ✅ Final Checklist

Before considering Phase 3 complete:

- [ ] Documents persist across app restarts
- [ ] File system contains JSON files
- [ ] Native save dialog works
- [ ] Native open dialog works (when importing)
- [ ] Search returns correct results
- [ ] Word counts are accurate
- [ ] Delete removes files from disk
- [ ] Auto-save works
- [ ] No console errors
- [ ] No app crashes
- [ ] Performance is acceptable

## 🎉 Success!

If all tests pass, Phase 3 is working perfectly! Your Electron app now has:

✅ Real file system persistence
✅ Native desktop dialogs
✅ Professional-grade storage
✅ Robust error handling
✅ Excellent performance

## 🚀 Next: Phase 4

Once Electron is confirmed working, you can:

1. **Deploy web version** (Phase 4)
2. **Add more features** (import, batch operations)
3. **Build installers** (`npm run electron:build`)
4. **Distribute your app**!

---

**Need help?** Check:
- `PHASE_3_COMPLETE.md` for implementation details
- `electron/storage.ts` for storage code
- `electron/main.ts` for IPC handlers
- Console logs for errors

