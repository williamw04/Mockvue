# 🤖 AI Agentic System Demo - Quick Start Guide

## Overview

This branch (`agentic-langraph`) demonstrates the integration of an **agentic AI system** with the document editor using custom BlockNote blocks. The demo includes:

- ❓ **Question Blocks** - Organize questions and group related content
- 💬 **Response Blocks** - Capture answers and ideas (selectable for AI feedback)
- 📋 **Context Blocks** - Add background information
- 📝 **Notes Blocks** - Include supplementary notes

## AI Features

### 💡 Brainstorm
Generate creative ideas based on your document context. The AI reads context blocks and generates 3-6 relevant ideas to explore.

### 📝 Feedback  
Select a response block (click to highlight it with ✅) and get detailed AI feedback with:
- ✅ Strengths
- 🎯 Areas for improvement
- 💡 Suggestions

### ✍️ Draft
Create a structured draft document from your responses and context. Generates a complete document with:
- Introduction
- Key points
- Analysis  
- Conclusion

## Running the Demo

### Web Version

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 and click "Try AI Demo" button on the dashboard.

### Electron Version  

```bash
# Build electron files
npm run build:electron

# Start Electron app
npm run electron:dev
```

Access via dashboard or navigate to `/ai-document`.

## How to Use

### 1. Open the AI Document

From the dashboard, click the prominent **"Try AI Demo"** button in the purple banner at the top.

### 2. Explore Pre-loaded Content

The demo document includes:
- A sample question about learning principles
- Two response blocks with example answers
- Context with research background
- Notes with reminders
- Instructions for using AI features

### 3. Select Responses for Feedback

Click on any response block to select it (it will turn green with a ✅ checkmark). Selected responses appear in the "Responses" panel in the right sidebar.

### 4. Use AI Features

In the right sidebar, find the **"AI Studio"** panel with three buttons:

**💡 Brainstorm:**
1. Click the Brainstorm button
2. Wait 2 seconds for ideas to generate
3. Review 3-6 creative ideas
4. Click "Insert into Document" to add them

**📝 Feedback:**
1. First, select a response block by clicking it
2. Click the Feedback button
3. Wait 1.5 seconds for analysis
4. Review strengths, improvements, and suggestions
5. Click "Insert into Document" to add feedback

**✍️ Draft:**
1. Add context blocks for best results
2. Click the Draft button
3. Wait 2.5 seconds for generation
4. Review the structured draft
5. Click "Insert into Document" to add it

### 5. Create Custom Content

Use the block insertion toolbar (top right) to add:
- ❓ Question blocks
- 💬 Response blocks
- 📋 Context blocks
- 📝 Notes blocks

### 6. Save Your Work

Click the blue **"Save"** button in the top navigation bar to persist your document.

## Understanding the Demo

### Mock AI Implementation

This demo uses **mock services** that simulate AI processing:
- Pre-generated responses with randomized variations
- Realistic processing delays (1.5-2.5 seconds)
- No API keys or external services required

### Why Mock?

✅ **Easy Setup** - No configuration needed  
✅ **Demonstrates Architecture** - Shows complete integration pattern  
✅ **Fast Testing** - Consistent, predictable responses  
✅ **Ready for Real AI** - Can be swapped with actual LangGraph agents

## Architecture Highlights

### Custom BlockNote Blocks

Located in `src/blocks/schema.tsx`:
- Each block has custom styling and behavior
- Blocks support inline editing
- Visual indicators for state (selected, AI-generated)

### Service Layer

Following the app's service abstraction pattern:
- `IAgenticService` interface defines contract
- `WebAgenticService` for browser environment
- `ElectronAgenticService` for desktop app
- Accessed via `useAgentic()` hook

### UI Components

- **AIAssistantPanel** - Main AI features interface
- **ResponseSelector** - Response management and selection
- **DocumentPageWithAI** - Enhanced editor with custom blocks

## Extending to Real AI

To integrate actual LangGraph or other AI services:

1. **Install Dependencies:**
   ```bash
   npm install @langchain/core @langchain/langgraph openai
   ```

2. **Update Service Implementation:**
   Replace mock logic in `src/services/web/agentic.ts` with real API calls

3. **Add Configuration:**
   Create `.env` file with API keys:
   ```
   VITE_OPENAI_API_KEY=your_key_here
   ```

4. **Test & Deploy:**
   Test thoroughly and deploy as usual

## Troubleshooting

**Q: Custom blocks not showing?**
- Ensure you're on `/ai-document` route, not `/document`
- Check browser console for errors

**Q: AI features not responding?**
- Check that the mock services are loaded
- Verify agentic service in Services Context

**Q: Selection not working?**
- Click directly on the response block content area
- Check the "Responses" panel to see selection state

**Q: Build errors?**
- Run `npm install` to ensure dependencies are up to date
- Check that TypeScript compiles: `npx tsc --noEmit`

## Demo Video/Screenshots

### Dashboard with AI Banner
<img src="docs/dashboard-banner.png" alt="AI Demo Banner" />

### AI Document Editor
<img src="docs/ai-document.png" alt="AI Document" />

### AI Features Panel
<img src="docs/ai-panel.png" alt="AI Panel" />

## Technical Details

### Files Modified/Created

**New Files:**
- `src/blocks/schema.tsx` - Custom block definitions
- `src/services/web/agentic.ts` - Web AI service
- `src/services/electron/agentic.ts` - Electron AI service
- `src/components/AIAssistantPanel.tsx` - AI UI
- `src/components/ResponseSelector.tsx` - Response selector
- `src/components/DocumentPageWithAI.tsx` - Enhanced document page
- `AI_AGENTIC_DEMO.md` - Detailed documentation

**Modified Files:**
- `src/types.ts` - Added AI types
- `src/services/interfaces.ts` - Added IAgenticService
- `src/services/factory.ts` - Added agentic service creation
- `src/services/context.tsx` - Added useAgentic hook
- `src/services/index.ts` - Export agentic service
- `src/App.tsx` - Added `/ai-document` routes
- `src/components/Dashboard.tsx` - Added demo banner

### Block Schema Structure

```typescript
customSchema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,  // Include all standard blocks
    question: QuestionBlock,
    response: ResponseBlock,
    context: ContextBlock,
    notes: NotesBlock,
  },
});
```

### Service Interface

```typescript
interface IAgenticService {
  brainstorm(context: string, questionText?: string): Promise<string[]>;
  provideFeedback(response: string, context?: string): Promise<string>;
  generateDraft(context: string, responses?: string[]): Promise<string>;
  isAvailable(): boolean;
}
```

## Next Steps

1. **Try the Demo** - Explore all features
2. **Read Documentation** - See `AI_AGENTIC_DEMO.md` for details
3. **Experiment** - Create custom questions and responses
4. **Extend** - Add real AI when ready

## Support

For issues or questions:
1. Check browser console for errors
2. Review `AI_AGENTIC_DEMO.md` for detailed architecture
3. Examine code comments in source files

---

**Branch:** `agentic-langraph`  
**Status:** ✅ Demo Complete  
**Last Updated:** November 2025

🚀 **Enjoy exploring the future of AI-powered document editing!**

