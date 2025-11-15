# Debug Steps for White Screen Issue

## Quick Checks:

1. **Is dev server running?**
   ```bash
   npm run dev
   ```
   Should see: `Local: http://localhost:5173/`

2. **Open browser console** (F12 → Console tab)
   - Look for RED errors
   - Common errors:
     - "Cannot read property of undefined"
     - "Module not found"
     - "Unexpected token"

3. **Try regular dashboard first**
   - Navigate to: `http://localhost:5173/`
   - Does it load? If YES → issue is specific to AI document
   - If NO → general app issue

4. **Browser cache**
   - Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
   - Or: Clear browser cache

5. **Check terminal for errors**
   - Look in terminal where `npm run dev` is running
   - Any compilation errors?

## Please share:
1. What URL are you accessing? (`http://localhost:5173/` or `http://localhost:5173/ai-document`)
2. Any red errors in browser console?
3. Any errors in terminal where dev server is running?

