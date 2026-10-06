import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Shield, Send, Paperclip, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ChatWorkspace() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isGenerating) return;
    const text = input;
    setInput('');
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setIsGenerating(true);

    try {
      const res = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: messages })
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages([...newMessages, { role: 'agent', content: `**Error:** ${data.error || 'Server error'}` }]);
      } else if (data.error && !data.response) {
        setMessages([...newMessages, { role: 'agent', content: `**Error:** ${data.error}` }]);
      } else {
        setMessages([...newMessages, { role: 'agent', content: data.response, toolsUsed: data.toolsUsed }]);
      }
    } catch (e: any) {
      setMessages([...newMessages, { role: 'agent', content: `**Error:** ${e.message || 'Failed to connect to server.'}` }]);
    }
    setIsGenerating(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900 relative">
      <div className="bg-white p-4 border-b border-slate-100 flex items-center justify-between shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
             <ArrowLeft size={24} />
          </Link>
          <div className="font-bold text-lg text-slate-800">Emergency Assistant</div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 z-10 relative">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 mt-10">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6 shadow-sm">
              <Shield size={40} className="text-red-500" />
            </div>
            <h1 className="text-3xl font-black mb-2 text-slate-800 tracking-tight text-center">
              How can we help?
            </h1>
            <p className="mb-10 max-w-md text-center text-slate-500 text-sm">
              Ask for emergency instructions, report issues, or get immediate guidance.
            </p>
            <div className="grid grid-cols-1 gap-3 max-w-md w-full">
              <button onClick={() => setInput("What should I do during a flood?")} className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-red-400 hover:shadow-sm transition-all text-sm font-bold text-left flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-red-50 transition-colors">
                  <AlertTriangle size={20} className="text-slate-400 group-hover:text-red-500 transition-colors"/>
                </div>
                <span className="text-slate-700">What should I do during a flood?</span>
              </button>
              <button onClick={() => setInput("I need medical assistance.")} className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-red-400 hover:shadow-sm transition-all text-sm font-bold text-left flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-red-50 transition-colors">
                  <AlertTriangle size={20} className="text-slate-400 group-hover:text-red-500 transition-colors"/>
                </div>
                <span className="text-slate-700">I need medical assistance.</span>
              </button>
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-4 max-w-4xl mx-auto ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'agent' && <div className="w-10 h-10 rounded-full bg-red-100 text-red-500 flex items-center justify-center shrink-0 mt-1"><Shield size={20}/></div>}
            <div className="max-w-[85%] group">
              <div className={`px-5 py-4 rounded-3xl ${m.role === 'user' ? 'bg-red-500 text-white rounded-tr-sm' : 'bg-white border border-slate-100 text-slate-800 shadow-sm rounded-tl-sm'}`}>
                <div className={`prose prose-sm max-w-none prose-p:leading-relaxed ${m.role === 'user' ? 'prose-invert' : ''}`}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        ))}
        {isGenerating && (
          <div className="flex gap-4 max-w-4xl mx-auto">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-500 flex items-center justify-center shrink-0"><Shield size={20}/></div>
            <div className="px-5 py-4 rounded-3xl bg-white border border-slate-100 text-slate-500 text-sm font-medium flex items-center gap-2 shadow-sm">
               <span className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
               <span className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
               <span className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 bg-white border-t border-slate-100 w-full z-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 p-2 rounded-full bg-slate-50 border border-slate-200 focus-within:border-red-400 focus-within:ring-2 ring-red-100 transition-all">
            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors"><Paperclip size={20}/></button>
            <input 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && !isGenerating && sendMessage()}
              disabled={isGenerating}
              placeholder="Type your message..." 
              className="flex-1 bg-transparent outline-none text-slate-800 placeholder-slate-400 disabled:opacity-50 text-sm px-2"
            />
            <button 
              onClick={sendMessage}
              disabled={isGenerating || !input.trim()}
              className="p-3 bg-red-500 text-white rounded-full disabled:opacity-50 hover:bg-red-600 active:scale-95 transition-all"
            >
              <Send size={18}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}