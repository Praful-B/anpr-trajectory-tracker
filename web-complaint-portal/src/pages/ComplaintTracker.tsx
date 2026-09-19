import { useState, useEffect } from 'react';
import { Upload, CheckCircle2, Clock, Search } from 'lucide-react';

/**
 * ComplaintTracker Component
 * 
 * Displays the real-time status and timeline of a submitted vehicle theft complaint.
 * 
 * Key Features:
 * - **Live FIR Countdown**: Shows the remaining time (out of 48 hours) the user has to
 *   upload a verified Police FIR to keep their vehicle on the ANPR hotlist.
 * - **Status Timeline**: A visual stepper showing the lifecycle of the complaint from 
 *   submission to vehicle recovery.
 * - **FIR Upload Form**: Allows the user to submit their FIR reference number and document.
 * - **Sightings Feed**: Displays recent locations where the vehicle was flagged by the edge network.
 * 
 * @returns {JSX.Element} The rendered complaint tracker component
 */
export default function ComplaintTracker() {
  const [timeLeft, setTimeLeft] = useState(48 * 60 * 60); // 48 hours in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const steps = [
    { label: 'Submitted', active: true, completed: true },
    { label: 'Under Review', active: true, completed: true },
    { label: 'Added to Hotlist (48h Window)', active: true, completed: false },
    { label: 'FIR Verified', active: false, completed: false },
    { label: 'Vehicle Sighted / Recovered', active: false, completed: false },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 mt-8">
      <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Complaint #CMP-890123</h2>
          <p className="text-gray-600 mt-1">Vehicle: MH 12 AB 1234 (Honda City - White)</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-lg flex items-center space-x-3">
          <Clock className="text-yellow-600" />
          <div>
            <p className="text-xs text-yellow-800 font-medium uppercase tracking-wider">FIR Deadline</p>
            <p className="text-lg font-bold text-yellow-700 font-mono">{formatTime(timeLeft)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 border border-gray-200 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Status Timeline</h3>
        <div className="relative">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -ml-px"></div>
          <div className="space-y-8">
            {steps.map((step, idx) => (
              <div key={idx} className={`relative flex items-center ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                <div className="absolute left-4 md:left-1/2 -ml-3 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white z-10 
                  ${step.completed ? 'border-green-500 text-green-500' : step.active ? 'border-blue-500 text-blue-500' : 'border-gray-300'}">
                  {step.completed && <CheckCircle2 size={16} />}
                </div>
                <div className={`w-full md:w-1/2 pl-12 md:pl-0 ${idx % 2 === 0 ? 'md:text-left md:pr-12' : 'md:text-right md:pl-12'}`}>
                  <div className={`p-4 rounded-lg border ${step.active ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                    <h4 className={`font-semibold ${step.active ? 'text-blue-900' : ''}`}>{step.label}</h4>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Provide FIR Details</h3>
          <p className="text-sm text-gray-600 mb-4">You must upload an official Police FIR before the 48-hour window expires to keep the vehicle on the hotlist.</p>
          
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">FIR Reference Number</label>
              <input type="text" className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-blue-500 outline-none" placeholder="Enter FIR Number" />
            </div>
            
            <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg text-center hover:bg-gray-50 transition cursor-pointer">
              <Upload className="mx-auto text-gray-400 mb-2" size={24} />
              <p className="text-sm text-gray-600 font-medium">Upload FIR Document</p>
              <input type="file" className="hidden" />
            </div>

            <button type="button" className="w-full bg-blue-600 text-white font-medium py-2 rounded hover:bg-blue-700 transition">
              Submit Verification
            </button>
          </form>
        </div>

        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Recent Sightings</h3>
          <div className="flex flex-col items-center justify-center h-48 text-gray-500 space-y-2">
            <Search size={40} className="text-gray-300" />
            <p className="text-sm text-center">No sightings recorded yet.<br/>The edge network is actively scanning.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
