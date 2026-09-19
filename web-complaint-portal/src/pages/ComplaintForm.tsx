import { useState } from 'react';
import { Upload } from 'lucide-react';

/**
 * ComplaintForm Component
 * 
 * Renders the vehicle theft complaint submission form for citizens.
 * Features include:
 * - Real-time formatting of Indian High Security Registration Plates (HSRP)
 * - Vehicle detail fields (make, model, color, date/time)
 * - File upload placeholder for ownership documents (RC Book/Insurance)
 * 
 * Note: Submitting this form temporarily places the vehicle on the RAKSHAK active
 * hotlist for 48 hours. An official FIR must be provided within this window to permanently
 * verify the theft.
 * 
 * @returns {JSX.Element} The rendered complaint form component
 */
export default function ComplaintForm() {
  const [plate, setPlate] = useState('');

  /**
   * Handles the license plate input change event.
   * Strips non-alphanumeric characters and automatically formats the string 
   * into the standard Indian HSRP format (e.g., "MH 12 AB 1234").
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event
   */
  const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Auto-format Indian HSRP: AA 00 AA 0000 (simplified logic)
    let val = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (val.length > 10) val = val.slice(0, 10);
    
    // Formatting: 2 chars, 2 nums, 1-2 chars, 4 nums
    let formatted = '';
    if (val.length > 0) formatted += val.slice(0, 2);
    if (val.length > 2) formatted += ' ' + val.slice(2, 4);
    if (val.length > 4) formatted += ' ' + val.slice(4, 6);
    if (val.length > 6) formatted += ' ' + val.slice(6, 10);
    
    setPlate(formatted.trim());
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 border border-gray-200 rounded-xl shadow-sm mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">File Vehicle Theft Complaint</h2>
      
      <form className="space-y-6">
        <div className="bg-blue-50 p-4 rounded text-sm text-blue-800 border border-blue-100">
          <p>Filing a report will immediately add your vehicle's license plate to the RAKSHAK active hotlist for 48 hours. You must provide a valid FIR within this window to confirm the theft.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">License Plate Number (HSRP)</label>
            <input 
              type="text" 
              value={plate}
              onChange={handlePlateChange}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-blue-500 focus:border-blue-500 outline-none text-lg font-mono uppercase" 
              placeholder="MH 12 AB 1234" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Make</label>
            <input type="text" className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-blue-500 outline-none" placeholder="e.g. Honda, Maruti Suzuki" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Model</label>
            <input type="text" className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-blue-500 outline-none" placeholder="e.g. City, Swift" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <input type="text" className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-blue-500 outline-none" placeholder="e.g. White, Silver" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time Stolen</label>
            <input type="datetime-local" className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-blue-500 outline-none" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Known Location</label>
            <input type="text" className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-blue-500 outline-none" placeholder="Enter street address or landmark" />
          </div>

          <div className="md:col-span-2 border-2 border-dashed border-gray-300 p-6 rounded-lg text-center hover:bg-gray-50 transition cursor-pointer">
            <Upload className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-sm text-gray-600 font-medium">Upload RC Book / Insurance Copy</p>
            <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG up to 5MB</p>
            <input type="file" className="hidden" />
          </div>
        </div>

        <button type="button" className="w-full bg-blue-600 text-white font-medium py-3 rounded hover:bg-blue-700 transition shadow-sm text-lg mt-4">
          Submit Report
        </button>
      </form>
    </div>
  );
}
