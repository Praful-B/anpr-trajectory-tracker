import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 border border-gray-200 rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Citizen Login</h2>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input type="email" className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Enter your email" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input type="password" className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Enter your password" />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white font-medium py-2 rounded hover:bg-blue-700 transition">
          Sign In
        </button>
      </form>
      <div className="mt-6 text-center text-sm text-gray-600">
        Don't have an account? <Link to="/register" className="text-blue-600 font-medium hover:underline">Register here</Link>
      </div>
    </div>
  );
}
