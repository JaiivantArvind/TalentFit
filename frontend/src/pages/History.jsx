import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, FileText, TrendingUp, Calendar, Users, Award, Trash2 } from 'lucide-react';

function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const savedHistory = JSON.parse(localStorage.getItem('scanHistory') || '[]');
    setHistory(savedHistory);
  };

  const deleteRecord = (id) => {
    const updatedHistory = history.filter(record => record.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('scanHistory', JSON.stringify(updatedHistory));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 mb-6">
            <Clock className="w-10 h-10 text-indigo-400" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white to-purple-300">
            Analysis History
          </h1>
          <p className="text-white/60 text-lg">Review your past resume analyses and insights</p>
        </motion.div>

        {history.length === 0 ? (
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
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-5xl mx-auto space-y-4"
          >
            {history.map((record) => (
              <motion.div
                key={record.id}
                variants={itemVariants}
                className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-6 border border-white/[0.08] hover:border-white/[0.15] transition-all duration-300 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
                        <FileText className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white/90">{record.jobTitle}</h3>
                        <div className="flex items-center gap-2 text-white/50 text-sm mt-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(record.date)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                        <Users className="w-5 h-5 text-purple-400" />
                        <div>
                          <div className="text-xs text-white/50 uppercase tracking-wider">Candidates</div>
                          <div className="text-lg font-semibold text-white/90">{record.candidateCount}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                        <Award className="w-5 h-5 text-emerald-400" />
                        <div>
                          <div className="text-xs text-white/50 uppercase tracking-wider">Top Score</div>
                          <div className={`text-lg font-semibold ${
                            record.topCandidateScore > 70 ? 'text-emerald-400' : 
                            record.topCandidateScore > 40 ? 'text-yellow-400' : 
                            'text-red-400'
                          }`}>
                            {record.topCandidateScore}%
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                        <TrendingUp className="w-5 h-5 text-cyan-400" />
                        <div>
                          <div className="text-xs text-white/50 uppercase tracking-wider">Status</div>
                          <div className="text-lg font-semibold text-white/90">Completed</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all duration-200"
                    >
                      View Details
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => deleteRecord(record.id)}
                      className="px-4 py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 text-sm font-medium transition-all duration-200 border border-rose-500/30"
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default History;
