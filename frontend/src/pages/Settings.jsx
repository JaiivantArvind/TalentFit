import React from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Bell, Shield, Palette } from 'lucide-react';

function Settings() {
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
          {/* Profile Settings */}
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-8 border border-white/[0.08]">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-indigo-400" />
              <h3 className="text-2xl font-semibold text-white">Profile Settings</h3>
            </div>
            <p className="text-white/50 mb-4">Manage your account information and preferences</p>
            <button className="px-6 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all duration-200 border border-white/10">
              Coming Soon
            </button>
          </div>

          {/* Notifications */}
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-8 border border-white/[0.08]">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-purple-400" />
              <h3 className="text-2xl font-semibold text-white">Notifications</h3>
            </div>
            <p className="text-white/50 mb-4">Configure how you receive updates and alerts</p>
            <button className="px-6 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all duration-200 border border-white/10">
              Coming Soon
            </button>
          </div>

          {/* Privacy & Security */}
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-8 border border-white/[0.08]">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-rose-400" />
              <h3 className="text-2xl font-semibold text-white">Privacy & Security</h3>
            </div>
            <p className="text-white/50 mb-4">Control your data and security settings</p>
            <button className="px-6 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all duration-200 border border-white/10">
              Coming Soon
            </button>
          </div>

          {/* Appearance */}
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-8 border border-white/[0.08]">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-6 h-6 text-cyan-400" />
              <h3 className="text-2xl font-semibold text-white">Appearance</h3>
            </div>
            <p className="text-white/50 mb-4">Customize the look and feel of your dashboard</p>
            <button className="px-6 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all duration-200 border border-white/10">
              Coming Soon
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Settings;
