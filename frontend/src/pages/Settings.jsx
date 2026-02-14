import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, Trash2, LogOut, AlertTriangle } from 'lucide-react';

function Settings() {
  const navigate = useNavigate();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearHistory = () => {
    localStorage.removeItem('scanHistory');
    setShowClearConfirm(false);
    // Show success message or redirect
    window.location.reload();
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#030303] font-sans">
      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500/20 to-purple-500/20 border border-white/10 mb-6">
            <SettingsIcon className="w-10 h-10 text-rose-400" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-rose-300 via-white to-purple-300">
            Settings
          </h1>
          <p className="text-white/60 text-lg">Customize your TalentFit AI experience</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          {/* Data Management */}
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-8 border border-white/[0.08]">
            <div className="flex items-center gap-3 mb-6">
              <Trash2 className="w-6 h-6 text-rose-400" />
              <div>
                <h3 className="text-2xl font-semibold text-white">Data Management</h3>
                <p className="text-white/50 mt-1">Manage your stored analysis data</p>
              </div>
            </div>
            
            {!showClearConfirm ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowClearConfirm(true)}
                className="
                  w-full px-6 py-4 rounded-xl font-semibold text-white
                  bg-rose-600/20 hover:bg-rose-600/30
                  border-2 border-rose-500/50 hover:border-rose-500
                  transition-all duration-200
                  flex items-center justify-center gap-2
                "
              >
                <Trash2 className="w-5 h-5" />
                Clear History
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-6"
              >
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-rose-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-lg font-semibold text-rose-300 mb-2">Are you sure?</h4>
                    <p className="text-white/70 text-sm">
                      This will permanently delete all your analysis history. This action cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClearHistory}
                    className="flex-1 px-4 py-3 rounded-lg font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-all duration-200"
                  >
                    Yes, Clear History
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 px-4 py-3 rounded-lg font-semibold text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Account Actions */}
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-8 border border-white/[0.08]">
            <div className="flex items-center gap-3 mb-6">
              <LogOut className="w-6 h-6 text-purple-400" />
              <div>
                <h3 className="text-2xl font-semibold text-white">Account</h3>
                <p className="text-white/50 mt-1">Manage your session</p>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="
                w-full px-6 py-4 rounded-xl font-semibold text-white
                bg-gradient-to-r from-purple-600 to-pink-600
                hover:from-purple-500 hover:to-pink-500
                transition-all duration-200
                shadow-lg hover:shadow-purple-500/50
                border border-white/10
                flex items-center justify-center gap-2
              "
            >
              <LogOut className="w-5 h-5" />
              Log Out
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Settings;
