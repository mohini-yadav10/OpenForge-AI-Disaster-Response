import { useState, useEffect } from 'react';
import { List, Map, Clock, Zap } from 'lucide-react';

export default function DisasterFeed() {
  const [filter, setFilter] = useState('All');
  const [feed, setFeed] = useState<any[]>([]);

  useEffect(() => {
    // Combine scenarios and incidents for the feed
    Promise.all([
      fetch('http://localhost:3001/api/scenarios').then(r => r.json()),
      fetch('http://localhost:3001/api/incidents').then(r => r.json())
    ]).then(([scenData, incData]) => {
      const merged = [
        ...(scenData.scenarios || []).map((s:any) => ({
           id: s.id, type: s.type, location: s.location, severity: s.severity || 'HIGH',
           title: `${s.type} Alert`, summary: `Active ${s.type} reported. Status: ${s.status}`,
           time: s.timestamp
        })),
        ...(incData.incidents || []).map((i:any) => ({
           id: i.id, type: 'Incident', location: i.location, severity: i.severity || 'MEDIUM',
           title: i.type, summary: i.description,
           time: i.timestamp
        }))
      ];
      // Sort by time descending
      merged.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setFeed(merged);
    });
  }, []);
  
  const filtered = filter === 'All' ? feed : feed.filter(f => f.type.includes(filter) || (filter === 'Incident' && f.type === 'Incident'));

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen text-slate-800 flex flex-col font-sans" data-testid="disaster-feed">
      <div className="mb-8 border-b border-slate-200 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-slate-50 text-slate-400 text-[10px] font-bold rounded-lg uppercase tracking-widest border border-slate-200">Live Data</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <List className="text-red-500" size={36}/> Disaster Feed
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Chronological timeline of intelligence events and incidents.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {['All', 'Flood', 'Wildfire', 'Earthquake', 'Incident'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${filter === f ? 'bg-red-50 text-red-600 border-red-200 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:text-slate-800'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
        
        {filtered.map((item) => (
          <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-50 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${
              item.severity.toUpperCase() === 'CRITICAL' ? 'bg-red-500' :
              item.severity.toUpperCase() === 'HIGH' ? 'bg-orange-500' :
              item.severity.toUpperCase() === 'MEDIUM' ? 'bg-yellow-500' :
              'bg-green-500'
            }`}>
              <Zap size={16} className="text-white"/>
            </div>

            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:border-red-100 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-0.5 text-[10px] font-black rounded-lg uppercase border tracking-widest ${
                    item.severity.toUpperCase() === 'CRITICAL' ? 'bg-red-50 text-red-600 border-red-200' :
                    item.severity.toUpperCase() === 'HIGH' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                    item.severity.toUpperCase() === 'MEDIUM' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                    'bg-green-50 text-green-600 border-green-200'
                  }`}>
                    {item.type} • {item.severity}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-bold bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                  <Clock size={12}/> {new Date(item.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                </span>
              </div>
              <h3 className="font-black text-lg text-slate-800 mb-1">{item.title}</h3>
              <div className="text-xs font-bold text-slate-500 flex items-center gap-1 mb-3">
                <Map size={12} className="text-slate-400"/> {item.location}
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">{item.summary}</p>
            </div>
            
          </div>
        ))}
        
        {filtered.length === 0 && (
          <div className="text-center p-12 text-slate-400 font-medium bg-white rounded-3xl border border-slate-100 max-w-lg mx-auto relative z-10 shadow-sm">
            No events match the current filter.
          </div>
        )}
      </div>
    </div>
  );
}
