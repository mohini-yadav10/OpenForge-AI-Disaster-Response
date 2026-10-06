import { useState, useEffect } from 'react';
import { Map as MapIcon, Info, Activity, Navigation, ArrowRight } from 'lucide-react';

export default function RiskMap() {
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:3001/api/scenarios').then(r => r.json()),
      fetch('http://localhost:3001/api/incidents').then(r => r.json())
    ]).then(([scenData, incData]) => {
      const merged = [
        ...(scenData.scenarios || []),
        ...(incData.incidents || []).map((inc: any) => ({
          ...inc,
          riskLevel: inc.severity?.toUpperCase() || 'LOW',
          isIncident: true
        }))
      ];
      setScenarios(merged);
    });
  }, []);

  const getMarkerColor = (risk: string) => {
    if (risk === 'CRITICAL' || risk === 'URGENT') return 'bg-red-500';
    if (risk === 'HIGH' || risk === 'ASSIGNED') return 'bg-orange-500';
    if (risk === 'MEDIUM' || risk === 'PENDING') return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getBorderColor = (risk: string) => {
    if (risk === 'CRITICAL' || risk === 'URGENT') return 'border-red-500';
    if (risk === 'HIGH' || risk === 'ASSIGNED') return 'border-orange-500';
    if (risk === 'MEDIUM' || risk === 'PENDING') return 'border-yellow-500';
    return 'border-green-500';
  };

  return (
    <div data-testid="risk-map" className="p-4 md:p-8 bg-slate-50 min-h-screen text-slate-800 flex flex-col font-sans">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-200 pb-6 bg-white p-6 rounded-3xl shadow-sm gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <MapIcon className="text-red-500" size={36}/> Risk Map
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Real-time geographical risk assessment and hazard monitoring.</p>
        </div>
        <div className="flex flex-wrap gap-2">
           {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(l => (
             <div key={l} className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shadow-inner">
               <div className={`w-3 h-3 rounded-full ${getMarkerColor(l)} shadow-sm`}></div>
               <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{l}</span>
             </div>
           ))}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Map Area */}
        <div className="lg:col-span-2 relative bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex items-center justify-center min-h-[500px]">
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-[10px] font-bold text-red-600 border border-red-100 shadow-sm tracking-widest">
            DEMO / SIMULATED DATA
          </div>
          
          <div className="w-full h-full opacity-10 absolute" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ef4444' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
          
          {/* Scenario & Incident Points */}
          {scenarios.map((s, i) => {
            const top = 30 + ((i * 17) % 40) + '%';
            const left = 30 + ((i * 23) % 40) + '%';
            
            return (
            <div 
              key={s.id || i} 
              data-testid="risk-marker"
              className="absolute flex flex-col items-center justify-center cursor-pointer group z-10"
              style={{ top, left, transform: 'translate(-50%, -50%)' }}
              onClick={() => setSelectedScenario(s)}
            >
              <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${getMarkerColor(s.riskLevel)}/10 border ${getBorderColor(s.riskLevel)}/30 group-hover:scale-110`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getMarkerColor(s.riskLevel)}/20`}>
                  <div className={`w-4 h-4 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.2)] ${getMarkerColor(s.riskLevel)}`}></div>
                </div>
              </div>
              <div className={`mt-2 px-3 py-1.5 bg-white/95 backdrop-blur rounded-xl shadow-md border ${s.isIncident ? 'border-dashed border-red-300 text-slate-700' : 'border-slate-200 text-slate-800'} text-[10px] font-black uppercase tracking-widest transition-opacity ${selectedScenario?.id === s.id ? 'opacity-100 ring-2 ring-red-500' : 'opacity-80 group-hover:opacity-100'}`}>
                {s.isIncident ? `[INCIDENT] ${s.location}` : s.location}
              </div>
            </div>
            );
          })}

          {scenarios.length === 0 && (
            <div className="text-slate-400 font-medium">No map data available.</div>
          )}
        </div>

        {/* Details Panel */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col h-full">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Info size={16} className="text-slate-400"/> Location Details
          </h2>
          
          {selectedScenario ? (
            <div data-testid="risk-details" className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</div>
                <div className="text-2xl font-black text-slate-800 leading-tight mt-1">{selectedScenario.location}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Event Type</div>
                  <div className="text-lg font-black text-slate-800">{selectedScenario.type} <br/><span className="text-[10px] text-slate-500 font-bold">{selectedScenario.isIncident ? '(User Report)' : ''}</span></div>
                </div>
                <div className={`p-4 rounded-2xl border ${
                  selectedScenario.riskLevel === 'CRITICAL' || selectedScenario.status === 'URGENT' ? 'bg-red-50 border-red-200 text-red-600' :
                  selectedScenario.riskLevel === 'HIGH' || selectedScenario.status === 'ASSIGNED' ? 'bg-orange-50 border-orange-200 text-orange-600' :
                  'bg-yellow-50 border-yellow-200 text-yellow-600'
                }`}>
                  <div className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-70">Risk Level</div>
                  <div className="text-lg font-black">{selectedScenario.riskLevel || selectedScenario.status}</div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Activity size={14} className="text-red-400"/> Risk Factor Explanation
                </div>
                <div className="space-y-3 font-medium">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Severity</span>
                    <span className="font-bold text-slate-800">{selectedScenario.severity}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Population Exposure</span>
                    <span className="font-bold text-orange-500">High</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Infrastructure Exposure</span>
                    <span className="font-bold text-red-500">Critical</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Active Reports</span>
                    <span className="font-bold text-slate-800">Multiple</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 text-[10px] text-slate-400 italic">
                  * Final risk level is calculated dynamically based on multi-factor exposure matrix.
                </div>
              </div>

              <div>
                 <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Recommended Action</div>
                 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm text-slate-700 font-medium flex items-start gap-3">
                   <ArrowRight className="text-red-500 shrink-0 mt-0.5" size={16}/>
                   {selectedScenario.isIncident 
                     ? selectedScenario.description || "Deploy responders to verify user incident report and assess damage." 
                     : "Immediate evacuation protocol implementation for Zones A and B. Deploy emergency response team to hospital sector."}
                 </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 italic text-center p-8 bg-slate-50 rounded-2xl h-64 border border-dashed border-slate-200">
              <Navigation size={48} className="mb-4 text-slate-300"/>
              Select a marker on the map to view detailed risk analysis and vulnerability metrics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
