import { useState, useEffect } from 'react';
import { Radio, AlertTriangle, Map, Clock, ArrowRight, Activity } from 'lucide-react';

export default function EarlyWarnings() {
  const [warnings, setWarnings] = useState<any[]>([]);

  useEffect(() => {
    // In a real app, this would fetch from /api/warnings. Using mock data here for the demo.
    setWarnings([
      {
        id: "warn-001",
        type: "Flood Warning",
        area: "Coastal Region Alpha, Sectors 4-7",
        severity: "CRITICAL",
        reason: "Sustained rainfall (145mm) combined with high tide anomalies detected by sensor net.",
        actions: ["Evacuate low-lying areas immediately.", "Secure loose outdoor objects.", "Monitor local radio."],
        timestamp: new Date().toISOString(),
        status: "ACTIVE - DEMO"
      },
      {
        id: "warn-002",
        type: "Earthquake Advisory",
        area: "Northern Fault Line",
        severity: "MEDIUM",
        reason: "Seismic micro-tremors (Magnitude 3.2) detected in sequence over 4 hours.",
        actions: ["Review drop/cover/hold protocols.", "Check emergency kits.", "Avoid overpasses."],
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: "MONITORING - DEMO"
      }
    ]);
  }, []);

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen text-slate-800 flex flex-col font-sans" data-testid="early-warning">
      <div className="mb-8 border-b border-slate-200 pb-6 bg-white p-6 rounded-3xl shadow-sm">
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <Radio className="text-red-500" size={36}/> Early Warning Center
        </h1>
        <p className="text-slate-500 mt-2 font-medium">AI-powered predictive alerts and active emergency broadcasts.</p>
      </div>

      <div className="max-w-5xl space-y-6">
        {warnings.map((w) => (
          <div key={w.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative">
            <div className={`absolute top-0 left-0 w-1.5 h-full ${
              w.severity === 'CRITICAL' ? 'bg-red-500' :
              w.severity === 'HIGH' ? 'bg-orange-500' :
              w.severity === 'MEDIUM' ? 'bg-yellow-500' :
              'bg-green-500'
            }`}></div>
            
            <div className="p-6 pl-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase border tracking-widest ${
                      w.severity === 'CRITICAL' ? 'bg-red-50 text-red-600 border-red-200' :
                      w.severity === 'HIGH' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                      'bg-yellow-50 text-yellow-600 border-yellow-200'
                    }`}>
                      {w.severity} SEVERITY
                    </span>
                    <span className="px-2.5 py-1 bg-slate-50 text-slate-500 border border-slate-200 text-[10px] font-bold rounded-lg uppercase tracking-widest">
                      {w.status}
                    </span>
                  </div>
                  <h2 className="text-3xl font-black text-slate-800 flex items-center gap-2">
                    {w.severity === 'CRITICAL' && <AlertTriangle className="text-red-500" size={28}/>}
                    {w.type}
                  </h2>
                </div>
                <div className="text-right">
                   <div className="text-sm font-bold text-slate-500 flex items-center justify-end gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                     <Clock size={14}/> {new Date(w.timestamp).toLocaleTimeString()}
                   </div>
                   <div className="text-xs text-slate-400 mt-2 uppercase tracking-widest font-bold">{new Date(w.timestamp).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-4">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Map size={14} className="text-slate-400"/> Affected Area</div>
                    <div className="font-bold text-lg text-slate-800">{w.area}</div>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Activity size={14} className="text-red-400"/> Intelligence Signal</div>
                    <div className="text-slate-600 font-medium">{w.reason}</div>
                  </div>
                </div>
                
                <div className="bg-red-50/50 p-5 rounded-2xl border border-red-100">
                  <div className="text-xs font-bold text-red-600 uppercase tracking-widest mb-4 border-b border-red-100 pb-3">Required Actions</div>
                  <ul className="space-y-3">
                    {w.actions.map((act: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3 text-slate-800 font-medium">
                        <ArrowRight size={16} className="text-red-500 shrink-0 mt-1"/> {act}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
        {warnings.length === 0 && (
          <div className="text-center p-12 bg-white rounded-3xl border border-slate-100 text-slate-400 font-medium">
            No active early warnings.
          </div>
        )}
      </div>
    </div>
  );
}
