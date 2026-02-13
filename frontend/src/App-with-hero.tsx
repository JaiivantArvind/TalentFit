import React, { useState } from 'react';
import HeroSection from './components/HeroSection';
import { DemoHeroGeometric } from './components/demo';
import axios from 'axios';

function App() {
  const [showGeometricHero, setShowGeometricHero] = useState(false);
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

  // Option to show the new geometric hero instead
  if (showGeometricHero) {
    return (
      <div>
        <DemoHeroGeometric />
        <button 
          onClick={() => setShowGeometricHero(false)}
          className="fixed top-4 right-4 z-50 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 transition"
        >
          Back to App
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans">
      {/* Toggle button to show geometric hero */}
      <button 
        onClick={() => setShowGeometricHero(true)}
        className="fixed top-4 right-4 z-50 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white text-sm transition"
      >
        ✨ Preview New Hero
      </button>

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
        <div className="container mx-auto p-8 text-slate-100">
          <h2 className="text-3xl font-bold text-center mb-6">Analysis Results</h2>
          {results.results.map((candidate) => (
            <div key={candidate.id} className="mb-8 bg-slate-900 p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold">{candidate.filename}</h3>
                <span className={`text-2xl font-bold ${candidate.score > 70 ? 'text-green-400' : candidate.score > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {candidate.score}% Match
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-800 p-4 rounded-lg">
                  <h4 className="text-xl font-semibold mb-3">Breakdown</h4>
                  <p>Keyword Score: {candidate.breakdown.keyword}%</p>
                  <p>Semantic Score: {candidate.breakdown.semantic}%</p>
                </div>

                <div className="bg-slate-800 p-4 rounded-lg">
                  <h4 className="text-xl font-semibold mb-3">Skills Match</h4>
                  <div className="flex flex-wrap gap-2">
                    {candidate.found_skills.map((skill) => (
                      <span key={skill} className="bg-green-500 text-slate-900 px-3 py-1 rounded-full text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                    {candidate.missing_skills.map((skill) => (
                      <span key={skill} className="bg-red-500 text-slate-900 px-3 py-1 rounded-full text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                  {candidate.found_skills.length === 0 && candidate.missing_skills.length === 0 && (
                      <p>No specific skills identified or matched against job description.</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="container mx-auto p-8 text-rose-500 text-center">
          <p className="font-semibold text-lg">{error}</p>
        </div>
      )}
    </div>
  );
}

export default App;
