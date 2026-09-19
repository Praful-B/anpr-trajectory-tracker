import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-blue-900 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 text-xl font-bold">
          <ShieldAlert size={28} />
          <span>RAKSHAK Citizen Portal</span>
        </Link>
        <div className="space-x-6">
          <Link to="/file-complaint" className="hover:text-blue-200 transition">File Complaint</Link>
          <Link to="/track-complaint" className="hover:text-blue-200 transition">Track Complaint</Link>
          <Link to="/login" className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded font-medium transition">Login</Link>
        </div>
      </div>
    </nav>
  );
}
