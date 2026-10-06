const fs = require('fs');
const path = require('path');
// Actually, I can use a simple node script using built-in fetch and build a multipart/form-data body manually for the document upload, or just use curl in a bash script.

// Let's write this as an async function in Node using native fetch.
async function runE2E() {
  const BASE_URL = 'http://localhost:3001/api';

  console.log("=== PHASE 2: API E2E GET ===\n");
  
  // Tools
  const toolsRes = await fetch(`${BASE_URL}/tools`);
  const toolsData = await toolsRes.json();
  console.log("TOOLS:", toolsData);

  // Skills
  const skillsRes = await fetch(`${BASE_URL}/skills`);
  const skillsData = await skillsRes.json();
  console.log("SKILLS:", skillsData);

  console.log("\n=== PHASE 3: CRITICAL END-TO-END PIPELINE ===\n");
  
  // Chat - Calculator
  const chatRes1 = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: "Calculate 245 multiplied by 18" })
  });
  const chatData1 = await chatRes1.json();
  console.log("CHAT RESPONSE (Calculation):", JSON.stringify(chatData1, null, 2));

  console.log("\n=== PHASE 4: KNOWLEDGE PIPELINE ===\n");

  // Create test document
  const testFilePath = path.join(__dirname, 'test-doc.txt');
  fs.writeFileSync(testFilePath, "This project is called OpenForge AI. It is a modular open-source AI agent harness.");

  // Node 18+ fetch FormData workaround for file uploads:
  const blob = new Blob([fs.readFileSync(testFilePath)], { type: 'text/plain' });
  const form = new FormData();
  form.append('file', blob, 'test-doc.txt');

  const uploadRes = await fetch(`${BASE_URL}/documents/upload`, {
    method: 'POST',
    body: form
  });
  const uploadData = await uploadRes.json();
  console.log("UPLOAD RESPONSE:", uploadData);

  const chatRes2 = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: "What is this project called?" })
  });
  const chatData2 = await chatRes2.json();
  console.log("CHAT RESPONSE (Knowledge):", JSON.stringify(chatData2, null, 2));

  console.log("\n=== EVALUATIONS AND TRACES ===\n");

  // Evaluations
  const evalRes = await fetch(`${BASE_URL}/evaluations/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cases: [
        { id: '1', input: 'Calculate 5 + 5', expectedTools: ['calculator'] }
      ]
    })
  });
  const evalData = await evalRes.json();
  console.log("EVALUATION RESPONSE:", JSON.stringify(evalData, null, 2));

  // Traces
  const traceRes = await fetch(`${BASE_URL}/traces`);
  const traceData = await traceRes.json();
  console.log(`TOTAL TRACES STORED: ${traceData.traces ? traceData.traces.length : 0}`);
  
  if (traceData.traces && traceData.traces.length > 0) {
     console.log("TRACE 1 EVENTS:", traceData.traces[0].events.map(e => e.type));
  }
}

runE2E().catch(console.error);
