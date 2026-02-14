import React from 'react';
import { motion } from 'framer-motion';
import { Clock, FileText, TrendingUp } from 'lucide-react';

function History() {
  return (
    <div className="min-h-screen bg-[#030303] font-sans">
      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 mb-6">
            <Clock className="w-10 h-10 text-indigo-400" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white to-purple-300">
            Analysis History
          </h1>
          <p className="text-white/60 text-lg">Review your past resume analyses and insights</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          {/* Empty State */}
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-12 border border-white/[0.08] text-center">
            <div className="flex justify-center gap-4 mb-6">
              <FileText className="w-12 h-12 text-white/20" />
              <TrendingUp className="w-12 h-12 text-white/20" />
            </div>
            <h3 className="text-2xl font-semibold text-white/80 mb-3">No History Yet</h3>
            <p className="text-white/50 mb-6 max-w-md mx-auto">
              Your past analyses will appear here. Start by analyzing some resumes to build your history.
            </p>
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-lg"
            >
              Start Analyzing
            </a>
          </div>

          {/* Future: List of past analyses will go here */}
          {/* Example structure for when data exists:
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="bg-white/[0.03] backdrop-blur-xl rounded-xl p-6 border border-white/[0.08]">
                // Analysis summary
              </div>
            ))}
          </div>
          */}
        </motion.div>
      </div>
    </div>
  );
}

export default History;
