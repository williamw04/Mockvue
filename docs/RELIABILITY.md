# Reliability Patterns

**Version**: 1.0.0  
**Last Updated**: 2026-02-14

This document describes error handling, resilience, and reliability patterns for Mockvue.

## Error Handling Strategy

### Service Layer Errors
All service methods return Promises. Errors should be caught and handled at the component level:

```typescript
async function saveDocument(data: DocumentData) {
  try {
    const doc = await documents.createDocument(data);
    notifications.showSuccess('Document saved');
    return doc;
  } catch (error) {
    console.error('Failed to save document:', error);
    notifications.showError('Failed to save document. Please try again.');
    return null;
  }
}
```

### Error Propagation Rules
1. **Service implementations** throw on failure (let errors bubble up)
2. **Components** catch and display user-friendly messages
3. **Never silently swallow errors** — always log or display
4. **Use typed errors** when possible for better handling

### Loading States
Every async operation must show a loading indicator:
- Set `loading = true` before the operation
- Set `loading = false` in a `finally` block
- Show spinner/skeleton while loading

## Auto-Save

### Pattern
Documents auto-save after a debounce period:
- **Debounce interval**: 2 seconds after last edit
- **Implementation**: `setTimeout` with cleanup on component unmount
- **Feedback**: Silent save (no interruption), error notification on failure

### Requirements
- Auto-save must not block the UI
- Failed auto-saves should retry (with backoff)
- Manual save should always be available as fallback
- Last-saved timestamp should be visible to users

## Offline Support

### Electron
- Fully offline by default (file system storage)
- No network dependency for core features
- AI features require network (graceful degradation)

### Web
- IndexedDB provides offline document storage
- Core CRUD operations work offline
- AI features require network (show appropriate messaging)

### Graceful Degradation
When a capability is unavailable:
1. Check capability before attempting
2. Show clear messaging about what's unavailable
3. Offer alternatives when possible
4. Never crash — always handle gracefully

## Platform-Specific Resilience

### Electron
- **IPC Failures**: Handle timeout and rejection from main process
- **File System Errors**: Handle permission denied, disk full, file not found
- **Process Crashes**: Electron auto-restarts renderer; main process should handle uncaught exceptions

### Web
- **IndexedDB Quota**: Handle storage quota exceeded
- **Browser Compatibility**: Feature detection before use
- **Private Browsing**: IndexedDB may be unavailable — detect and warn
- **Network Failures**: Service worker for offline support (future)

## Notification Resilience

Notifications must degrade gracefully:

```
Native Notifications (Electron)
       ↓ (if unavailable)
Web Notifications API
       ↓ (if permission denied)
In-App Toast Notifications
       ↓ (if all else fails)
Console logging (never silent)
```

## Performance Reliability

### Current SLOs
| Operation | Target | Current Status |
|-----------|--------|---------------|
| App startup | < 2s | ✅ Met |
| Document create | < 100ms | ✅ Met |
| Document search | < 200ms | ✅ Met (up to 100 docs) |
| Auto-save | < 500ms | ✅ Met |
| Page navigation | < 300ms | ✅ Met |

### Monitoring
- Performance currently measured manually
- Future: Add performance marks/measures for key operations
- Future: Automated performance regression testing

## Future Improvements

### Error Boundaries
Add React Error Boundaries around major sections:
```typescript
<ErrorBoundary fallback={<ErrorPage />}>
  <DocumentEditor />
</ErrorBoundary>
```

### Structured Logging
Replace `console.error` with structured logging:
- Log level (error, warn, info, debug)
- Context (which service, operation, user action)
- Timestamps
- Stack traces for errors

### Health Checks
For the web version with a backend:
- Service health endpoint
- Database connectivity check
- External API availability check

## References

- `ARCHITECTURE.md` — System architecture
- `docs/DESIGN.md` — Architectural patterns
- `docs/SECURITY.md` — Security patterns
- `docs/FRONTEND.md` — Frontend error handling patterns
