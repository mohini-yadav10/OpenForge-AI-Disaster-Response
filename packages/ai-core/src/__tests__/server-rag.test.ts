import { describe, it, expect, beforeAll } from 'vitest';
import { 
  LocalEmbeddingProvider,
  InMemoryVectorStore,
  BasicTextChunker,
  StandardRetriever,
  Document
} from '../rag';

describe('RAG Real Embedding Verification', () => {
  let embedder: LocalEmbeddingProvider;
  let vectorStore: InMemoryVectorStore;
  let chunker: BasicTextChunker;
  let retriever: StandardRetriever;

  beforeAll(async () => {
    embedder = new LocalEmbeddingProvider('Xenova/all-MiniLM-L6-v2');
    vectorStore = new InMemoryVectorStore();
    chunker = new BasicTextChunker(100, 20);
    retriever = new StandardRetriever(vectorStore, embedder);
  });

  it('verifies semantic retrieval selects the correct chunk based on documents', async () => {
    const docA: Document = {
      id: 'docA',
      title: 'Doc A',
      content: 'OpenForge uses an AgentRuntime. This orchestration layer manages tasks and state transitions.'
    };
    
    const docB: Document = {
      id: 'docB',
      title: 'Doc B',
      content: 'OpenForge uses a SkillRegistry. This allows registering capabilities and parsing markdown skill files.'
    };

    // Simulate Document Upload logic from backend
    const chunksA = chunker.chunk(docA);
    const vectorsA = await embedder.embedBatch(chunksA.map(c => c.text));
    chunksA.forEach((c, i) => c.vector = vectorsA[i]);
    await vectorStore.addChunks(chunksA);

    const chunksB = chunker.chunk(docB);
    const vectorsB = await embedder.embedBatch(chunksB.map(c => c.text));
    chunksB.forEach((c, i) => c.vector = vectorsB[i]);
    await vectorStore.addChunks(chunksB);

    // Ask questions targeting each document
    const resultsA = await retriever.retrieve('What handles tasks and orchestrations?', 1);
    expect(resultsA.length).toBe(1);
    expect(resultsA[0].documentId).toBe('docA');

    const resultsB = await retriever.retrieve('How are markdown capabilities registered?', 1);
    expect(resultsB.length).toBe(1);
    expect(resultsB[0].documentId).toBe('docB');
    
  }, 300000); // 5 minutes timeout since models take a bit on first load
});
