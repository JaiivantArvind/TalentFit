import React, { useState } from 'react';
import HeroSection from '../components/HeroSection.jsx';
import { motion } from 'framer-motion';
import axios from 'axios';

function Dashboard() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [jdFile, setJdFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleResumeUpload = (file) => {
    setResumeFile(file);
    setError(null);
  };

  const handleJdFileUpload = (file) => {
    setJdFile(file);
    setError(null);
  };

  const handleJobDescriptionChange = (e) => {
    setJobDescription(e.target.value);
  };

  const handleSubmitAnalysis = async () => {
    if (!resumeFile) {
      setError('Please upload a resume file.');
      return;
    }
    if (!jobDescription.trim() && !jdFile) {
      setError('Please provide a job description (text or file).');
      return;
    }

    setProcessing(true);
    setError(null);
    setResults(null);

    const formData = new FormData();
    formData.append('files', resumeFile);
    
    // Priority: If jdFile exists, use it; otherwise use text
    if (jdFile) {
      formData.append('jd_file', jdFile);
    } else if (jobDescription.trim()) {
      formData.append('job_description', jobDescription);
    }

    try {
      const response = await axios.post('http://localhost:5000/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResults(response.data);
      console.log('Analysis Results:', response.data);

      // Save to history in localStorage
      if (response.data && response.data.results && response.data.results.length > 0) {
        const historyRecord = {
          id: Date.now(),
          date: new Date().toISOString(),
          jobTitle: jdFile ? jdFile.name.replace(/\.(pdf|docx|txt)$/i, '') : 'Job Analysis',
          topCandidateScore: Math.max(...response.data.results.map(r => r.score)),
          candidateCount: response.data.results.length,
          results: response.data.results
        };

        const existingHistory = JSON.parse(localStorage.getItem('scanHistory') || '[]');
        existingHistory.unshift(historyRecord); // Add to beginning
        localStorage.setItem('scanHistory', JSON.stringify(existingHistory));
      }
    } catch (err) {
      console.error('Error during analysis:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else if (err.response && err.response.status) {
        setError(`Request failed with status code ${err.response.status}. Please check backend logs.`);
      } else {
        setError(err.message || 'An unexpected error occurred during analysis.');
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] font-sans">
      {/* Upload Section */}
      <HeroSection
        onFileUpload={handleResumeUpload}
        jobDescription={jobDescription}
        onJobDescriptionChange={handleJobDescriptionChange}
        jdFile={jdFile}
        onJdFileUpload={handleJdFileUpload}
        processing={processing}
        onSubmitAnalysis={handleSubmitAnalysis}
        file={resumeFile}
      />

      {/* Processing State */}
      {processing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="container mx-auto py-16 flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
          />
          <div className="text-center">
            <p className="text-white/80 text-lg font-medium mb-2">Analyzing resume...</p>
            <p className="text-white/50 text-sm">Using SBERT for semantic understanding</p>
          </div>
        </motion.div>
      )}

      {/* Results Dashboard */}
      {results && results.results && results.results.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative container mx-auto p-8 text-slate-100"
        >
          {/* Background gradient matching landing */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] via-transparent to-rose-500/[0.03] blur-3xl"></div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300">
              Analysis Results
            </h2>
            <p className="text-white/50">AI-powered matching using keyword and semantic analysis</p>
          </div>

          {results.results.map((candidate, index) => (
            <motion.div 
              key={candidate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="mb-12 bg-white/[0.03] backdrop-blur-xl p-8 rounded-2xl shadow-[0_8px_32px_0_rgba(255,255,255,0.05)] border border-white/[0.08]"
            >
              {/* Header with Score */}
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/[0.08]">
                <h3 className="text-2xl font-semibold flex items-center gap-3">
                  <span className="text-3xl">📄</span>
                  {candidate.filename}
                </h3>
                <div className="text-center">
                  <div className={`text-5xl font-bold mb-1 ${
                    candidate.score > 70 ? 'text-green-400' : 
                    candidate.score > 40 ? 'text-yellow-400' : 
                    'text-red-400'
                  }`}>
                    {candidate.score}%
                  </div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider">Overall Match</div>
                </div>
              </div>

              {/* AI Summary Section */}
              {candidate.ai_summary && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-6 p-5 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <span className="text-2xl">🤖</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-purple-300 mb-2">AI Analysis Summary</h4>
                      <p className="text-white/80 leading-relaxed">{candidate.ai_summary}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Detailed Analysis Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* TF-IDF Analysis */}
                <div className="bg-white/[0.02] backdrop-blur-sm p-5 rounded-xl border border-white/[0.08]">
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="text-xl">🔍</span>
                    TF-IDF Keyword Analysis
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-white/60">Keyword Match Score</span>
                        <span className="text-lg font-bold text-indigo-400">
                          {candidate.breakdown.keyword.score}%
                        </span>
                      </div>
                      <div className="w-full bg-white/[0.05] rounded-full h-2">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${candidate.breakdown.keyword.score}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                          className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-2 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                        />
                      </div>
                    </div>

                    {candidate.breakdown.keyword.explanation && (
                      <p className="text-xs text-white/50 italic">
                        {candidate.breakdown.keyword.explanation}
                      </p>
                    )}

                    {candidate.breakdown.keyword.matched_keywords && candidate.breakdown.keyword.matched_keywords.length > 0 && (
                      <div>
                        <p className="text-xs text-white/50 mb-2 uppercase tracking-wider">
                          Top Matched Keywords ({candidate.breakdown.keyword.match_count || 0})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {candidate.breakdown.keyword.matched_keywords.slice(0, 8).map((keyword, idx) => (
                            <span
                              key={idx}
                              className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-2 py-1 rounded-md text-xs font-medium"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* SBERT Semantic Analysis */}
                <div className="bg-white/[0.02] backdrop-blur-sm p-5 rounded-xl border border-white/[0.08]">
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="text-xl">🧠</span>
                    SBERT Semantic Analysis
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-white/60">Semantic Match Score</span>
                        <span className="text-lg font-bold text-rose-400">
                          {candidate.breakdown.semantic.score}%
                        </span>
                      </div>
                      <div className="w-full bg-white/[0.05] rounded-full h-2">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${candidate.breakdown.semantic.score}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="bg-gradient-to-r from-rose-500 to-violet-500 h-2 rounded-full shadow-[0_0_20px_rgba(244,63,94,0.5)]"
                        />
                      </div>
                    </div>

                    {candidate.breakdown.semantic.explanation && (
                      <p className="text-xs text-white/50 italic">
                        {candidate.breakdown.semantic.explanation}
                      </p>
                    )}

                    {candidate.breakdown.semantic.resume_embedding_norm && (
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-white/[0.03] p-2 rounded">
                          <p className="text-white/40 mb-1">Resume Norm</p>
                          <p className="text-white/80 font-mono">{candidate.breakdown.semantic.resume_embedding_norm}</p>
                        </div>
                        <div className="bg-white/[0.03] p-2 rounded">
                          <p className="text-white/40 mb-1">JD Norm</p>
                          <p className="text-white/80 font-mono">{candidate.breakdown.semantic.jd_embedding_norm}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Correlation Explanation */}
              {candidate.breakdown.weight_explanation && (
                <div className="mb-6 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                  <div className="flex items-start gap-2">
                    <span className="text-xl">💡</span>
                    <div>
                      <h5 className="text-sm font-semibold text-cyan-300 mb-1">How Scores Correlate</h5>
                      <p className="text-xs text-white/70">{candidate.breakdown.weight_explanation}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Skills Analysis */}
              <div className="bg-white/[0.02] backdrop-blur-sm p-5 rounded-xl border border-white/[0.08]">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="text-xl">🎯</span>
                  Skills Analysis
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-white/50 mb-2 uppercase tracking-wider">
                      Found ({candidate.found_skills.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {candidate.found_skills.length > 0 ? (
                        candidate.found_skills.map((skill) => (
                          <motion.span
                            key={skill}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                            className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
                          >
                            ✓ {skill}
                          </motion.span>
                        ))
                      ) : (
                        <span className="text-white/40 text-sm">No skills found</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-white/50 mb-2 uppercase tracking-wider">
                      Missing ({candidate.missing_skills.length})
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                      {candidate.missing_skills.slice(0, 10).map((skill) => (
                        <span
                          key={skill}
                          className="bg-rose-500/10 text-rose-300 border border-rose-500/20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
                        >
                          {skill}
                        </span>
                      ))}
                      {candidate.missing_skills.length > 10 && (
                        <span className="text-white/40 text-xs px-3 py-1">
                          +{candidate.missing_skills.length - 10} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Analyze Another Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8"
          >
            <button
              onClick={() => {
                setResults(null);
                setResumeFile(null);
                setJobDescription('');
                setJdFile(null);
                setError(null);
              }}
              className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 transition-all duration-300 shadow-[0_8px_32px_0_rgba(99,102,241,0.3)] hover:shadow-[0_8px_32px_0_rgba(99,102,241,0.5)] border border-white/10"
            >
              Analyze Another Resume
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="container mx-auto p-8 text-center"
        >
          <div className="bg-rose-500/10 border border-rose-500/30 backdrop-blur-xl rounded-2xl p-6 max-w-md mx-auto">
            <p className="text-rose-300 font-semibold text-lg mb-2">⚠️ Error</p>
            <p className="text-rose-200/80">{error}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default Dashboard;
