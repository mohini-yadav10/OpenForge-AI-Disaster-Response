import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, Wrench, Send, CheckCircle, Activity, Cpu, Play } from 'lucide-react';

export default function AgentWorkspace() {
  const [activeTab, setActiveTab] = useState<'chat' | 'trace' | 'tools' | 'evals'>('chat');
  
  // Data States
  const [blocks, setBlocks] = useState<any[]>([{ id: 'sys', role: 'system', content: 'OpenForge Demo Assistant ready.', toolExecutions: [], timestamp: new Date() }]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tools, setTools] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [traces, setTraces] = useState<any[]>([]);
  const [evalResult, setEvalResult] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    try {
      const [tRes, sRes, trRes] = await Promise.all([
        fetch('http://localhost:3001/api/tools'),
        fetch('http://localhost:3001/api/skills'),
        fetch('http://localhost:3001/api/traces')
      ]);
      const t = await tRes.json();
      const s = await sRes.json();
      const tr = await trRes.json();
      setTools(t.tools || []);
      setSkills(s.skills || []);
      setTraces(tr.traces || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [blocks]);

  const runEvaluation = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/evaluations/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cases: [
            { id: '1', input: 'What is 245 * 18?', expectedTools: ['calculator'] },
            { id: '2', input: 'Analyze this report', expectedSkills: ['Document Analysis'] }
          ]
        })
      });
      const data = await res.json();
      setEvalResult(data);
    } catch (e) {
      console.error(e);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const text = input;
    setInput('');
    setBlocks(p => [...p, { id: Date.now(), role: 'user', content: text, toolExecutions: [] }]);
    setIsGenerating(true);
    try {
      const res = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      const outputText = data.response;
      const simulatedExecs = data.toolsUsed ? data.toolsUsed.map((t: string) => ({ tool: t, status: 'completed' })) : [];
      setBlocks(p => [...p, { id: Date.now()+1, role: 'agent', content: outputText || 'No response generated.', toolExecutions: simulatedExecs }]);
    } catch (e) {
      console.error(e);
      setBlocks(p => [...p, { id: Date.now()+1, role: 'agent', content: 'Error connecting to server.', toolExecutions: [] }]);
    }
    setIsGenerating(false);
    fetchData();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800 font-sans" data-testid="agent-workspace">
      {/* Top Nav */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 md:px-8 py-6 bg-white border-b border-slate-200">
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2 tracking-tight">
          <Bot className="text-red-500" size={28}/> OpenForge Agent Harness
        </h1>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setActiveTab('chat')} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'chat' ? 'bg-red-50 text-red-600 border border-red-200 shadow-sm' : 'bg-slate-50 text-slate-500 border border-slate-200 hover:text-slate-800'}`}>Agent Workspace</button>
          <button onClick={() => setActiveTab('trace')} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'trace' ? 'bg-red-50 text-red-600 border border-red-200 shadow-sm' : 'bg-slate-50 text-slate-500 border border-slate-200 hover:text-slate-800'}`}>Execution Traces</button>
          <button onClick={() => setActiveTab('tools')} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'tools' ? 'bg-red-50 text-red-600 border border-red-200 shadow-sm' : 'bg-slate-50 text-slate-500 border border-slate-200 hover:text-slate-800'}`}>Skills & Tools</button>
          <button onClick={() => setActiveTab('evals')} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'evals' ? 'bg-red-50 text-red-600 border border-red-200 shadow-sm' : 'bg-slate-50 text-slate-500 border border-slate-200 hover:text-slate-800'}`}>Evaluation Engine</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8">
        {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto flex flex-col h-full bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {blocks.map((b, idx) => (
                <div key={idx} className={`flex gap-4 ${b.role === 'user' ? 'justify-end' : b.role === 'system' ? 'justify-center' : 'justify-start'}`}>
                  {b.role === 'agent' && (
                    <div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center shrink-0 mt-1 shadow-sm text-red-500"><Bot size={20} /></div>
                  )}
                  <div className={`max-w-[85%] ${b.role === 'user' ? 'order-1' : 'order-2'}`}>
                    {b.role === 'system' ? (
                       <div className="px-4 py-2 bg-slate-50 border border-slate-100 text-slate-400 rounded-xl text-[10px] uppercase tracking-widest font-bold inline-block shadow-sm">{b.content}</div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {b.toolExecutions?.map((tool: any, i: number) => (
                          <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col gap-1 max-w-sm text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-slate-600 uppercase tracking-widest">
                               <Wrench size={14} className="text-slate-400"/> {tool.tool} Tool
                            </div>
                            {tool.status === 'completed' && <div className="text-green-600 font-bold flex items-center gap-1"><CheckCircle size={12}/> COMPLETED</div>}
                          </div>
                        ))}
                        {b.content && (
                          <div className={`px-5 py-4 rounded-3xl ${b.role === 'user' ? 'bg-slate-800 text-white rounded-tr-sm shadow-md' : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'}`}>
                             <div className={`prose prose-sm max-w-none ${b.role === 'user' ? 'prose-invert font-medium' : 'font-medium'}`}>
                               <ReactMarkdown remarkPlugins={[remarkGfm]}>{b.content}</ReactMarkdown>
                             </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 md:p-6 border-t border-slate-100 bg-white">
              <div className="flex gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:border-red-300 focus-within:ring-2 focus-within:ring-red-100 transition-all shadow-inner">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} className="flex-1 px-4 py-3 bg-transparent outline-none font-medium text-slate-800 placeholder-slate-400" placeholder="Type a message to the agent..." />
                <button onClick={sendMessage} disabled={isGenerating} className="px-6 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:bg-slate-300 disabled:text-slate-500 font-bold uppercase tracking-widest text-xs transition-colors flex items-center gap-2 shadow-sm">
                  <Send size={16} /> {isGenerating ? 'RUNNING' : 'SEND'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trace' && (
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-800 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"><Activity className="text-blue-500" size={28}/> Execution Traces</h2>
            {traces.length === 0 && <div className="text-center p-12 text-slate-400 bg-white border border-slate-200 rounded-3xl font-medium shadow-sm">No traces available. Run a task in the chat first.</div>}
            <div className="space-y-6">
              {traces.map((t, i) => (
                <div key={i} className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
                  <div className="font-mono text-xs font-bold text-slate-400 mb-6 pb-4 border-b border-slate-100 uppercase tracking-widest">Task ID: {t.taskId}</div>
                  <div className="space-y-3">
                    {t.events?.map((e: any, j: number) => (
                      <div key={j} className="text-sm p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-lg text-[10px] uppercase tracking-widest font-black border ${e.status === 'success' ? 'bg-green-50 text-green-700 border-green-200' : e.status === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                            {e.status}
                          </span>
                          <span className="font-bold text-slate-700">{e.type}</span>
                        </div>
                        <div className="font-mono text-xs text-slate-500 bg-white p-2 rounded-xl border border-slate-200 overflow-x-auto max-w-lg shadow-inner">
                          {JSON.stringify(e.metadata || {})}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-slate-800 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"><Cpu className="text-blue-500" size={24}/> Skill Registry</h2>
              <div className="space-y-4">
                {skills.length === 0 && <div className="p-6 bg-white border border-slate-200 rounded-3xl text-slate-400 font-medium text-center shadow-sm">No skills loaded.</div>}
                {skills.map((s, i) => (
                  <div key={i} className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm hover:border-red-200 transition-colors">
                    <div className="font-black text-xl text-slate-800 mb-2">{s.name}</div>
                    <div className="text-sm text-slate-600 mb-4 font-medium">{s.purpose}</div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {s.tools?.map((tool: string, idx: number) => (
                        <span key={idx} className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-[10px] uppercase tracking-widest rounded-lg font-bold flex items-center gap-1.5 shadow-sm"><Wrench size={12}/>{tool}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-slate-800 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"><Wrench className="text-amber-500" size={24}/> Tool Sandbox</h2>
              <div className="space-y-4">
                {tools.length === 0 && <div className="p-6 bg-white border border-slate-200 rounded-3xl text-slate-400 font-medium text-center shadow-sm">No tools loaded.</div>}
                {tools.map((t, i) => (
                  <div key={i} className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="font-black text-xl text-slate-800">{t.name}</div>
                      <span className="px-3 py-1 bg-slate-50 border border-slate-200 text-slate-500 text-[10px] rounded-lg font-bold uppercase tracking-widest shadow-sm">{t.category}</span>
                    </div>
                    <div className="text-sm text-slate-600 mb-5 font-medium">{t.description}</div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Permissions:</span>
                      {t.permissions?.map((p: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-red-50 text-red-600 border border-red-200 text-[10px] uppercase font-black tracking-widest rounded-lg shadow-sm">{p}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'evals' && (
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
              <div>
                <h2 className="text-2xl font-black flex items-center gap-3 text-slate-800"><CheckCircle className="text-green-500" size={28}/> Evaluation Engine</h2>
                <p className="text-sm text-slate-500 mt-2 font-medium">Run deterministic test cases against the Agent Runtime.</p>
              </div>
              <button onClick={runEvaluation} className="flex items-center gap-2 px-6 py-3.5 bg-green-500 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-green-600 transition-colors shadow-sm">
                <Play size={16} /> Run Test Suite
              </button>
            </div>
            
            {evalResult && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm text-center">
                    <div className="text-4xl font-black text-slate-800">{evalResult.summary.total}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Total Cases</div>
                  </div>
                  <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm text-center">
                    <div className="text-4xl font-black text-green-500">{evalResult.summary.passed}</div>
                    <div className="text-[10px] font-bold text-green-600 uppercase tracking-widest mt-2">Passed</div>
                  </div>
                  <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm text-center">
                    <div className="text-4xl font-black text-blue-500">{Math.round(evalResult.summary.averageLatency)}ms</div>
                    <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-2">Avg Latency</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-black text-xl text-slate-800 mb-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm inline-block">Case Results</h3>
                  {evalResult.results.map((r: any, i: number) => (
                    <div key={i} className={`p-6 border-l-4 rounded-r-3xl rounded-l-md shadow-sm bg-white border-y border-r border-slate-200 ${r.passed ? 'border-l-green-500' : 'border-l-red-500'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="font-black text-lg text-slate-800">Case ID: {r.caseId}</div>
                        <div className={`px-4 py-1.5 rounded-xl text-[10px] uppercase tracking-widest font-black border ${r.passed ? 'bg-green-50 text-green-700 border-green-200 shadow-sm' : 'bg-red-50 text-red-700 border-red-200 shadow-sm'}`}>
                          SCORE: {r.score}
                        </div>
                      </div>
                      <div className="text-sm text-slate-600 flex flex-col gap-2 mt-4 font-medium">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><span className="font-bold text-slate-800 text-xs uppercase tracking-widest mr-2">Tools used:</span> {r.toolsUsed?.length ? r.toolsUsed.join(', ') : 'None'}</div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><span className="font-bold text-slate-800 text-xs uppercase tracking-widest mr-2">Skills used:</span> {r.skillsUsed?.length ? r.skillsUsed.join(', ') : 'None'}</div>
                      </div>
                      {!r.passed && r.failureReason && (
                        <div className="mt-4 p-4 bg-red-50 text-red-700 text-xs font-mono font-bold rounded-xl border border-red-200 shadow-inner">
                          {r.failureReason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
