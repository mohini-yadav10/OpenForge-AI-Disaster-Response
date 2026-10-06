import { useEffect } from 'react';
import { AlertTriangle, MapPin, Plus, Radio, ArrowRight, Home, ClipboardList, Phone, BookOpen, Edit2, Calendar, Droplet, User, Weight, HeartPulse } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DisasterDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    // Optionally pre-fetch data if needed
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 flex flex-col font-sans pb-24">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-b-3xl shadow-sm flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80" alt="Profile" className="w-12 h-12 rounded-2xl object-cover shadow-sm"/>
            <div className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <div className="text-slate-500 text-sm font-medium">Hello Susan!</div>
            <div className="text-red-500 font-bold text-sm">Complete profile</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-slate-500 text-sm font-medium">Ludwika Waryńskiego</div>
            <div className="text-red-500 font-bold text-sm">Complete profile</div>
          </div>
          <MapPin className="text-red-500" size={24} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-8 pb-8 max-w-lg mx-auto w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-tight mb-2">
            Emergency help needed?
          </h1>
          <p className="text-slate-500 font-medium">Just hold the button to call</p>
        </div>

        {/* SOS Button */}
        <div className="flex justify-center mb-12 relative">
           <div className="absolute inset-0 bg-red-100 rounded-full scale-125 animate-ping opacity-20"></div>
           <div className="absolute inset-0 bg-red-200 rounded-full scale-110 opacity-50"></div>
           <button onClick={() => navigate('/chat')} className="relative w-64 h-64 bg-gradient-to-b from-red-500 to-red-600 rounded-full shadow-[0_20px_50px_rgba(239,68,68,0.4)] flex items-center justify-center transform active:scale-95 transition-transform">
             <Radio size={80} className="text-white drop-shadow-md" />
           </button>
        </div>

        {/* Quick Assistance Cards */}
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-slate-800">Not sure what to do?</h2>
          <p className="text-slate-500 text-sm">Pick the subject to chat</p>
        </div>

        <div className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory hide-scrollbar">
           <div onClick={() => navigate('/chat')} className="snap-start min-w-[140px] bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow">
             <div className="font-bold text-slate-800 mb-6">I have<br/>an accident</div>
             <div className="flex justify-between items-end">
               <ArrowRight className="text-red-500" size={16} />
               <AlertTriangle className="text-slate-300" size={32} />
             </div>
           </div>
           
           <div onClick={() => navigate('/chat')} className="snap-start min-w-[140px] bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow">
             <div className="font-bold text-slate-800 mb-6">I have<br/>an injury</div>
             <div className="flex justify-between items-end">
               <ArrowRight className="text-red-500" size={16} />
               <Plus className="text-slate-300" size={32} />
             </div>
           </div>

           <div onClick={() => navigate('/chat')} className="snap-start min-w-[140px] bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow">
             <div className="font-bold text-slate-800 mb-6">I'm feeling<br/>ill</div>
             <div className="flex justify-between items-end">
               <ArrowRight className="text-red-500" size={16} />
               <HeartPulse className="text-slate-300" size={32} />
             </div>
           </div>
        </div>

        {/* Profile Data Section */}
        <div className="mt-8 bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
               Profile data: <span className="text-red-500">60%</span>
             </div>
             <button className="text-red-500 font-bold text-sm flex items-center gap-1">Edit <Edit2 size={14}/></button>
          </div>
          
          <div className="text-center mb-8">
            <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80" alt="Susan Simmons" className="w-24 h-24 rounded-3xl object-cover mx-auto mb-4 shadow-sm" />
            <h2 className="text-2xl font-black text-slate-800">Susan Simmons</h2>
            <p className="text-slate-400 text-sm font-medium">14 January 1982</p>
          </div>

          <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
             <div className="border-r border-slate-100 pr-4">
                <div className="flex items-center justify-between text-slate-500 text-sm mb-1">Age: <Calendar size={16} className="text-green-500"/></div>
                <div className="text-xl font-black text-slate-800">28 <span className="text-sm font-medium text-slate-500">years</span></div>
             </div>
             <div className="pl-4">
                <div className="flex items-center justify-between text-slate-500 text-sm mb-1">Blood type: <Droplet size={16} className="text-red-500"/></div>
                <div className="text-xl font-black text-slate-800">ORh+</div>
             </div>
             <div className="border-r border-slate-100 border-t pt-4 pr-4">
                <div className="flex items-center justify-between text-slate-500 text-sm mb-1">Height: <User size={16} className="text-cyan-500"/></div>
                <div className="text-xl font-black text-slate-800">185 <span className="text-sm font-medium text-slate-500">cm</span></div>
             </div>
             <div className="border-t border-slate-100 pt-4 pl-4">
                <div className="flex items-center justify-between text-slate-500 text-sm mb-1">Weight: <Weight size={16} className="text-purple-500"/></div>
                <div className="text-xl font-black text-slate-800">85 <span className="text-sm font-medium text-slate-500">kg</span></div>
             </div>
          </div>
          
          <div>
            <h3 className="text-center font-bold text-slate-800 mb-4">Allergies and reactions</h3>
            <div className="text-center text-slate-400 text-sm mb-4">Food:</div>
            <div className="space-y-3">
               <div className="flex items-center border-b border-slate-50 pb-3">
                 <div className="w-1/2 font-bold text-slate-800 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Grape</div>
                 <div className="w-1/2 text-slate-500 text-sm">Blocked nose</div>
               </div>
               <div className="flex items-center border-b border-slate-50 pb-3">
                 <div className="w-1/2 font-bold text-slate-800 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Orange</div>
                 <div className="w-1/2 text-slate-500 text-sm">Watering eyes</div>
               </div>
               <div className="flex items-center">
                 <div className="w-1/2 font-bold text-slate-800 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Pear</div>
                 <div className="w-1/2 text-slate-500 text-sm">Rash</div>
               </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 w-full bg-white border-t border-slate-100 p-4 px-8 flex justify-between items-center z-20">
        <button className="flex flex-col items-center text-red-500 relative">
          <Home size={24} />
          <div className="absolute -bottom-4 w-6 h-1 bg-red-500 rounded-t-lg"></div>
        </button>
        <button className="flex flex-col items-center text-slate-300 hover:text-slate-400">
          <ClipboardList size={24} />
        </button>
        <button className="flex flex-col items-center text-slate-300 hover:text-slate-400">
          <Phone size={24} />
        </button>
        <button className="flex flex-col items-center text-slate-300 hover:text-slate-400">
          <BookOpen size={24} />
        </button>
      </div>
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
