import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, FileText, TrendingUp, Calendar, Users, Award, Trash2, Download, Mail } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ReactMarkdown from 'react-markdown';

function History() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const openEmailAssistant = (candidate, jobTitle) => {
    navigate('/email-assistant', {
      state: {
        toEmail: candidate.email,
        candidateName: candidate.filename?.replace(/\.(pdf|docx|txt)$/i, '') || 'Candidate',
        jobTitle: jobTitle,
        missingSkills: candidate.breakdown?.keyword?.missing_keywords || candidate.missing_skills || [],
        resumeSummary: candidate.ai_summary || ''
      }
    });
  };

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching history:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async (id) => {
    try {
      const { error } = await supabase
        .from('history')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setHistory(history.filter(record => record.id !== id));
    } catch (error) {
      console.error('Error deleting record:', error.message);
    }
  };

  const handleDownloadHistoryPDF = async () => {
    setDownloadingPDF(true);
    try {
      const reportElement = document.getElementById('history-detail-report');
      if (!reportElement) {
        console.error('Report element not found');
        return;
      }

      // Temporarily apply white background for PDF
      const originalBg = reportElement.style.backgroundColor;
      reportElement.style.backgroundColor = '#ffffff';
      
      // Temporarily change text colors to dark for readability
      const allTextElements = reportElement.querySelectorAll('*');
      const originalColors = [];
      allTextElements.forEach((el, idx) => {
        originalColors[idx] = {
          color: el.style.color,
          borderColor: el.style.borderColor,
          backgroundColor: el.style.backgroundColor
        };
        
        // Make text dark and readable
        const computedStyle = window.getComputedStyle(el);
        if (computedStyle.color && computedStyle.color.includes('rgb')) {
          el.style.color = '#1e293b';
        }
        
        // Handle borders
        if (el.style.borderColor && el.style.borderColor.includes('rgba')) {
          el.style.borderColor = '#e2e8f0';
        }
        
        // Handle backgrounds with transparency
        if (el.style.backgroundColor && (el.style.backgroundColor.includes('rgba') || el.style.backgroundColor === 'transparent')) {
          el.style.backgroundColor = '#ffffff';
        }
      });

      // Capture the element
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
      });

      // Restore original styles
      reportElement.style.backgroundColor = originalBg;
      allTextElements.forEach((el, idx) => {
        if (originalColors[idx]) {
          el.style.color = originalColors[idx].color;
          el.style.borderColor = originalColors[idx].borderColor;
          el.style.backgroundColor = originalColors[idx].backgroundColor;
        }
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

      // Generate filename with date and job title
      const date = new Date(selectedRecord.created_at).toISOString().split('T')[0];
      const jobTitle = selectedRecord.job_title.replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`TalentFit_${jobTitle}_${date}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingPDF(false);
    }
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

        {loading ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-12 border border-white/[0.08]">
              <div className="w-16 h-16 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white/60 text-lg">Loading your history...</p>
            </div>
          </motion.div>
        ) : history.length === 0 ? (
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
          <div className="max-w-5xl mx-auto space-y-4">
            {history.map((record, index) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-6 border border-white/[0.08] hover:border-white/[0.15] transition-all duration-300 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
                        <FileText className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white/90">{record.job_title}</h3>
                        <div className="flex items-center gap-2 text-white/50 text-sm mt-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(record.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                        <Users className="w-5 h-5 text-purple-400" />
                        <div>
                          <div className="text-xs text-white/50 uppercase tracking-wider">Candidates</div>
                          <div className="text-lg font-semibold text-white/90">{record.candidate_count}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                        <Award className="w-5 h-5 text-emerald-400" />
                        <div>
                          <div className="text-xs text-white/50 uppercase tracking-wider">Top Score</div>
                          <div className={`text-lg font-semibold ${
                            record.top_match_score > 70 ? 'text-emerald-400' : 
                            record.top_match_score > 40 ? 'text-yellow-400' : 
                            'text-red-400'
                          }`}>
                            {record.top_match_score}%
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
                      onClick={() => setSelectedRecord(record)}
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
          </div>
        )}

        {/* Details Modal */}
        {selectedRecord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedRecord(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 rounded-2xl border border-white/10 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedRecord.job_title}</h2>
                  <p className="text-white/50 text-sm mt-1">{formatDate(selectedRecord.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Download PDF Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownloadHistoryPDF}
                    disabled={downloadingPDF}
                    className="
                      flex items-center gap-2 px-4 py-2 rounded-lg
                      bg-indigo-600 hover:bg-indigo-500
                      text-white text-sm font-medium
                      transition-all duration-200
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                  >
                    <Download className="w-4 h-4" />
                    {downloadingPDF ? 'Generating...' : 'Download PDF'}
                  </motion.button>
                  
                  {/* Close Button */}
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <span className="text-white/70 text-2xl">✕</span>
                  </button>
                </div>
              </div>

              {/* Modal Content - Display Results */}
              <div className="p-6" id="history-detail-report">
                {selectedRecord.results && selectedRecord.results.map((candidate, index) => (
                  <div key={index} className="mb-8 bg-white/[0.03] backdrop-blur-xl p-6 rounded-xl border border-white/[0.08]">
                    {/* Candidate Header */}
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/[0.08]">
                      <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                        <span className="text-2xl">📄</span>
                        {candidate.filename}
                      </h3>
                      <div className="text-center">
                        <div className={`text-4xl font-bold ${
                          candidate.score > 70 ? 'text-green-400' : 
                          candidate.score > 40 ? 'text-yellow-400' : 
                          'text-red-400'
                        }`}>
                          {candidate.score}%
                        </div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">Overall Match</div>
                      </div>
                    </div>

                    {/* AI Summary */}
                    {candidate.ai_summary && (
                      <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-purple-500/20">
                            <span className="text-xl">🤖</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-base font-semibold text-purple-300 mb-2">AI Analysis Summary</h4>
                            <div className="text-white/80 text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                              <ReactMarkdown>{candidate.ai_summary}</ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Scores Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {/* Keyword Analysis */}
                      <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.08]">
                        <h4 className="text-base font-semibold mb-3 flex items-center gap-2 text-white">
                          <span className="text-lg">🔍</span>
                          TF-IDF Keyword
                        </h4>
                        <div className="text-2xl font-bold text-indigo-400 mb-2">
                          {candidate.breakdown?.keyword?.score || 0}%
                        </div>
                        {candidate.breakdown?.keyword?.matched_keywords && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {candidate.breakdown.keyword.matched_keywords.slice(0, 6).map((kw, i) => (
                              <span key={i} className="text-xs bg-indigo-500/15 text-indigo-300 px-2 py-1 rounded">
                                {kw}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Semantic Analysis */}
                      <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.08]">
                        <h4 className="text-base font-semibold mb-3 flex items-center gap-2 text-white">
                          <span className="text-lg">🧠</span>
                          SBERT Semantic
                        </h4>
                        <div className="text-2xl font-bold text-rose-400 mb-2">
                          {candidate.breakdown?.semantic?.score || 0}%
                        </div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-emerald-400 mb-2 uppercase tracking-wider font-semibold">
                          ✓ Found Skills ({candidate.found_skills?.length || 0})
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {candidate.found_skills?.slice(0, 8).map((skill, i) => (
                            <span key={i} className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-1 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-rose-400 mb-2 uppercase tracking-wider font-semibold">
                          ✗ Missing Skills ({candidate.missing_skills?.length || 0})
                        </div>
                        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                          {candidate.missing_skills?.slice(0, 8).map((skill, i) => (
                            <span key={i} className="bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2 py-1 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Email Candidate Button - Only show if email exists */}
                    {candidate.email && (
                      <div className="mt-4 text-center">
                        <button
                          onClick={() => openEmailAssistant(candidate, selectedRecord.job_title)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-indigo-400 bg-white/[0.02] hover:bg-white/[0.05] border border-indigo-500/30 hover:border-indigo-400/50 transition-all duration-200 text-sm"
                        >
                          <Mail className="w-4 h-4" />
                          Email Candidate
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default History;
