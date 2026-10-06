import { useState, useRef } from 'react';
import { Camera, Upload, AlertTriangle, Activity, FileText, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VisualAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [incidentCreated, setIncidentCreated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
      setError(null);
      setIncidentCreated(false);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('http://localhost:3001/api/analyze-image', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze image.');
      setResult(data.analysis);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateIncident = async () => {
    if (!result) return;
    try {
      const payload = {
        type: result.disasterType,
        location: result.estimatedLocation || 'Unknown (from image)',
        severity: result.severity,
        description: `Visual Analysis Auto-Report: ${result.summary}\n\nHazards: ${result.hazards?.join(', ')}`,
      };
      const res = await fetch('http://localhost:3001/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIncidentCreated(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen text-slate-800 flex flex-col font-sans" data-testid="visual-analysis">
      <div className="mb-8 border-b border-slate-200 pb-6 bg-white p-6 rounded-3xl shadow-sm">
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <Camera className="text-red-500" size={36}/> Visual Analysis
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Upload imagery from drones, satellites, or ground sensors for immediate AI classification.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl">
        
        {/* Upload Section */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Input Source</h2>
          
          <div 
            className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 transition-colors ${preview ? 'border-slate-200 bg-slate-50' : 'border-slate-200 hover:border-red-400 hover:bg-red-50 cursor-pointer'}`}
            onClick={() => !preview && fileInputRef.current?.click()}
          >
            {preview ? (
              <div className="relative w-full h-64 flex items-center justify-center">
                <img src={preview} alt="Preview" className="max-w-full max-h-full object-contain rounded-xl shadow-md" />
                <button 
                  onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); setResult(null); setError(null); }}
                  className="absolute top-2 right-2 bg-white/90 hover:bg-red-50 hover:text-red-600 text-slate-700 p-2 rounded-lg transition-colors backdrop-blur text-[10px] uppercase tracking-widest font-black shadow-sm"
                >
                  CLEAR
                </button>
              </div>
            ) : (
              <>
                <Upload size={48} className="text-slate-300 mb-4" />
                <p className="font-black text-slate-700 text-lg">Click to Upload Imagery</p>
                <p className="text-slate-400 font-bold text-xs mt-2">Supports JPG, PNG (Max 10MB)</p>
              </>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={!file || isAnalyzing || !!result}
            className="w-full mt-6 bg-red-500 hover:bg-red-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 text-sm uppercase tracking-widest shadow-sm"
          >
            {isAnalyzing ? (
              <><Activity className="animate-spin" size={20}/> ANALYZING...</>
            ) : result ? (
              <><CheckCircle size={20}/> ANALYSIS COMPLETE</>
            ) : (
              <><Camera size={20}/> RUN AI ANALYSIS</>
            )}
          </button>
        </div>

        {/* Results Section */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Intelligence Output</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 flex items-start gap-3">
              <AlertTriangle size={20} className="shrink-0 mt-0.5 text-red-500"/>
              <div>
                <div className="font-bold">Analysis Failed</div>
                <div className="text-sm mt-1 font-medium">{error}</div>
              </div>
            </div>
          )}

          {!result && !error && !isAnalyzing && (
            <div className="flex-1 flex items-center justify-center text-slate-400 font-medium italic border-2 border-dashed border-slate-100 rounded-2xl p-8 text-center bg-slate-50 h-64">
              Awaiting imagery input...
            </div>
          )}

          {isAnalyzing && (
            <div className="flex-1 flex flex-col items-center justify-center text-red-500 space-y-4 h-64 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
              <Activity size={48} className="animate-pulse" />
              <div className="font-bold text-[10px] uppercase tracking-widest animate-pulse">Running computer vision models...</div>
            </div>
          )}

          {result && (
            <div className="flex-1 space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Detected Classification</div>
                  <div className="text-3xl font-black text-slate-800">{result.disasterType}</div>
                </div>
                <div className={`px-4 py-2 text-[10px] font-black rounded-xl uppercase tracking-widest border ${
                  result.severity === 'CRITICAL' ? 'bg-red-50 text-red-600 border-red-200' :
                  result.severity === 'HIGH' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                  'bg-yellow-50 text-yellow-600 border-yellow-200'
                }`}>
                  {result.severity} SEVERITY
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Hazards Identified</div>
                <div className="flex flex-wrap gap-2">
                  {result.hazards?.map((h: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-sm">{h}</span>
                  ))}
                </div>
              </div>

              <div className="bg-red-50/50 p-5 rounded-2xl border border-red-100">
                <div className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-3 border-b border-red-100 pb-2">Recommended Actions</div>
                <ul className="space-y-3 mt-3">
                  {result.recommendations?.map((r: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-800 font-medium">
                      <ArrowRight size={16} className="text-red-500 shrink-0 mt-0.5"/> {r}
                    </li>
                  ))}
                </ul>
              </div>

              {incidentCreated ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center justify-between text-green-700 shadow-sm">
                  <div className="flex items-center gap-2 font-black text-sm uppercase tracking-widest"><CheckCircle size={18}/> Incident Created</div>
                  <Link to="/incidents" className="text-xs font-bold underline hover:text-green-500 uppercase tracking-widest">View in Incidents</Link>
                </div>
              ) : (
                <button 
                  onClick={handleCreateIncident}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2 text-sm uppercase tracking-widest shadow-sm"
                >
                  <FileText size={18}/> Push to Incident Reporting
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
