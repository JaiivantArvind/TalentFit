import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, Trash2, LogOut, AlertTriangle, Sliders, PenTool, Save, RotateCcw, Cloud, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

function Settings() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  // Settings state - Original fields
  const [keywordWeight, setKeywordWeight] = useState(0.4);
  const [semanticWeight, setSemanticWeight] = useState(0.6);
  const [signatureName, setSignatureName] = useState('');
  const [signatureRole, setSignatureRole] = useState('');
  const [signatureCompany, setSignatureCompany] = useState('');
  
  // UI state
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Load settings from backend on mount
  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    
    try {
      setLoadingSettings(true);
      setErrorMessage(null); // Clear previous errors
      
      // Get auth session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No session found - user may need to log in again');
        setErrorMessage('Please log in again to load settings');
        setLoadingSettings(false);
        return;
      }

      // Call backend with auth token
      const response = await axios.get(`${API_BASE_URL}/settings`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      // Populate state with fetched data
      const settings = response.data;
      setKeywordWeight(settings.keyword_weight || 0.4);
      setSemanticWeight(settings.semantic_weight || 0.6);
      setSignatureName(settings.signature_name || '');
      setSignatureRole(settings.signature_role || '');
      setSignatureCompany(settings.signature_company || '');
      
      console.log('Settings loaded:', settings);
    } catch (error) {
      console.error('Error loading settings:', error);
      if (error.code === 'ERR_NETWORK') {
        setErrorMessage('Connection to backend failed. Please ensure the server is running (run `start.bat` in the `backend` folder).');
      } else {
        setErrorMessage(`An unexpected error occurred: ${error.message}`);
      }
      // Fallback to defaults on error
      setKeywordWeight(0.4);
      setSemanticWeight(0.6);
      setSignatureName('');
      setSignatureRole('');
      setSignatureCompany('');
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleSaveSettings = async () => {
    console.log('=== SAVE SETTINGS CLICKED ===');
    console.log('User:', user);
    
    if (!user) {
      alert('Not logged in!');
      return;
    }
    
    try {
      setSavingSettings(true);
      
      // Get auth session
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session:', session ? 'Found' : 'Not found');
      
      if (!session) {
        alert('Not authenticated. Please log in again.');
        return;
      }

      console.log('Sending request to backend...');
      console.log('Payload:', {
        keyword_weight: keywordWeight,
        semantic_weight: semanticWeight,
        signature_name: signatureName,
        signature_role: signatureRole,
        signature_company: signatureCompany
      });

      // Call backend with auth token
      const response = await axios.post(`${API_BASE_URL}/settings`, {
        keyword_weight: keywordWeight,
        semantic_weight: semanticWeight,
        signature_name: signatureName,
        signature_role: signatureRole,
        signature_company: signatureCompany
      }, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      console.log('Response:', response.data);

      // Show success message - Toast notification
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
      console.log('✅ Settings synced to cloud ☁️');
    } catch (error) {
      console.error('Error saving settings:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      alert(`Failed to save settings: ${error.response?.data?.error || error.message}`);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleResetToDefaults = () => {
    setKeywordWeight(0.4);
    setSemanticWeight(0.6);
    setSignatureName('');
    setSignatureRole('');
    setSignatureCompany('');
  };

  const handleKeywordWeightChange = (value) => {
    const newValue = parseFloat(value);
    setKeywordWeight(newValue);
    setSemanticWeight(parseFloat((1 - newValue).toFixed(2)));
  };

  const handleSemanticWeightChange = (value) => {
    const newValue = parseFloat(value);
    setSemanticWeight(newValue);
    setKeywordWeight(parseFloat((1 - newValue).toFixed(2)));
  };

  const handleClearHistory = async () => {
    try {
      const { error } = await supabase
        .from('history')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setShowClearConfirm(false);
      window.location.reload();
    } catch (error) {
      console.error('Error clearing history:', error.message);
      setShowClearConfirm(false);
    }
  };

  const handleLogout = async () => {
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
          {/* Success Message */}
          {showSuccessMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-emerald-500/20 border border-emerald-500/40 rounded-xl p-4 flex items-center gap-3"
            >
              <Cloud className="w-5 h-5 text-emerald-400" />
              <p className="text-emerald-300 font-medium">Settings synced to cloud ☁️</p>
            </motion.div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-500/20 border border-red-500/40 rounded-xl p-4 flex items-center gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <p className="text-red-300 font-medium">{errorMessage}</p>
            </motion.div>
          )}

          {/* Loading State */}
          {loadingSettings ? (
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl p-12 border border-white/[0.08] text-center">
              <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mx-auto mb-4" />
              <p className="text-white/60">Loading your settings...</p>
            </div>
          ) : (
            <>
              {/* AI Algorithm Tuning */}
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl p-6 border border-white/[0.08]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
                    <Sliders className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">🧠 AI Algorithm Tuning</h3>
                    <p className="text-white/50 text-sm mt-0.5">
                      Adjust how the AI scores candidates. Prioritize specific keywords or general meaning.
                    </p>
                  </div>
                </div>

                <div className="space-y-6 mt-6">
                  {/* Keyword Match Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-white/80 font-medium text-sm">
                        Keyword Match (Hard Skills)
                      </label>
                      <span className="text-indigo-400 font-bold text-lg">
                        {(keywordWeight * 100).toFixed(0)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={keywordWeight}
                      onChange={(e) => handleKeywordWeightChange(e.target.value)}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <p className="text-white/40 text-xs mt-1">
                      Focuses on exact keyword matches and technical skills
                    </p>
                  </div>

                  {/* Semantic Match Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-white/80 font-medium text-sm">
                        Semantic Match (Soft Skills/Context)
                      </label>
                      <span className="text-rose-400 font-bold text-lg">
                        {(semanticWeight * 100).toFixed(0)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={semanticWeight}
                      onChange={(e) => handleSemanticWeightChange(e.target.value)}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                    <p className="text-white/40 text-xs mt-1">
                      Analyzes overall meaning, context, and soft skills
                    </p>
                  </div>

                  {/* Weight Balance Display */}
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <span>Total Weight:</span>
                      <span className="font-mono font-bold text-white/80">
                        {((keywordWeight + semanticWeight) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 mt-2 overflow-hidden flex">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-full transition-all duration-300"
                        style={{ width: `${keywordWeight * 100}%` }}
                      />
                      <div
                        className="bg-gradient-to-r from-rose-500 to-rose-400 h-full transition-all duration-300"
                        style={{ width: `${semanticWeight * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Signature */}
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl p-6 border border-white/[0.08]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                    <PenTool className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">✍️ Email Signature</h3>
                    <p className="text-white/50 text-sm mt-0.5">
                      This signature will be automatically added to all candidate emails.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mt-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-white/80 font-medium text-sm mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={signatureName}
                      onChange={(e) => setSignatureName(e.target.value)}
                      placeholder="e.g., John Smith"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>

                  {/* Job Title */}
                  <div>
                    <label className="block text-white/80 font-medium text-sm mb-2">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={signatureRole}
                      onChange={(e) => setSignatureRole(e.target.value)}
                      placeholder="e.g., Senior Recruiter"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>

                  {/* Company Name */}
                  <div>
                    <label className="block text-white/80 font-medium text-sm mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={signatureCompany}
                      onChange={(e) => setSignatureCompany(e.target.value)}
                      placeholder="e.g., TechCorp Inc."
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>

                  {/* Signature Preview */}
                  {(signatureName || signatureRole || signatureCompany) && (
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <p className="text-white/40 text-xs uppercase tracking-wide mb-2">Preview:</p>
                      <div className="text-white/80 text-sm space-y-0.5">
                        <p className="font-medium">{signatureName || 'Your Name'}</p>
                        <p className="text-white/60">{signatureRole || 'Your Job Title'}</p>
                        <p className="text-white/60">{signatureCompany || 'Your Company'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Bar */}
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl p-6 border border-white/[0.08]">
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveSettings}
                    disabled={savingSettings}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingSettings ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Changes
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleResetToDefaults}
                    disabled={savingSettings}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white/80 font-medium rounded-lg transition-all duration-200 border border-white/10 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Reset
                  </motion.button>
                </div>
              </div>
            </>
          )}

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
