import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, Trash2, LogOut, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

function Settings() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearHistory = async () => {
    try {
      // Delete all history records for current user from Supabase
      const { error } = await supabase
        .from('history')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setShowClearConfirm(false);
      // Reload page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error('Error clearing history:', error.message);
      setShowClearConfirm(false);
    }
  };

  const handleLogout = async () => {
    // Navigate first, then sign out to avoid ProtectedRoute redirect
    navigate('/');
    await signOut();
  };

  return (
    <div className="min-h-screen bg-[#030303] font-sans">
      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-rose-500/20 to-purple-500/20 border border-white/10 mb-4">
            <SettingsIcon className="w-8 h-8 text-rose-400" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-rose-300 via-white to-purple-300">
            Settings
          </h1>
          <p className="text-white/60 text-base">Customize your TalentFit AI experience</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto space-y-4"
        >
          {/* Data Management */}
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl p-6 border border-white/[0.08]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-rose-500/20 border border-rose-500/30">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Data Management</h3>
                <p className="text-white/50 text-sm mt-0.5">Manage your stored analysis data</p>
              </div>
            </div>
            
            {!showClearConfirm ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowClearConfirm(true)}
                className="
                  w-full px-4 py-2.5 rounded-lg font-medium text-white text-sm
                  bg-rose-600/20 hover:bg-rose-600/30
                  border border-rose-500/40 hover:border-rose-500/60
                  transition-all duration-200
                  flex items-center justify-center gap-2
                "
              >
                <Trash2 className="w-4 h-4" />
                Clear History
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4"
              >
                <div className="flex items-start gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-base font-semibold text-rose-300 mb-1">Are you sure?</h4>
                    <p className="text-white/70 text-xs">
                      This will permanently delete all your analysis history. This action cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClearHistory}
                    className="flex-1 px-3 py-2 rounded-lg font-medium text-white text-sm bg-rose-600 hover:bg-rose-500 transition-all duration-200"
                  >
                    Yes, Clear History
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 px-3 py-2 rounded-lg font-medium text-white/80 text-sm bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Account Actions */}
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl p-6 border border-white/[0.08]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                <LogOut className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Account</h3>
                <p className="text-white/50 text-sm mt-0.5">Manage your session</p>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="
                w-full px-4 py-2.5 rounded-lg font-medium text-white text-sm
                bg-gradient-to-r from-purple-600 to-pink-600
                hover:from-purple-500 hover:to-pink-500
                transition-all duration-200
                shadow-lg hover:shadow-purple-500/30
                border border-white/10
                flex items-center justify-center gap-2
              "
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Settings;
