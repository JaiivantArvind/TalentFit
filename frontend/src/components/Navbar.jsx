import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Sparkles, BarChart3, History, Settings, LogOut } from 'lucide-react';

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-white/5">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 text-white font-bold text-xl">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white to-rose-300">
              TalentFit AI
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-indigo-400 bg-white/5'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <BarChart3 className="w-5 h-5" />
              <span>Analyze</span>
            </NavLink>

            <NavLink
              to="/history"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-indigo-400 bg-white/5'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <History className="w-5 h-5" />
              <span>History</span>
            </NavLink>

            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-indigo-400 bg-white/5'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </NavLink>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/70 hover:text-rose-400 hover:bg-white/5 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
