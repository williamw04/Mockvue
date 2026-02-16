# AI Agentic System Demo

## Overview

This branch (`agentic-langgraph-demo`) demonstrates how to integrate a LangGraph-based agentic system with the Mockvue application.

## What's New

### 1. Agent Service Interface
A new `IAgentService` interface that follows the same abstraction pattern as other services in the application.

### 2. Agent Implementation
- **Electron**: `src/services/electron/agent.ts` - Can support local models (Ollama)

### 3. AI Assistant UI
A beautiful demo UI at `/ai-assistant` that showcases:
- 7 different AI features (summarize, rewrite, expand, translate, brainstorm, outline, custom)
- Streaming support for real-time responses
- Task history tracking
- Context-aware operations

### 4. Service Integration
The agent service is fully integrated into the existing service architecture:
- Accessed via `useAgent()` hook
- Works on Electron platform
- Can interact with document storage service

## Quick Start

### 1. View the Demo

```bash
# Start the development server
npm run electron:dev

# Open http://localhost:5173
# Click on the "AI Assistant Demo" banner on the dashboard
```

### 2. Try the Features

- **Summarize**: Create concise summaries
- **Rewrite**: Change tone and style
- **Expand**: Add more detail and depth
- **Translate**: Convert to other languages
- **Brainstorm**: Generate creative ideas
- **Outline**: Create structured outlines
- **Custom**: Execute custom AI tasks

### 3. Toggle Streaming

Enable "Stream response" to see real-time text generation simulation.

## Current State

The demo currently uses **simulated responses** to demonstrate the architecture without requiring API keys. The responses show what the system would return from real agents.

## Adding Real LangGraph Integration

To connect to actual LangGraph agents:

### Step 1: Install Dependencies

```bash
npm install @langchain/langgraph @langchain/core @langchain/openai
```

### Step 2: Set API Key

Create `.env.local`:

```bash
VITE_OPENAI_API_KEY=your-openai-api-key
VITE_LANGGRAPH_ENDPOINT=https://your-api-endpoint.com  # Optional
```

### Step 3: Update Implementation

Edit `src/services/electron/agent.ts` and replace the `runAgent` method with real LangGraph implementations. See `LANGGRAPH_INTEGRATION.md` for detailed examples.

Example for summarization:

```typescript
import { StateGraph, END } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";

private async runAgent(feature: AgentFeatureType, input: string, context?: any): Promise<string> {
  if (feature === 'summarize') {
    const graph = new StateGraph({...});
    // Define nodes and edges (see LANGGRAPH_INTEGRATION.md)
    const result = await graph.invoke({ input });
    return result.result;
  }
  // ... other features
}
```

## Architecture Benefits

### ✅ Electron Optimized
Works seamlessly on Electron.

### ✅ Type Safe
Full TypeScript support with interfaces ensuring consistency.

### ✅ Testable
Easy to mock for testing without actual API calls.

### ✅ Extensible
Add new AI features by simply adding to the `AgentFeatureType` enum.

### ✅ Document Integration
Agents can access document content through the storage service for context-aware operations.

## File Structure

```
src/
├── types.ts                          # Added AgentTask, AgentCapability, etc.
├── services/
│   ├── interfaces.ts                 # Added IAgentService
│   ├── factory.ts                    # Updated to include agent service
│   ├── context.tsx                   # Added useAgent() hook
│   ├── electron/
│       ├── agent.ts                 # Electron implementation (NEW)
│       └── index.ts                 # Updated exports
├── components/
│   ├── AIAssistant.tsx              # Demo UI component (NEW)
│   └── Dashboard.tsx                # Added banner linking to demo
└── App.tsx                          # Added /ai-assistant route

Documentation:
├── LANGGRAPH_INTEGRATION.md         # Comprehensive integration guide
└── AGENTIC_DEMO_README.md          # This file
```

## Key Concepts

### Agent Features
Each "feature" represents a different type of AI task. In production, each feature would be powered by a different LangGraph state graph.

### Task Tracking
All tasks are tracked with:
- Unique ID
- Status (pending, running, completed, failed)
- Input/output
- Timestamps
- Metadata (tokens used, processing time)

### Streaming
The service supports streaming for real-time responses:

```typescript
const agent = useAgent();
await agent.streamTask(
  'summarize',
  input,
  undefined,
  (chunk) => console.log(chunk)  // Called for each chunk
);
```

### Context Passing
Context can be passed to agents:

```typescript
await agent.executeTask('rewrite', text, {
  tone: 'professional',
  documentId: 'doc-123',
  additionalInstructions: 'Make it concise'
});
```

## Demo Features

### 🎨 Beautiful UI
- Modern, responsive design
- Smooth animations and transitions
- Clear visual feedback
- Professional color scheme

### 🔄 Real-time Streaming
- Simulated streaming to show UX
- Can be connected to actual streaming APIs
- Shows processing state

### 📜 Task History
- View all previous tasks
- Filter by status
- See timestamps and results

### ⚙️ Contextual Options
- Different options per feature type
- Tone selection for rewriting
- Language selection for translation
- Custom instructions field

### 📊 Architecture Overview
Built-in documentation showing how the system works.

## Use Cases

### 1. Document Enhancement
Use AI to improve existing documents:
```typescript
const doc = await storage.getDocument(docId);
const improved = await agent.executeTask('rewrite', doc.content, {
  tone: 'professional',
  documentId: docId
});
```

### 2. Research Assistant
Generate outlines and summaries:
```typescript
const outline = await agent.executeTask('outline', researchNotes);
const summary = await agent.executeTask('summarize', longArticle);
```

### 3. Content Generation
Expand ideas into full content:
```typescript
const ideas = 'AI in healthcare';
const expanded = await agent.executeTask('expand', ideas);
```

### 4. Translation
Translate documents to other languages:
```typescript
const translated = await agent.executeTask('translate', content, {
  targetLanguage: 'Spanish'
});
```

## Platform-Specific Features

### Electron Platform
- Support for local models (Ollama, LLaMA.cpp)
- Offline capabilities
- Better privacy and security
- File system caching
- Faster for frequently used operations

## Testing

### Manual Testing
1. Start the app: `npm run electron:dev`
2. Click the AI Assistant banner
3. Try each feature type
4. Test with different inputs
5. Toggle streaming on/off
6. View task history

### Unit Testing
Mock the agent service for testing:

```typescript
const mockAgent = {
  executeTask: jest.fn().mockResolvedValue({
    taskId: 'test-id',
    result: 'mock result'
  }),
  // ... other methods
};

<ServicesProvider services={{ agent: mockAgent, ... }}>
  <YourComponent />
</ServicesProvider>
```

## Next Steps

1. **Add Real Implementation**: Connect to actual LangGraph agents
2. **Add More Features**: Implement additional AI capabilities
3. **Integrate with Documents**: Allow AI operations directly from document editor
4. **Add Persistence**: Save task history to storage
5. **Add Rate Limiting**: Prevent API abuse
6. **Add Cost Tracking**: Monitor token usage and costs
7. **Add Agent Memory**: Allow agents to remember context across tasks

## Resources

- **Main Documentation**: See `LANGGRAPH_INTEGRATION.md` for comprehensive guide
- **Architecture**: See `ARCHITECTURE.md` for overall system design
- **LangGraph Docs**: https://langchain-ai.github.io/langgraph/
- **LangChain Docs**: https://python.langchain.com/

## Questions?

This demo shows the **architectural pattern** for integrating agentic systems. The actual AI functionality would be implemented by replacing the simulated responses with real LangGraph state graphs that call LLMs.

The beauty of this architecture is that:
1. Components don't need to know if they're using real or simulated agents
2. You can swap implementations without changing UI code
3. Easy to test and maintain

---

**Happy Building! 🚀**

