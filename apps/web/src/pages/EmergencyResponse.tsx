import { useState } from 'react';
import { Navigation, ShieldAlert, Users, HardHat, Shield } from 'lucide-react';

export default function EmergencyResponse() {
  const [persona, setPersona] = useState('coordinator');

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen text-slate-800 flex flex-col font-sans" data-testid="emergency-response">
      <div className="mb-8 border-b border-slate-200 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-6 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Navigation className="text-red-500" size={36}/> Emergency Response
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Actionable AI-generated response plans for active disaster scenarios.</p>
        </div>
        
        {/* Persona Selector */}
        <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
           <button 
             onClick={() => setPersona('citizen')}
             className={`px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-all ${persona === 'citizen' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800 border border-transparent'}`}
           >
             <Users size={16}/> Citizen
           </button>
           <button 
             onClick={() => setPersona('responder')}
             className={`px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-all ${persona === 'responder' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800 border border-transparent'}`}
           >
             <HardHat size={16}/> Field Responder
           </button>
           <button 
             onClick={() => setPersona('coordinator')}
             className={`px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-all ${persona === 'coordinator' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800 border border-transparent'}`}
           >
             <Shield size={16}/> Coordinator
           </button>
        </div>
      </div>

      <div className="max-w-5xl">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
          
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 text-[10px] font-black rounded-lg uppercase tracking-widest">Critical Active</span>
            <h2 className="text-3xl font-black text-slate-800">Coastal Region Alpha Flood</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-red-100 pb-2">
                <ShieldAlert size={16}/> Immediate Action Required
              </h3>
              {persona === 'citizen' && (
                <ul className="space-y-3 text-slate-800 font-medium">
                  <li className="flex gap-2"><span>•</span> Evacuate immediately using Route B or C.</li>
                  <li className="flex gap-2"><span>•</span> Do not attempt to pack heavy belongings.</li>
                  <li className="flex gap-2"><span>•</span> Turn off main power if safe to do so.</li>
                </ul>
              )}
              {persona === 'responder' && (
                <ul className="space-y-3 text-slate-800 font-medium">
                  <li className="flex gap-2"><span>•</span> Deploy swift-water rescue teams to Sector 4.</li>
                  <li className="flex gap-2"><span>•</span> Secure perimeter around critical hospital infrastructure.</li>
                  <li className="flex gap-2"><span>•</span> Establish triage point at High Ground Alpha.</li>
                </ul>
              )}
              {persona === 'coordinator' && (
                <ul className="space-y-3 text-slate-800 font-medium">
                  <li className="flex gap-2"><span>•</span> Activate emergency broadcast system for Zones 1-5.</li>
                  <li className="flex gap-2"><span>•</span> Authorize deployment of National Guard assets.</li>
                  <li className="flex gap-2"><span>•</span> Reroute regional power grid to prevent substation cascade.</li>
                </ul>
              )}
            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2">Next Step</h3>
              {persona === 'citizen' && <p className="text-slate-700 font-medium leading-relaxed">Proceed to designated shelter at the Highland Community Center and register your arrival.</p>}
              {persona === 'responder' && <p className="text-slate-700 font-medium leading-relaxed">Assess structural integrity of main bridge access point once water levels stabilize.</p>}
              {persona === 'coordinator' && <p className="text-slate-700 font-medium leading-relaxed">Establish supply chain logistics for incoming relief convoys expected in T+12 hours.</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2">Strictly Avoid</h3>
              <ul className="space-y-2 text-slate-700 text-sm font-medium">
                <li className="flex gap-2"><span>•</span> Do not drive through flooded roadways.</li>
                <li className="flex gap-2"><span>•</span> Avoid contact with floodwater (contamination risk).</li>
                <li className="flex gap-2"><span>•</span> Do not use generators indoors.</li>
              </ul>
            </div>
            
             <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2">Monitor</h3>
              <ul className="space-y-2 text-slate-700 text-sm font-medium">
                <li className="flex gap-2"><span>•</span> Water level sensors at Dam Checkpoint 3.</li>
                <li className="flex gap-2"><span>•</span> Local radio frequency 104.5 FM for updates.</li>
                <li className="flex gap-2"><span>•</span> Weather radar for incoming secondary squalls.</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center text-slate-400 text-[10px] uppercase tracking-widest font-bold">
            <div>AI Generated Plan • Confidence: High</div>
            <div>Generated: {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
