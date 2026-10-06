import { Bell, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

const mockNotifications = [
  { id: 1, type: 'alert', title: 'New Incident Reported', message: 'Visual Analysis system automatically reported a flood at Sector 4.', time: '2 mins ago', unread: true },
  { id: 2, type: 'warning', title: 'Risk Level Increased', message: 'Coastal Region Alpha risk level upgraded to CRITICAL due to rainfall.', time: '15 mins ago', unread: true },
  { id: 3, type: 'info', title: 'Response Plan Generated', message: 'Coordinator action plan created for Northern Hills wildfire.', time: '1 hour ago', unread: false },
  { id: 4, type: 'alert', title: 'Early Warning Issued', message: 'Earthquake Advisory issued for Northern Fault Line.', time: '3 hours ago', unread: false }
];

export default function Notifications() {
  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen text-slate-800 flex flex-col font-sans" data-testid="notifications">
      <div className="mb-8 border-b border-slate-200 pb-6 bg-white p-6 rounded-3xl shadow-sm">
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <Bell className="text-red-500" size={36}/> Notifications
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Live system alerts and intelligence updates.</p>
      </div>

      <div className="max-w-3xl space-y-4">
        {mockNotifications.map(n => (
          <div key={n.id} className={`p-6 rounded-3xl border flex gap-4 items-start transition-all ${
            n.unread ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-80'
          }`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
              n.type === 'alert' ? 'bg-red-50 text-red-500 border border-red-100' :
              n.type === 'warning' ? 'bg-orange-50 text-orange-500 border border-orange-100' :
              'bg-blue-50 text-blue-500 border border-blue-100'
            }`}>
              {n.type === 'alert' ? <AlertTriangle size={20}/> : n.type === 'warning' ? <ShieldAlert size={20}/> : <Info size={20}/>}
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className={`font-black text-lg ${n.unread ? 'text-slate-800' : 'text-slate-600'}`}>{n.title}</h3>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg uppercase tracking-widest">{n.time}</span>
              </div>
              <p className="text-sm text-slate-600 mt-1 font-medium">{n.message}</p>
            </div>
            
            {n.unread && (
              <div className="w-3 h-3 rounded-full bg-red-500 mt-2 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.8)] border-2 border-white"></div>
            )}
          </div>
        ))}
        {mockNotifications.length === 0 && (
          <div className="text-center p-12 bg-white rounded-3xl border border-slate-100 text-slate-400 font-medium shadow-sm">
            You have no notifications.
          </div>
        )}
      </div>
    </div>
  );
}
