import React, { useState } from 'react';
import HeroSection from './components/HeroSection.jsx';
import { HeroGeometric } from './components/ui/shape-landing-hero';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleResumeUpload = (file) => {
    setResumeFile(file);
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
    if (!jobDescription.trim()) {
      setError('Please provide a job description.');
      return;
    }

    setProcessing(true);
    setError(null);
    setResults(null);

    const formData = new FormData();
    formData.append('files', resumeFile); 
    formData.append('job_description', jobDescription);

    try {
      const response = await axios.post('http://localhost:5000/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResults(response.data);
      console.log('Analysis Results:', response.data);
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

  // Landing Page - First time visitors see this
  if (showLanding) {
    return (
      <div className="relative">
        <HeroGeometric 
          badge="TalentFit AI - Powered by SBERT"
          title1="Find the Perfect"
          title2="Candidate Match"
        />
        
        {/* CTA Button Overlay */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowLanding(false)}
            className="
              group flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg
              bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600
              hover:from-indigo-500 hover:via-purple-500 hover:to-rose-500
              text-white shadow-2xl hover:shadow-indigo-500/50
              transition-all duration-300 ease-out
              border border-white/20
            "
          >
            <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            Start Analyzing Resumes
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </motion.button>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.8 }}
            className="text-white/60 text-sm"
          >
            AI-powered semantic matching • 35+ skills tracked • Instant results
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Processing State - Show elegant loading screen
  if (processing) {
    return (
      <div className="relative">
        <HeroGeometric 
          badge="Analyzing with AI..."
          title1="Processing Your"
          title2="Resume Data"
        />
        
        {/* Processing Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center gap-4"
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
      </div>
    );
  }

  // Main App - Upload and Results
  return (
    <div className="min-h-screen bg-[#030303] font-sans">
      <HeroSection
        onFileUpload={handleResumeUpload}
        jobDescription={jobDescription}
        onJobDescriptionChange={handleJobDescriptionChange}
        processing={processing}
        onSubmitAnalysis={handleSubmitAnalysis}
        file={resumeFile}
      />

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
              className="mb-8 bg-white/[0.03] backdrop-blur-xl p-6 rounded-2xl shadow-[0_8px_32px_0_rgba(255,255,255,0.05)] border border-white/[0.08]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold flex items-center gap-3">
                  <span className="text-3xl">📄</span>
                  {candidate.filename}
                </h3>
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-1 ${
                    candidate.score > 70 ? 'text-green-400' : 
                    candidate.score > 40 ? 'text-yellow-400' : 
                    'text-red-400'
                  }`}>
                    {candidate.score}%
                  </div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider">Match Score</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Breakdown Card */}
                <div className="bg-white/[0.02] backdrop-blur-sm p-5 rounded-xl border border-white/[0.08]">
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="text-xl">📊</span>
                    Score Breakdown
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-white/60">Keyword Match (40%)</span>
                        <span className="text-sm font-semibold">{candidate.breakdown.keyword}%</span>
                      </div>
                      <div className="w-full bg-white/[0.05] rounded-full h-2">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${candidate.breakdown.keyword}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-2 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-white/60">Semantic Match (60%)</span>
                        <span className="text-sm font-semibold">{candidate.breakdown.semantic}%</span>
                      </div>
                      <div className="w-full bg-white/[0.05] rounded-full h-2">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${candidate.breakdown.semantic}%` }}
                          transition={{ duration: 1, delay: 0.7 }}
                          className="bg-gradient-to-r from-rose-500 to-violet-500 h-2 rounded-full shadow-[0_0_20px_rgba(244,63,94,0.5)]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills Card */}
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
                setError(null);
              }}
              className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 transition-all duration-300 shadow-[0_8px_32px_0_rgba(99,102,241,0.3)] hover:shadow-[0_8px_32px_0_rgba(99,102,241,0.5)] border border-white/10"
            >
              Analyze Another Resume
            </button>
          </motion.div>
        </motion.div>
      )}

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

export default App;
