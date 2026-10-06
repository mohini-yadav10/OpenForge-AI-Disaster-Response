import { useState } from 'react';
import { HeartPulse, Waves, Flame, Activity, Sun, CloudLightning, ShieldAlert, XCircle, PhoneCall } from 'lucide-react';

const guidelines = {
  flood: {
    icon: <Waves size={24}/>,
    title: "Flood Safety",
    immediate: ["Move to higher ground immediately.", "Turn off utilities at the main switches or valves if instructed.", "Disconnect electrical appliances."],
    avoid: ["Do not walk through moving water. Six inches of moving water can make you fall.", "Do not drive into flooded areas. If floodwaters rise around your car, abandon it."],
    seekHelp: ["If trapped in a building, go to the highest level. Do not climb into a closed attic.", "If you are swept into fast-moving floodwater."]
  },
  fire: {
    icon: <Flame size={24}/>,
    title: "Wildfire Safety",
    immediate: ["Evacuate immediately if instructed.", "Close all windows and doors to prevent drafts and reduce heat.", "Cover your nose and mouth with a damp cloth."],
    avoid: ["Do not wait to see if the fire will change direction before evacuating.", "Do not try to outrun a fire in a vehicle if you are trapped; park in an area clear of vegetation."],
    seekHelp: ["If you suffer burns or smoke inhalation.", "If you are completely trapped by fire (call emergency services and stay in a clear area)."]
  },
  earthquake: {
    icon: <Activity size={24}/>,
    title: "Earthquake Safety",
    immediate: ["Drop, Cover, and Hold On.", "If inside, stay inside. Do not run outside during shaking.", "If outside, move away from buildings, streetlights, and utility wires."],
    avoid: ["Do not use elevators.", "Do not light matches or use lighters (gas leaks are common)."],
    seekHelp: ["If you are trapped under debris.", "If you smell gas or hear a blowing/hissing noise (leave and call)."]
  },
  heat: {
    icon: <Sun size={24}/>,
    title: "Extreme Heat",
    immediate: ["Find air conditioning or cooling centers.", "Drink plenty of fluids, regardless of your activity level.", "Check on family members and neighbors."],
    avoid: ["Do not rely on a fan as your primary cooling device during an extreme heat event.", "Never leave children or pets in parked vehicles."],
    seekHelp: ["If someone exhibits signs of heat stroke (high body temp, hot/red/dry skin, fast pulse)."]
  },
  storm: {
    icon: <CloudLightning size={24}/>,
    title: "Severe Storm",
    immediate: ["Go to a secure location (basement or interior room).", "Listen to local news or NOAA Weather Radio.", "Bring pets indoors."],
    avoid: ["Do not use electrical equipment or corded phones.", "Avoid plumbing; do not wash your hands, take a shower or wash dishes."],
    seekHelp: ["If a tornado strikes your building and you suffer injuries.", "If power lines fall on your house or vehicle."]
  }
};

export default function EmergencyHelp() {
  const [active, setActive] = useState<keyof typeof guidelines>('flood');
  const data = guidelines[active];

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen text-slate-800 flex flex-col font-sans" data-testid="emergency-help">
      <div className="mb-8 border-b border-slate-200 pb-6 bg-white p-6 rounded-3xl shadow-sm">
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <HeartPulse className="text-red-500" size={36}/> Emergency Help
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Official safety guidelines and immediate response protocols.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 max-w-6xl">
        {/* Navigation */}
        <div className="w-full lg:w-64 flex flex-col gap-2 shrink-0">
          {(Object.entries(guidelines) as [keyof typeof guidelines, any][]).map(([key, item]) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`flex items-center gap-3 p-4 rounded-2xl text-left font-bold transition-all border ${
                active === key 
                ? 'bg-red-50 border-red-200 text-red-600 shadow-sm' 
                : 'bg-white border-slate-100 text-slate-500 hover:border-red-100 hover:text-slate-800'
              }`}
            >
              <div className={active === key ? 'text-red-500' : 'text-slate-400'}>{item.icon}</div>
              {item.title}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
             <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 border border-red-100 shadow-sm">
               {data.icon}
             </div>
             <h2 className="text-4xl font-black text-slate-800">{data.title}</h2>
          </div>

          <div className="space-y-8">
             <div>
               <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-600 mb-4 bg-red-50/50 p-2 rounded-xl inline-flex border border-red-100">
                 <ShieldAlert size={16}/> Immediate Action
               </h3>
               <ul className="space-y-3 pl-1">
                 {data.immediate.map((txt, i) => (
                   <li key={i} className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                     <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-sm">{i+1}</span>
                     <span className="text-slate-700 font-medium leading-relaxed">{txt}</span>
                   </li>
                 ))}
               </ul>
             </div>

             <div>
               <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-600 mb-4 bg-orange-50/50 p-2 rounded-xl inline-flex border border-orange-100">
                 <XCircle size={16}/> What to Avoid
               </h3>
               <ul className="space-y-3 pl-1">
                 {data.avoid.map((txt, i) => (
                   <li key={i} className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                     <XCircle className="text-orange-500 shrink-0 mt-0.5" size={20}/>
                     <span className="text-slate-700 font-medium leading-relaxed">{txt}</span>
                   </li>
                 ))}
               </ul>
             </div>

             <div className="bg-red-50 border border-red-200 rounded-3xl p-6 mt-6 shadow-inner">
               <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-600 mb-4 border-b border-red-200 pb-3">
                 <PhoneCall size={16}/> When to Seek Professional Help
               </h3>
               <ul className="space-y-3 list-disc list-inside text-slate-800 font-medium pl-1">
                 {data.seekHelp.map((txt, i) => (
                   <li key={i}>{txt}</li>
                 ))}
               </ul>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
