import { useState, useEffect } from 'react';
import { AlertTriangle, Map, Clock, Plus, CheckCircle } from 'lucide-react';

export default function Incidents() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'Flood',
    location: '',
    severity: 'Medium',
    description: ''
  });

  const fetchIncidents = () => {
    fetch('http://localhost:3001/api/incidents')
      .then(r => r.json())
      .then(data => setIncidents(data.incidents || []));
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess(false);

    try {
      const res = await fetch('http://localhost:3001/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setSuccess(true);
        setFormData({ type: 'Flood', location: '', severity: 'Medium', description: '' });
        fetchIncidents();
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen text-slate-800 flex flex-col font-sans">
      <div className="mb-8 border-b border-slate-200 pb-6 bg-white p-6 rounded-3xl shadow-sm">
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <AlertTriangle className="text-red-500" size={36}/> Incident Center
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Report and track field intelligence and disaster incidents in real-time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl">
        
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Plus size={16} className="text-red-500"/> Report New Incident
            </h2>
            
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl flex items-center gap-2 font-bold animate-in fade-in slide-in-from-top-2">
                <CheckCircle size={20} />
                Incident reported successfully!
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Disaster Type</label>
                <select 
                  data-testid="incident-type-select"
                  className="w-full p-3 border border-slate-200 rounded-2xl bg-slate-50 text-slate-800 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-medium"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                >
                  <option>Flood</option>
                  <option>Wildfire</option>
                  <option>Earthquake</option>
                  <option>Hurricane</option>
                  <option>Infrastructure Failure</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Location</label>
                <input 
                  type="text"
                  required
                  data-testid="incident-location-input"
                  className="w-full p-3 border border-slate-200 rounded-2xl bg-slate-50 text-slate-800 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-medium"
                  placeholder="e.g. Downtown Sector 4"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Severity</label>
                <select 
                  data-testid="incident-severity-select"
                  className="w-full p-3 border border-slate-200 rounded-2xl bg-slate-50 text-slate-800 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-medium"
                  value={formData.severity}
                  onChange={e => setFormData({...formData, severity: e.target.value})}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Description</label>
                <textarea 
                  required
                  data-testid="incident-description-input"
                  className="w-full p-3 border border-slate-200 rounded-2xl bg-slate-50 text-slate-800 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none h-28 resize-none transition-all font-medium"
                  placeholder="Describe the situation..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>

              <button 
                type="submit" 
                data-testid="incident-submit-btn"
                disabled={isSubmitting}
                className="w-full bg-red-500 text-white font-black py-3.5 rounded-2xl hover:bg-red-600 transition-colors disabled:opacity-50 flex justify-center items-center gap-2 mt-2 shadow-sm"
              >
                {isSubmitting ? 'SUBMITTING...' : 'SUBMIT REPORT'}
              </button>
            </form>
          </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-3 w-full">
                <Map size={16} className="text-slate-400"/> Active Incidents
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[600px] custom-scrollbar">
              {incidents.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 italic p-12 bg-slate-50 rounded-2xl h-64 text-center">
                  <CheckCircle size={48} className="mb-4 text-slate-300"/>
                  No active incidents currently reported.<br/>Use the form to create a simulated incident.
                </div>
              ) : (
                incidents.slice().reverse().map((inc, i) => (
                  <div key={inc.id || i} data-testid="incident-card" className="bg-white border border-slate-100 rounded-2xl p-5 hover:border-red-200 transition-colors shadow-sm relative overflow-hidden group">
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${
                      inc.severity === 'Critical' || inc.severity === 'CRITICAL' || inc.status === 'URGENT' ? 'bg-red-500' :
                      inc.severity === 'High' || inc.severity === 'HIGH' || inc.status === 'ASSIGNED' ? 'bg-orange-500' :
                      inc.severity === 'Medium' || inc.severity === 'MEDIUM' || inc.status === 'PENDING' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}></div>
                    
                    <div className="flex justify-between items-start mb-3 pl-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg uppercase border tracking-widest ${
                          inc.severity === 'Critical' || inc.severity === 'CRITICAL' || inc.status === 'URGENT' ? 'bg-red-50 text-red-600 border-red-200' :
                          inc.severity === 'High' || inc.severity === 'HIGH' || inc.status === 'ASSIGNED' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                          inc.severity === 'Medium' || inc.severity === 'MEDIUM' || inc.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                          'bg-green-50 text-green-600 border-green-200'
                        }`}>
                          {inc.status || inc.severity}
                        </span>
                        <h3 className="font-black text-xl text-slate-800 tracking-tight">{inc.type}</h3>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                        <Clock size={12} className="text-slate-400"/>
                        {new Date(inc.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                    
                    <div className="pl-4">
                      <div className="text-sm font-bold text-slate-500 flex items-center gap-2 mb-3">
                        <Map size={14} className="text-slate-400"/> {inc.location}
                      </div>
                      <p className="text-slate-600 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap leading-relaxed font-medium">
                        {inc.description}
                      </p>
                      {inc.reportedBy && (
                        <div className="mt-3 text-xs text-slate-400 font-bold uppercase tracking-widest">
                          Reported by: {inc.reportedBy}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
