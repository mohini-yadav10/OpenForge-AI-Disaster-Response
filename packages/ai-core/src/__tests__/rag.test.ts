import { describe, it, expect } from 'vitest';
import { 
  BasicTextChunker, 
  MockEmbeddingProvider, 
  InMemoryVectorStore, 
  StandardRetriever, 
  StandardContextBuilder,
  LocalEmbeddingProvider
} from '../rag';

describe('RAG Pipeline', () => {
  it('chunks, embeds, stores, and retrieves context', async () => {
    const document = {
      id: 'doc_1',
      title: 'Hackathon Guide',
      content: 'This is a guide for the OpenForge AI hackathon. It explains RAG and Agents.',
      metadata: { title: 'Hackathon Guide' }
    };

    const chunker = new BasicTextChunker(5, 2);
    const chunks = chunker.chunk(document);
    
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].documentId).toBe('doc_1');

    const embedder = new MockEmbeddingProvider();
    const vectorStore = new InMemoryVectorStore();
    
    // Simulate embedding attachment
    for (const chunk of chunks) {
      chunk.vector = await embedder.embedText(chunk.text);
    }
    await vectorStore.addChunks(chunks);

    const retriever = new StandardRetriever(vectorStore, embedder);
    const retrievedChunks = await retriever.retrieve('What is OpenForge?', 2);
    
    expect(retrievedChunks.length).toBeLessThanOrEqual(2);

    const builder = new StandardContextBuilder();
    const contextStr = builder.buildContext(retrievedChunks);
    
    expect(contextStr).toContain('[Source: Hackathon Guide]');
  });
  
  it('instantiates LocalEmbeddingProvider and handles realistic tests', async () => {
    // We will do a full realistic test of LocalEmbeddingProvider
    const provider = new LocalEmbeddingProvider('Xenova/all-MiniLM-L6-v2');
    expect(provider.name).toBe('LocalEmbedding');
    
    // Non-empty vector
    const vec1 = await provider.embedText('Hello world');
    expect(vec1.length).toBeGreaterThan(0);
    expect(typeof vec1[0]).toBe('number');

    // Consistent dimensions
    const vec2 = await provider.embedText('Another string');
    expect(vec1.length).toBe(vec2.length);
    expect(provider.dimensions).toBe(vec1.length);
    
    // Deterministic (repeated input)
    const vec3 = await provider.embedText('Hello world');
    for (let i = 0; i < vec1.length; i++) {
      expect(vec1[i]).toBeCloseTo(vec3[i], 5);
    }

    // Different inputs produce different embeddings
    let isDifferent = false;
    for (let i = 0; i < vec1.length; i++) {
      if (Math.abs(vec1[i] - vec2[i]) > 0.0001) {
        isDifferent = true;
        break;
      }
    }
    expect(isDifferent).toBe(true);

    // Batch embedding test
    const batch = await provider.embedBatch(['Hello world', 'Another string']);
    expect(batch.length).toBe(2);
    expect(batch[0].length).toBe(provider.dimensions);
    expect(batch[1].length).toBe(provider.dimensions);
    
    // Verify batch values roughly match single values
    for (let i = 0; i < vec1.length; i++) {
      expect(batch[0][i]).toBeCloseTo(vec1[i], 4);
      expect(batch[1][i]).toBeCloseTo(vec2[i], 4);
    }
    
    // Log metadata
    console.log(`[Embedding Metadata] Model: Xenova/all-MiniLM-L6-v2, Dimensions: ${provider.dimensions}, Provider: LocalEmbedding`);
  }, 300000); // 5 minutes timeout for model downloading
});
