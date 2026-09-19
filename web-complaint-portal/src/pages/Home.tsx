import { Link } from 'react-router-dom';
import { FileText, Search, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-12 py-12">
      <div className="text-center space-y-4 max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-900">Vehicle Theft Reporting & Tracking</h1>
        <p className="text-lg text-gray-600">
          Fast, secure, and integrated with the RAKSHAK smart city surveillance network. 
          Report stolen vehicles immediately to activate the 48-hour hotlist window.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-4 hover:shadow-md transition">
          <div className="bg-red-100 p-4 rounded-full text-red-600">
            <FileText size={40} />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">File a Complaint</h2>
          <p className="text-gray-600">Report a stolen vehicle with your details, vehicle information, and RC book.</p>
          <Link to="/file-complaint" className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 w-full">
            Start Report
          </Link>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-4 hover:shadow-md transition">
          <div className="bg-blue-100 p-4 rounded-full text-blue-600">
            <Search size={40} />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Track Complaint</h2>
          <p className="text-gray-600">Check the status of your complaint, upload FIR, and get live updates.</p>
          <Link to="/track-complaint" className="mt-4 bg-gray-100 text-gray-800 border border-gray-300 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 w-full">
            Track Status
          </Link>
        </div>
      </div>

      <div className="bg-blue-50 w-full max-w-4xl p-6 rounded-lg border border-blue-100 flex items-start space-x-4">
        <ShieldCheck className="text-blue-600 mt-1 flex-shrink-0" size={24} />
        <div>
          <h3 className="font-semibold text-blue-900 text-lg">Integrated with RAKSHAK</h3>
          <p className="text-blue-800 text-sm mt-1">
            Once submitted, your vehicle's license plate is added to an active surveillance hotlist. 
            Mobile edge cameras will actively scan for your vehicle across the city.
          </p>
        </div>
      </div>
    </div>
  );
}
