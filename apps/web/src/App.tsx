import { createContext, useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ShieldAlert, Terminal, Shield, Activity, Map as MapIcon, AlertTriangle, Camera, Navigation, Radio, HeartPulse, List, Bell, Siren } from 'lucide-react';
import ChatWorkspace from './pages/ChatWorkspace';
import AgentWorkspace from './pages/AgentWorkspace';
import DisasterDashboard from './pages/DisasterDashboard';
import RiskMap from './pages/RiskMap';
import Incidents from './pages/Incidents';
import VisualAnalysis from './pages/VisualAnalysis';
import EarlyWarnings from './pages/EarlyWarnings';
import EmergencyResponse from './pages/EmergencyResponse';
import EmergencyHelp from './pages/EmergencyHelp';
import DisasterFeed from './pages/DisasterFeed';
import Notifications from './pages/Notifications';

type Role = 'citizen' | 'responder' | 'coordinator';

interface AppContextType {
  role: Role;
  setRole: (r: Role) => void;
  emergencyMode: boolean;
  setEmergencyMode: (m: boolean) => void;
}

export const AppContext = createContext<AppContextType>({
  role: 'citizen',
  setRole: () => {},
  emergencyMode: false,
  setEmergencyMode: () => {}
});

function Sidebar() {
  const location = useLocation();
  const { role, setRole, emergencyMode, setEmergencyMode } = useContext(AppContext);
  const isActive = (path: string) => location.pathname === path ? 'bg-slate-50 text-red-500 border-l-2 border-red-500 font-bold' : 'hover:bg-slate-50 text-slate-500 border-l-2 border-transparent hover:border-slate-300';
  
  return (
    <div className={`w-64 flex flex-col h-screen border-r transition-colors ${emergencyMode ? 'bg-red-50 text-slate-800 border-red-200' : 'bg-white text-slate-800 border-slate-100'}`}>
      
      {/* Header */}
      <div className={`p-4 font-black text-lg flex items-center justify-between border-b ${emergencyMode ? 'border-red-200 bg-red-100 text-red-600' : 'border-slate-100 text-slate-800'}`}>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${emergencyMode ? 'bg-red-500 animate-pulse shadow-md' : 'bg-red-500 shadow-sm'}`}>
            <ShieldAlert size={18}/>
          </div> 
          DisasterAI
        </div>
      </div>

      {/* Toggles Panel */}
      <div className={`p-4 border-b ${emergencyMode ? 'border-red-200 bg-red-50/50' : 'border-slate-100 bg-slate-50/50'}`}>
         
         <div className="mb-4">
           <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">View Role</div>
           <select 
             className={`w-full p-2 text-xs font-bold rounded-lg outline-none border cursor-pointer focus:ring-2 ring-red-500/20 ${emergencyMode ? 'bg-white border-red-200 text-slate-800 shadow-sm' : 'bg-white border-slate-200 text-slate-800 shadow-sm'}`}
             value={role}
             onChange={e => setRole(e.target.value as Role)}
           >
             <option value="citizen">CITIZEN</option>
             <option value="responder">RESPONDER</option>
             <option value="coordinator">COORDINATOR</option>
           </select>
         </div>

         <button 
           onClick={() => setEmergencyMode(!emergencyMode)}
           className={`w-full p-2.5 text-xs font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 border transition-all ${
             emergencyMode 
             ? 'bg-red-500 border-red-600 text-white animate-pulse shadow-md' 
             : 'bg-white border-slate-200 text-red-500 hover:bg-red-50 shadow-sm'
           }`}
         >
           <Siren size={16} /> {emergencyMode ? 'EMERGENCY ACTIVE' : 'ACTIVATE EMERGENCY'}
         </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 space-y-0.5 overflow-y-auto custom-scrollbar">
        
        <div className={`px-5 text-[10px] font-bold uppercase tracking-widest mb-2 mt-2 ${emergencyMode ? 'text-red-400' : 'text-slate-400'}`}>Command Center</div>
        <Link to="/" className={`flex items-center gap-3 text-sm font-medium px-5 py-2.5 transition-colors ${isActive('/')}`}><Activity size={18}/> Dashboard</Link>
        <Link to="/chat" className={`flex items-center gap-3 text-sm font-medium px-5 py-2.5 transition-colors ${isActive('/chat')}`}><Shield size={18}/> AI Copilot</Link>
        
        {!emergencyMode && (
          <>
            <Link to="/visual" className={`flex items-center gap-3 text-sm font-medium px-5 py-2.5 transition-colors ${isActive('/visual')}`}><Camera size={18}/> Visual Analysis</Link>
            
            <div className="px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-5">Intelligence</div>
            <Link to="/risk-map" className={`flex items-center gap-3 text-sm font-medium px-5 py-2.5 transition-colors ${isActive('/risk-map')}`}><MapIcon size={18}/> Risk Map</Link>
            <Link to="/feed" className={`flex items-center gap-3 text-sm font-medium px-5 py-2.5 transition-colors ${isActive('/feed')}`}><List size={18}/> Disaster Feed</Link>
          </>
        )}
        
        <Link to="/warnings" className={`flex items-center gap-3 text-sm font-medium px-5 py-2.5 transition-colors ${isActive('/warnings')}`}><Radio size={18}/> Early Warnings</Link>
        
        <div className={`px-5 text-[10px] font-bold uppercase tracking-widest mb-2 mt-5 ${emergencyMode ? 'text-red-400' : 'text-slate-400'}`}>Operations</div>
        <Link to="/incidents" className={`flex items-center gap-3 text-sm font-medium px-5 py-2.5 transition-colors ${isActive('/incidents')}`}><AlertTriangle size={18}/> Incident Center</Link>
        <Link to="/response" className={`flex items-center gap-3 text-sm font-medium px-5 py-2.5 transition-colors ${isActive('/response')}`}><Navigation size={18}/> Emergency Response</Link>
        <Link to="/help" className={`flex items-center gap-3 text-sm font-medium px-5 py-2.5 transition-colors ${isActive('/help')}`}><HeartPulse size={18}/> Emergency Help</Link>
        
        {!emergencyMode && (
          <>
            <div className="px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-5">System</div>
            <Link to="/notifications" className={`flex items-center justify-between text-sm font-medium px-5 py-2.5 transition-colors ${isActive('/notifications')}`}>
               <div className="flex items-center gap-3"><Bell size={18}/> Notifications</div>
               <div className="w-5 h-5 rounded-full bg-red-500 text-[10px] flex items-center justify-center text-white font-bold">2</div>
            </Link>
            <Link to="/developer" className={`flex items-center gap-3 text-sm font-medium px-5 py-2.5 transition-colors ${isActive('/developer')}`}><Terminal size={18}/> Developer</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [role, setRole] = useState<Role>('coordinator');
  const [emergencyMode, setEmergencyMode] = useState(false);

  return (
    <AppContext.Provider value={{ role, setRole, emergencyMode, setEmergencyMode }}>
      <Router>
        <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-800 font-sans">
          <Sidebar />
          <main className={`flex-1 h-screen overflow-y-auto ${emergencyMode ? 'bg-white border-l border-red-100' : 'bg-white'}`}>
            <Routes>
              <Route path="/" element={<DisasterDashboard />} />
              <Route path="/chat" element={<ChatWorkspace />} />
              <Route path="/visual" element={<VisualAnalysis />} />
              <Route path="/risk-map" element={<RiskMap />} />
              <Route path="/incidents" element={<Incidents />} />
              <Route path="/warnings" element={<EarlyWarnings />} />
              <Route path="/response" element={<EmergencyResponse />} />
              <Route path="/help" element={<EmergencyHelp />} />
              <Route path="/feed" element={<DisasterFeed />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/developer" element={<AgentWorkspace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppContext.Provider>
  );
}
