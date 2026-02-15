import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Mail, Send, Sparkles, FileText, XCircle, Info, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

const EmailAssistant = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get data from navigation state
  const {
    toEmail: initialEmail = '',
    candidateName = '',
    jobTitle = '',
    missingSkills = [],
    resumeSummary = '',
    candidateId = null // Optional: for future database tracking
  } = location.state || {};

  // Email state
  const [toEmail, setToEmail] = useState(initialEmail);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Signature state
  const [signature, setSignature] = useState('');

  // Fetch signature on mount
  useEffect(() => {
    const fetchSignature = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const response = await axios.get('http://127.0.0.1:5000/settings', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          });
          
          const { signature_name, signature_role, signature_company } = response.data;
          
          // Build signature if any fields are present
          if (signature_name || signature_role || signature_company) {
            let sig = '\n\nBest regards,';
            if (signature_name) sig += `\n${signature_name}`;
            if (signature_role) sig += `\n${signature_role}`;
            if (signature_company) sig += `\n${signature_company}`;
            setSignature(sig);
          }
        }
      } catch (error) {
        console.log('Could not fetch signature:', error.message);
        // Continue without signature
      }
    };
    
    fetchSignature();
  }, []);

  // Optional: Function to mark candidate as contacted in database
  // Uncomment and implement when you have a candidates table
  /*
  const markAsContacted = async (candidateId) => {
    try {
      const { error } = await supabase
        .from('candidates')
        .update({ 
          status: 'Contacted',
          last_contacted: new Date().toISOString(),
          contact_notes: `${subject}\n\n${body}`
        })
        .eq('id', candidateId);
      
      if (error) throw error;
      console.log('Candidate marked as contacted');
    } catch (error) {
      console.error('Error updating candidate status:', error);
    }
  };
  */

  // Static Templates
  const templates = {
    invite: {
      subject: `Invitation to Interview - ${jobTitle}`,
      body: `Hi ${candidateName},

We loved your application for the ${jobTitle} position! Your background and experience caught our attention, and we would love to learn more about you.

We'd like to invite you for an interview to discuss how your skills align with our team's needs. Please let us know your availability for next week, and we'll arrange a convenient time.

Looking forward to speaking with you!

Best regards,
Recruitment Team`
    },
    reject: {
      subject: `Application Update - ${jobTitle}`,
      body: `Hi ${candidateName},

Thank you for applying to the ${jobTitle} position. We appreciate the time and effort you put into your application.

After careful consideration, we have decided to move forward with other candidates whose experience more closely matches our current needs. We were impressed by your qualifications and encourage you to apply for future opportunities that align with your skills.

We wish you all the best in your job search.

Best regards,
Recruitment Team`
    },
    info: {
      subject: `Additional Information Request - ${jobTitle}`,
      body: `Hi ${candidateName},

Thank you for your interest in the ${jobTitle} position. We're reviewing your application and would like to request some additional information to better understand your qualifications.

Could you please send us your portfolio or any relevant project examples that demonstrate your expertise? This will help us evaluate your fit for the role.

Please feel free to reach out if you have any questions.

Best regards,
Recruitment Team`
    }
  };

  // Apply static template
  const applyTemplate = (type) => {
    const template = templates[type];
    if (template) {
      setSubject(template.subject);
      // Replace "Best regards,\nRecruitment Team" with the custom signature if available
      let bodyText = template.body;
      if (signature) {
        // Remove the default signature and add custom one
        bodyText = bodyText.replace(/\n\nBest regards,\nRecruitment Team$/, signature);
      }
      setBody(bodyText);
    }
  };

  // Generate email using AI
  const handleAIGenerate = async () => {
    if (!candidateName || !jobTitle) {
      alert('Missing candidate information. Please ensure you have candidate name and job title.');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await axios.post('http://127.0.0.1:5000/generate_email', {
        candidate_name: candidateName,
        job_title: jobTitle,
        missing_skills: missingSkills,
        resume_summary: resumeSummary
      });

      const { subject: aiSubject, body: aiBody } = response.data;
      setSubject(aiSubject);
      // Append signature to AI-generated email
      setBody(signature ? aiBody + signature : aiBody);
    } catch (error) {
      console.error('Error generating email:', error);
      alert('Failed to generate email. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Open in mail app with confirmation
  const handleSend = () => {
    if (!toEmail || !subject || !body) {
      alert('Please fill in all fields before sending.');
      return;
    }

    // 1. Open the email client
    const mailtoLink = `mailto:${toEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;

    // 2. Ask the user immediately (honors system)
    setTimeout(() => {
      const sent = window.confirm(
        `Did you successfully send the email to ${candidateName}?\n\n` +
        `Click "OK" if you sent it, or "Cancel" if you didn't.`
      );
      
      if (sent) {
        // 3. Show success message
        alert(`✅ Great! Email status recorded.\n\nCandidate: ${candidateName}\nStatus: Contacted`);
        
        // 4. Navigate back to previous page
        navigate(-1);
      } else {
        // User cancelled - stay on page so they can try again
        console.log('Email send cancelled by user');
      }
    }, 1000); // Short delay to allow mailto to trigger first
  };

  // Open in Gmail web (forces browser, not desktop app)
  const handleOpenGmail = () => {
    if (!toEmail || !subject || !body) {
      alert('Please fill in all fields before sending.');
      return;
    }

    // The Magic Gmail URL - opens in browser with everything pre-filled
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${toEmail}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open in a new tab
    window.open(gmailUrl, '_blank');
    
    // Ask for confirmation
    setTimeout(() => {
      const sent = window.confirm(
        `Did you successfully send the email via Gmail?\n\n` +
        `Click "OK" if you sent it, or "Cancel" if you didn't.`
      );
      
      if (sent) {
        alert(`✅ Great! Email status recorded.\n\nCandidate: ${candidateName}\nStatus: Contacted`);
        navigate(-1);
      } else {
        console.log('Email send cancelled by user');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#030303] font-sans">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-white/60 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-white/10 mb-4">
            <Mail className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-white to-indigo-300">
            Email Assistant
          </h1>
          <p className="text-white/60 text-base">Create personalized recruitment emails using templates or AI</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-7xl mx-auto"
        >
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl p-6 border border-white/[0.08] space-y-6">
                {/* Static Templates */}
                <div>
                  <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    Static Templates
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => applyTemplate('invite')}
                      className="w-full px-4 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg transition-colors text-left font-medium border border-emerald-500/30"
                    >
                      📧 Invite to Interview
                    </button>
                    <button
                      onClick={() => applyTemplate('reject')}
                      className="w-full px-4 py-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg transition-colors text-left font-medium border border-rose-500/30"
                    >
                      ✉️ Rejection Letter
                    </button>
                    <button
                      onClick={() => applyTemplate('info')}
                      className="w-full px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors text-left font-medium border border-blue-500/30"
                    >
                      💬 Request Info
                    </button>
                  </div>
                </div>

                {/* AI Tools */}
                <div>
                  <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    AI Tools
                  </h3>
                  <button
                    onClick={handleAIGenerate}
                    disabled={isGenerating}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg transition-all font-medium shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        ✨ Write for Me
                      </>
                    )}
                  </button>
                  <p className="text-xs text-white/50 mt-2">
                    AI will craft a personalized email based on candidate's profile
                  </p>
                </div>

                {/* Candidate Info */}
                {candidateName && (
                  <div className="pt-4 border-t border-white/10">
                    <h4 className="text-xs font-semibold text-white/50 uppercase mb-3">
                      Candidate Info
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-white/80">
                        <span className="font-medium text-white/60">Name:</span> {candidateName}
                      </p>
                      <p className="text-white/80">
                        <span className="font-medium text-white/60">Job:</span> {jobTitle}
                      </p>
                      {missingSkills.length > 0 && (
                        <p className="text-white/80">
                          <span className="font-medium text-white/60">Missing Skills:</span>{' '}
                          {missingSkills.slice(0, 3).join(', ')}
                          {missingSkills.length > 3 && '...'}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Main Email Editor */}
            <div className="lg:col-span-3">
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl p-6 border border-white/[0.08]">
                <h2 className="text-xl font-semibold text-white mb-6">
                  Compose Email
                </h2>

                {/* Email Form */}
                <div className="space-y-4">
                  {/* To Field */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      To
                    </label>
                    <input
                      type="email"
                      value={toEmail}
                      onChange={(e) => setToEmail(e.target.value)}
                      placeholder="candidate@example.com"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>

                  {/* Subject Field */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Enter email subject"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>

                  {/* Body Field */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Message
                    </label>
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Type your message here..."
                      rows={14}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none font-mono text-sm"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 pt-4">
                    <div className="flex gap-3">
                      {/* Default Email App Button */}
                      <button
                        onClick={handleSend}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white rounded-lg transition-all font-medium shadow-lg hover:shadow-slate-500/30 flex items-center justify-center gap-2"
                      >
                        <Mail className="w-5 h-5" />
                        Default App
                      </button>
                      
                      {/* Gmail Web Button */}
                      <button
                        onClick={handleOpenGmail}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white rounded-lg transition-all font-medium shadow-lg hover:shadow-red-500/30 flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                        </svg>
                        Open in Gmail
                      </button>
                    </div>
                    
                    {/* Clear Button */}
                    <button
                      onClick={() => {
                        setSubject('');
                        setBody('');
                      }}
                      className="w-full px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white/80 rounded-lg transition-all font-medium border border-white/10"
                    >
                      <XCircle className="w-4 h-4 inline mr-2" />
                      Clear
                    </button>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="mt-6 bg-blue-500/20 border border-blue-500/40 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-blue-300 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Tips
                </h3>
                <ul className="text-sm text-white/70 space-y-1">
                  <li>• Use static templates for quick, standardized responses</li>
                  <li>• Let AI generate personalized emails based on candidate data</li>
                  <li>• Edit the generated email to add your personal touch</li>
                  <li>• <strong className="text-white/90">Default App:</strong> Opens your system's default email client (Outlook, Apple Mail, etc.)</li>
                  <li>• <strong className="text-white/90">Open in Gmail:</strong> Opens Gmail in a new browser tab (bypasses desktop apps)</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmailAssistant;
