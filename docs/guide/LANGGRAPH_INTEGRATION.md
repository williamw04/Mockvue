# LangGraph Agentic System Integration

## Overview

This document explains how to integrate a LangGraph-based agentic system with the Mockvue application using the existing service architecture.

## Architecture

The integration follows the same service abstraction pattern used throughout the application:

```
┌─────────────────────────────────────────────────────────────┐
│                     React Application                        │
│                    (UI Components)                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  Service Abstraction Layer                   │
│  ┌──────────┬────────┬───────────┬──────────────────┐       │
│  │ Storage  │ Files  │ Notifs    │  Agent Service   │       │
│  └──────────┴────────┴───────────┴──────────────────┘       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                 ┌─────────┴──────────┐
                 ▼                    ▼
     ┌──────────────────┐   ┌──────────────────┐
     │ Web Platform     │   │ Electron Platform│
     │ - Remote API     │   │ - Local Models   │
     │ - Cloud LLMs     │   │ - Ollama         │
     └──────────────────┘   └──────────────────┘
                 │                    │
                 ▼                    ▼
     ┌──────────────────┐   ┌──────────────────┐
     │  LangGraph API   │   │  Local LangGraph │
     │  (Remote)        │   │  + Node.js       │
     └──────────────────┘   └──────────────────┘
```

## Key Components

### 1. Agent Service Interface (`src/services/interfaces.ts`)

The `IAgentService` interface defines the contract for all agent operations:

```typescript
export interface IAgentService {
  getCapabilities(): AgentCapability[];
  executeTask(feature: AgentFeatureType, input: string, context?: AgentTask['context']): Promise<AgentResponse>;
  getTaskHistory(): Promise<AgentTask[]>;
  getTask(taskId: string): Promise<AgentTask | null>;
  cancelTask(taskId: string): Promise<boolean>;
  streamTask(feature: AgentFeatureType, input: string, context?: AgentTask['context'], onChunk?: (chunk: string) => void): Promise<AgentResponse>;
}
```

### 2. Agent Types (`src/types.ts`)

Several types support the agent system:

- **`AgentFeatureType`**: Enum of available AI features (summarize, rewrite, expand, etc.)
- **`AgentTask`**: Represents a task being executed by an agent
- **`AgentCapability`**: Describes what an agent can do
- **`AgentResponse`**: Result from an agent execution

### 3. Service Implementations

#### Web Implementation (`src/services/web/agent.ts`)
- Connects to remote LangGraph API
- Supports cloud-based LLMs
- Streaming support for real-time responses
- Task history stored in memory (can be persisted to IndexedDB)

#### Electron Implementation (`src/services/electron/agent.ts`)
- Can support local models (Ollama, LLaMA.cpp)
- File system caching
- Better performance with native modules
- Offline capabilities

### 4. React Integration

The agent service is accessed through React hooks:

```typescript
import { useAgent } from '../services/context';

function MyComponent() {
  const agent = useAgent();
  
  // Execute a task
  const result = await agent.executeTask('summarize', 'Your text here');
  
  // Stream results
  await agent.streamTask(
    'expand', 
    'Your idea',
    undefined,
    (chunk) => console.log(chunk)
  );
}
```

## LangGraph Integration Pattern

### Example: Summarization Agent

Here's how you would implement a real summarization agent with LangGraph:

```typescript
import { StateGraph, END } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";

interface AgentState {
  input: string;
  context?: Record<string, any>;
  steps: string[];
  result?: string;
}

// Create a graph for the summarization agent
const summarizeGraph = new StateGraph<AgentState>({
  channels: {
    input: null,
    context: null,
    steps: null,
    result: null,
  }
});

// Define processing nodes
summarizeGraph.addNode("analyze", async (state) => {
  // Analyze the input text
  const analysis = await analyzeText(state.input);
  return { 
    ...state, 
    steps: [...state.steps, "analyzed"],
    context: { ...state.context, analysis }
  };
});

summarizeGraph.addNode("extract_key_points", async (state) => {
  // Extract key points from the analysis
  const llm = new ChatOpenAI({ temperature: 0 });
  const response = await llm.invoke([
    { role: "system", content: "Extract key points from the text." },
    { role: "user", content: state.input }
  ]);
  return { 
    ...state, 
    steps: [...state.steps, "extracted_key_points"],
    context: { ...state.context, keyPoints: response.content }
  };
});

summarizeGraph.addNode("generate_summary", async (state) => {
  // Generate final summary
  const llm = new ChatOpenAI({ temperature: 0.3 });
  const response = await llm.invoke([
    { role: "system", content: "Create a concise summary." },
    { role: "user", content: `Key points: ${state.context.keyPoints}\n\nGenerate summary:` }
  ]);
  return { 
    ...state, 
    result: response.content,
    steps: [...state.steps, "completed"]
  };
});

// Define edges
summarizeGraph.addEdge("analyze", "extract_key_points");
summarizeGraph.addEdge("extract_key_points", "generate_summary");
summarizeGraph.addEdge("generate_summary", END);
summarizeGraph.setEntryPoint("analyze");

// Compile and export
export const summarizationAgent = summarizeGraph.compile();
```

### Using the Agent in the Service

```typescript
private async runAgent(
  feature: AgentFeatureType,
  input: string,
  context?: AgentTask['context']
): Promise<string> {
  switch (feature) {
    case 'summarize':
      const result = await summarizationAgent.invoke({
        input,
        context: context || {},
        steps: []
      });
      return result.result;
    
    // ... other features
  }
}
```

## Multi-Agent Orchestration

For complex tasks, you can orchestrate multiple agents:

```typescript
// Research agent → Analysis agent → Writing agent
const researchAndWriteGraph = new StateGraph<ComplexState>({...});

researchAndWriteGraph.addNode("research", researchAgent);
researchAndWriteGraph.addNode("analyze", analysisAgent);
researchAndWriteGraph.addNode("write", writingAgent);

researchAndWriteGraph.addEdge("research", "analyze");
researchAndWriteGraph.addEdge("analyze", "write");
researchAndWriteGraph.addEdge("write", END);
```

## Document Context Integration

Agents can access document content through the storage service:

```typescript
async executeTaskWithDocument(
  feature: AgentFeatureType,
  documentId: string,
  additionalInput?: string
): Promise<AgentResponse> {
  // Get document from storage service
  const storage = new WebStorageService();
  const document = await storage.getDocument(documentId);
  
  if (!document) {
    throw new Error('Document not found');
  }
  
  // Pass document content to agent
  return this.executeTask(
    feature,
    additionalInput || document.content || '',
    {
      documentId: document.id,
      additionalInstructions: `Document title: ${document.title}. Tags: ${document.tags.join(', ')}`
    }
  );
}
```

## Streaming Support

LangGraph supports streaming, which can be integrated:

```typescript
async streamTask(
  feature: AgentFeatureType,
  input: string,
  context?: AgentTask['context'],
  onChunk?: (chunk: string) => void
): Promise<AgentResponse> {
  const graph = this.getGraphForFeature(feature);
  
  // Stream the execution
  for await (const event of graph.stream({
    input,
    context: context || {},
    steps: []
  })) {
    // Send chunks to UI
    if (onChunk && event.result) {
      onChunk(event.result);
    }
  }
  
  return {
    taskId: this.generateTaskId(),
    result: finalResult
  };
}
```

## Configuration

### API Keys and Endpoints

Store configuration securely:

```typescript
// For web: Use localStorage or secure storage
localStorage.setItem('langgraph_api_key', 'your-api-key');
localStorage.setItem('langgraph_endpoint', 'https://api.your-langgraph-service.com');

// For Electron: Use electron-store or keytar for secure storage
import Store from 'electron-store';
const store = new Store({ encryptionKey: 'your-encryption-key' });
store.set('langgraph_api_key', 'your-api-key');
```

### Environment Variables

For local development:

```bash
# .env.local
VITE_LANGGRAPH_API_KEY=your-api-key
VITE_LANGGRAPH_ENDPOINT=https://api.your-service.com
```

## Installation

### Required Dependencies

For a full LangGraph integration, install these packages:

```bash
npm install @langchain/langgraph @langchain/core @langchain/openai
```

For local models with Ollama:

```bash
npm install @langchain/community
```

### Optional Dependencies

```bash
# For advanced features
npm install langsmith          # LangSmith tracing
npm install zod               # Schema validation
npm install @langchain/anthropic  # Claude support
```

## Usage Examples

### Basic Task Execution

```typescript
import { useAgent } from '../services/context';

function MyComponent() {
  const agent = useAgent();
  
  const handleSummarize = async (text: string) => {
    const response = await agent.executeTask('summarize', text);
    console.log(response.result);
  };
}
```

### With Context

```typescript
const handleRewrite = async (text: string) => {
  const response = await agent.executeTask('rewrite', text, {
    tone: 'professional',
    additionalInstructions: 'Make it concise'
  });
  console.log(response.result);
};
```

### Streaming

```typescript
const [streamedText, setStreamedText] = useState('');

const handleStreamingSummarize = async (text: string) => {
  await agent.streamTask(
    'summarize',
    text,
    undefined,
    (chunk) => setStreamedText(prev => prev + chunk)
  );
};
```

### With Document Context

```typescript
const handleAnalyzeDocument = async (docId: string) => {
  const response = await agent.executeTask('analyze', '', {
    documentId: docId,
    additionalInstructions: 'Focus on key themes'
  });
  console.log(response.result);
};
```

## Best Practices

### 1. Error Handling

Always handle errors gracefully:

```typescript
try {
  const response = await agent.executeTask('summarize', input);
  // Process response
} catch (error) {
  if (error.message.includes('rate limit')) {
    // Handle rate limiting
  } else if (error.message.includes('authentication')) {
    // Handle auth errors
  }
  // Show user-friendly error
}
```

### 2. Task Cancellation

Support cancelling long-running tasks:

```typescript
const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);

const handleCancel = async () => {
  if (currentTaskId) {
    await agent.cancelTask(currentTaskId);
  }
};
```

### 3. Caching

Cache frequent requests:

```typescript
const cache = new Map<string, AgentResponse>();

async executeWithCache(feature: AgentFeatureType, input: string) {
  const cacheKey = `${feature}-${input}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const response = await this.executeTask(feature, input);
  cache.set(cacheKey, response);
  return response;
}
```

### 4. Progress Tracking

For long tasks, provide progress updates:

```typescript
const [progress, setProgress] = useState(0);

await agent.streamTask(
  'complex_analysis',
  input,
  undefined,
  (chunk) => {
    setProgress(prev => Math.min(prev + 5, 95));
    handleChunk(chunk);
  }
);
setProgress(100);
```

## Platform-Specific Features

### Electron: Local Models

```typescript
// Enable local Ollama model
const agent = new ElectronAgentService();
await agent.useLocalModel('llama2');

// Now tasks will use local model
const result = await agent.executeTask('summarize', text);
```

### Web: Cloud Integration

```typescript
// Configure cloud API
const agent = new WebAgentService(
  process.env.VITE_LANGGRAPH_API_KEY,
  'https://api.your-service.com'
);
```

## Testing

### Mock Agent Service

```typescript
class MockAgentService implements IAgentService {
  async executeTask(feature: AgentFeatureType, input: string) {
    return {
      taskId: 'mock-task-id',
      result: `Mock result for ${feature}: ${input.substring(0, 50)}...`
    };
  }
  // ... implement other methods
}

// Use in tests
<ServicesProvider services={{ agent: new MockAgentService(), ... }}>
  <MyComponent />
</ServicesProvider>
```

## Debugging

### Enable LangSmith Tracing

```typescript
import { LangSmith } from "langsmith";

// Initialize tracing
const client = new LangSmith({
  apiKey: process.env.LANGSMITH_API_KEY,
});

// Wrap agent execution
await client.trace(
  "summarization_task",
  async () => await agent.executeTask('summarize', input)
);
```

### Log Task History

```typescript
// View all tasks
const history = await agent.getTaskHistory();
console.table(history.map(t => ({
  id: t.id,
  feature: t.feature,
  status: t.status,
  duration: new Date(t.completedAt!) - new Date(t.createdAt)
})));
```

## Security Considerations

1. **API Keys**: Never commit API keys to version control
2. **Input Validation**: Validate user input before sending to agents
3. **Rate Limiting**: Implement rate limiting for API calls
4. **Content Filtering**: Filter sensitive information before processing
5. **Secure Storage**: Use secure storage for API keys (keytar in Electron)

## Performance Optimization

1. **Parallel Execution**: Run independent tasks in parallel
2. **Caching**: Cache frequent requests
3. **Lazy Loading**: Load agents only when needed
4. **Streaming**: Use streaming for long responses
5. **Local Models**: Use local models for Electron to avoid API latency

## Future Enhancements

- [ ] Multi-agent collaboration
- [ ] Custom agent training/fine-tuning
- [ ] Agent memory/context persistence
- [ ] Integration with vector databases
- [ ] Real-time collaborative editing with AI
- [ ] Agent marketplace/plugins

## Resources

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [LangChain Documentation](https://python.langchain.com/)
- [Ollama Documentation](https://ollama.ai/)
- [LangSmith Documentation](https://docs.smith.langchain.com/)

## Demo

To see the integration in action:

1. Start the application: `npm run dev`
2. Navigate to the AI Assistant page (click the banner on the dashboard)
3. Try different AI features
4. View task history

The demo uses simulated responses. To connect to real LangGraph:

1. Install dependencies: `npm install @langchain/langgraph @langchain/core @langchain/openai`
2. Set your API key: Create `.env.local` with `VITE_OPENAI_API_KEY=your-key`
3. Update `src/services/web/agent.ts` to use real LangGraph graphs (see examples above)
4. Restart the application

---

**Questions?** Check the [ARCHITECTURE.md](./ARCHITECTURE.md) for general service patterns.

