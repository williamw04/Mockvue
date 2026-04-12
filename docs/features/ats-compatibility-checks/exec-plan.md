# Execution Plan: ATS Compatibility Checks

**Created**: 2026-03-10  
**Status**: In Progress  
**Target**: Resume Analyzer Enhancement

## Objective

Implement ATS (Applicant Tracking System) formatting compatibility checks for the resume analyzer. This feature will analyze uploaded PDF resumes for 5 key formatting criteria that determine whether the document will pass automated screening.

## Scope

### In Scope
1. Single-Column Layout Detection
2. Standard Font Verification  
3. Standardized Headings Detection
4. Graphics/Tables Exclusion Check
5. Reverse Chronological Order Verification

### Out of Scope
- DOC/DOCX file support (PDF only)
- Dark mode ATS results (light mode only per project conventions)

---

## Implementation Steps

### Step 1: Add pdf-lib Dependency
- Install `pdf-lib` package for PDF analysis
- Add type definitions `@types/pdf-lib`

**Files**: `package.json`

### Step 2: Implement ATS Analysis Function
Create `analyzeAtsCompatibility()` function in `electron/parser.ts` that:
- Loads PDF via pdf-lib
- Extracts font names from embedded fonts
- Analyzes text positions to detect columns
- Extracts text to check for standardized headings
- Detects image/table objects in PDF
- Parses dates from text for chronological order

**Files**: `electron/parser.ts`

**Algorithm Details**:
```
Single-Column Check:
- Extract all text positions (x, y coordinates)
- Group text by similar x-positions (within 50px tolerance)
- If >3 distinct x-position groups exist, likely multi-column
- Score: Pass (20), Warning (10), Fail (0)

Standard Font Check:
- Get all embedded font names from PDF
- Allowlist: Arial, Calibri, Times New Roman, Garamond, sans-serif, serif
- Score: Pass (20) if all fonts in allowlist, Warning (10) if unknown fonts found, Fail (0) if clearly non-standard

Standardized Headings Check:
- Extract raw text from PDF
- Check for regex patterns: /professional experience|work experience|employment/i
- Check for: /education|academic/i
- Check for: /skills|technical skills|competencies/i
- Score: All 3 found = Pass (20), 2 found = Warning (10), <2 = Fail (0)

Graphics/Tables Check:
- Count image objects in PDF pages
- Check for table-like text structures (multiple aligned columns with data)
- Score: No graphics = Pass (20), Minor graphics = Warning (10), Significant = Fail (0)

Reverse Chronology Check:
- Extract dates from text using regex /(\d{4}|present)/i
- Look for date patterns near work experience sections
- Verify dates are in descending order
- Score: Proper order = Pass (20), Mixed = Warning (10), Reverse = Fail (0)

Overall Score = Sum of all 5 checks (max 100)
```

### Step 3: Add TypeScript Types
Add `ATSAnalysisResult` type to `src/types.ts`

**Files**: `src/types.ts`

### Step 4: Update Service Interface
Add `analyzeAtsCompatibility()` method to `IAgentService` in `src/services/interfaces.ts`

**Files**: `src/services/interfaces.ts`

### Step 5: Add IPC Handler
Add handler in `electron/main.ts` for `resume:analyze-ats` IPC message

**Files**: `electron/main.ts`

### Step 6: Service Implementation
Add implementation in `src/services/electron/agent.ts`

**Files**: `src/services/electron/agent.ts`

### Step 7: Add Preload API
Add `analyzeAtsCompatibility` to electron preload API

**Files**: `electron/preload.ts`, `src/electron.d.ts`

### Step 8: UI Integration
Find or create Resume Review component and add:
- ATS Compatibility Score display
- Individual check results with pass/fail/warning icons
- Recommendations for failed checks

**Files**: To be determined (likely existing ResumeReviewPage or ProfilePage)

---

## Dependencies

- **Direct**: pdf-lib for PDF analysis
- **Indirect**: Existing resume parsing infrastructure (pdf-parse)

---

## Testing Strategy

1. **Unit Tests**: Test each ATS check function with sample PDFs
2. **Integration Test**: Test full flow from UI through IPC to parser
3. **Manual Testing**: Test with various PDF formats (single/multi-column, different fonts)

---

## Acceptance Criteria

- [ ] pdf-lib dependency added
- [ ] ATS analysis function returns correct scores for each check
- [ ] Overall ATS score displayed in Resume Review
- [ ] Individual check results shown with pass/fail/warning status
- [ ] Recommendations provided for failed checks
- [ ] Works with existing resume PDF uploads
- [ ] Lint passes with zero warnings
- [ ] TypeScript compiles without errors

---

## Notes

- Using pdf-lib for direct PDF analysis (more accurate than AI-based)
- Results displayed in Resume Review flow per user request
- Light-mode only per project conventions (FRONTEND.md)
