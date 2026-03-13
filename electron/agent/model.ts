export class AgentModelClient {
  async completeTurn(_systemPrompt: string, _message: string): Promise<string> {
    return 'Assistant runtime scaffold active. Grounded response generation is not implemented yet.';
  }
}
