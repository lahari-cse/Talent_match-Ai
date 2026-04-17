import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Search, MapPin, Building, Sparkles, Upload, CheckCircle, Heart, FileText } from 'lucide-react';

const JobSearch = () => {
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [matchScores, setMatchScores] = useState({});
  const [profile, setProfile] = useState(null);
  const [coverLetters, setCoverLetters] = useState({});
  const [uploadedResumeSkills, setUploadedResumeSkills] = useState(null);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [uploadedResumeName, setUploadedResumeName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const [jobsRes, profileRes, appsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/jobs`),
          axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/profiles`, config).catch(() => ({ data: null })),
          axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/jobs/my-applications`, config).catch(() => ({ data: [] }))
        ]);
        setJobs(jobsRes.data);
        if (profileRes.data) setProfile(profileRes.data);
        if (appsRes.data) {
          setSavedJobIds(appsRes.data.map(app => app.job?._id || app.job));
        }
      } catch (error) { console.error(error); }
    };
    fetchData();
  }, [user]);

  const calculateMatch = async (jobId) => {
    try {
      setMatchScores(prev => ({ ...prev, [jobId]: { loading: true } }));
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/ai/match-score`, { jobId }, config);
      setMatchScores(prev => ({ ...prev, [jobId]: { score: data.score, gap: data.gapAnalysis, loading: false } }));
    } catch (error) {
      console.error(error);
      setMatchScores(prev => ({ ...prev, [jobId]: { error: true, loading: false } }));
    }
  };

  const generateCoverLetter = async (jobId) => {
    try {
      setCoverLetters(prev => ({ ...prev, [jobId]: { loading: true } }));
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/ai/cover-letter`, { jobId }, config);
      setCoverLetters(prev => ({ ...prev, [jobId]: { text: data.coverLetter, loading: false } }));
    } catch (error) {
      console.error(error);
      setCoverLetters(prev => ({ ...prev, [jobId]: { error: true, loading: false } }));
      alert(error.response?.data?.message || 'Error generating cover letter');
    }
  };

  const handleApply = async (jobId) => {
    try {
      const scoreData = matchScores[jobId];
      const coverLetterData = coverLetters[jobId];
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/jobs/${jobId}/apply`, {
        aiMatchScore: scoreData?.score || 0,
        aiGapAnalysis: scoreData?.gap || '',
        coverLetter: coverLetterData?.text || ''
      }, config);
      setPopupMessage('You have successfully registered.');
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 3000);
    } catch (error) {
      alert(error.response?.data?.message || 'Error applying to job');
    }
  };

  const handleSaveJob = async (jobId) => {
    if (savedJobIds.includes(jobId)) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/jobs/${jobId}/save`, config);
        setSavedJobIds(prev => prev.filter(id => id !== jobId));
        setPopupMessage('Job removed from your Wishlist');
        setShowSuccessPopup(true);
        setTimeout(() => setShowSuccessPopup(false), 3000);
      } catch (error) {
        alert(error.response?.data?.message || 'Error removing job');
      }
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/jobs/${jobId}/apply`, {
        status: 'Saved'
      }, config);
      setSavedJobIds(prev => [...prev, jobId]);
      setPopupMessage('Job added to your Wishlist!');
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 3000);
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving job');
    }
  };

  const filteredJobs = jobs.filter(j => {
    const matchTitle = (j.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || (j.company || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchLocation = (j.location || '').toLowerCase().includes(locationSearch.toLowerCase());
    return matchTitle && matchLocation;
  });

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedResumeName(file.name);
    setIsParsingResume(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const config = { headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' } };

      const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/ai/parse-resume`, formData, config);
      if (res.data && res.data.skills) {
        setUploadedResumeSkills(res.data.skills.map(s => s.toLowerCase()));
        setSearchTerm(''); // Clear manual search to show recommendations
      }
    } catch (err) {
      console.error(err);
      alert('Error parsing resume: ' + (err.response?.data?.message || err.message));
    }
    setIsParsingResume(false);
  };

  const candidateSkills = uploadedResumeSkills || profile?.skills?.map(s => s.toLowerCase()) || [];
  const recommendedJobs = jobs.filter(j => 
    (j.requiredSkills || []).some(rs => candidateSkills.includes((rs || '').toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative">
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed top-24 right-6 z-50 animate-in fade-in slide-in-from-top-4">
          <div className="bg-emerald-500/20 border border-emerald-500/50 backdrop-blur-md px-6 py-4 rounded-2xl shadow-sm flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
            <div>
              <h4 className="font-bold text-emerald-100">Success!</h4>
              <p className="text-sm text-emerald-200">{popupMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Search Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold mb-6 text-white tracking-tight">Find Your Next Role</h1>
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row gap-3 bg-[#121212] p-2 rounded-2xl border border-zinc-800 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Job title or company..." 
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-zinc-800/50 border border-transparent focus:bg-zinc-800 focus:border-zinc-800 focus:ring-1 focus:ring-blue-500 transition-all outline-none text-zinc-200 placeholder-zinc-500"
              value={searchInput} 
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (setSearchTerm(searchInput), setLocationSearch(locationInput))}
            />
          </div>
          <div className="relative flex-1">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="City, State, or Remote..." 
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-zinc-800/50 border border-transparent focus:bg-zinc-800 focus:border-zinc-800 focus:ring-1 focus:ring-blue-500 transition-all outline-none text-zinc-200 placeholder-zinc-500"
              value={locationInput} 
              onChange={e => setLocationInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (setSearchTerm(searchInput), setLocationSearch(locationInput))}
            />
          </div>
          <button 
            onClick={() => { setSearchTerm(searchInput); setLocationSearch(locationInput); }}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl text-sm font-bold transition-colors w-full md:w-auto shadow-lg"
          >
            Search
          </button>
        </div>

        {/* Upload CV/Resume Section */}
        <div className="mt-8 flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4">
          <p className="text-zinc-400 text-xs mb-3 font-bold uppercase tracking-widest">Or find matches instantly</p>
          <label className={`cursor-pointer bg-[#121212] hover:bg-zinc-800 border ${isParsingResume ? 'border-blue-500 shadow-none' : 'border-zinc-800 hover:border-blue-500'} px-6 py-3.5 rounded-xl flex items-center gap-3 text-zinc-200 text-sm font-bold transition-all shadow-lg`}>
            {isParsingResume ? (
              <><Sparkles className="w-5 h-5 text-blue-400 animate-pulse" /> Analyzing Document...</>
            ) : uploadedResumeName ? (
              <><FileText className="w-5 h-5 text-blue-400" /> {uploadedResumeName}</>
            ) : (
              <><Upload className="w-5 h-5 text-blue-400" /> Upload CV / Resume</>
            )}
            <input type="file" accept="application/pdf" className="hidden" onChange={handleResumeUpload} disabled={isParsingResume} />
          </label>
        </div>
      </div>

      {/* Recommended Section */}
      {!searchTerm && recommendedJobs.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-6 text-zinc-200 flex items-center gap-2 border-b border-zinc-800 pb-4">
            <Sparkles className="w-5 h-5 text-blue-400" /> 
            {uploadedResumeSkills ? 'Matches based on your CV/Resume' : 'Recommended For You'}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {(uploadedResumeSkills ? recommendedJobs : recommendedJobs.slice(0, 2)).map(job => (
              <div key={job._id} className="glass-card p-6 flex flex-col border border-blue-500/20 bg-zinc-800/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="flex-1 relative z-10">
                  <h3 className="text-xl font-bold mb-2 text-white">{job.title}</h3>
                  <div className="flex items-center gap-2 text-zinc-400 text-sm mb-4">
                    <Building className="w-4 h-4" /> {job.company}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.requiredSkills.map((skill, idx) => (
                      <span key={idx} className="bg-[#121212] px-2 py-1.5 rounded-lg border border-zinc-800 text-xs font-semibold text-zinc-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 mt-4 relative z-10">
                  <button onClick={() => handleSaveJob(job._id)} className="bg-zinc-800 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 p-2.5 rounded-xl transition-colors">
                    <Heart className={`w-5 h-5 ${savedJobIds.includes(job._id) ? 'fill-rose-500 text-rose-500' : 'text-rose-400'}`} />
                  </button>
                  <button onClick={() => handleApply(job._id)} className="flex-1 bg-zinc-800 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 py-2.5 rounded-xl text-sm font-bold transition-colors">
                    Quick Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Jobs / Results */}
      <div>
        <h2 className="text-xl font-bold mb-6 text-zinc-200 border-b border-zinc-800 pb-4">
          {searchTerm ? 'Search Results' : 'All Available Jobs'}
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
        {filteredJobs.map(job => (
          <div key={job._id} className="glass-card p-6 flex flex-col">
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2 text-zinc-100">{job.title}</h3>
              <div className="flex items-center gap-4 text-zinc-400 text-xs font-medium mb-4">
                <span className="flex items-center gap-1"><Building className="w-4 h-4" /> {job.company}</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location || 'Remote'}</span>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2 mb-5">{job.description}</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {job.requiredSkills.map((skill, i) => (
                  <span key={i} className="bg-zinc-800/50 text-zinc-300 border border-zinc-800/50 text-[11px] font-bold px-2 py-1 rounded-md">{skill}</span>
                ))}
              </div>
            </div>

            <div className="mt-auto border-t border-zinc-800 pt-4">
              {matchScores[job._id] ? (
                matchScores[job._id].loading ? (
                  <div className="text-xs text-zinc-500 animate-pulse flex items-center gap-2 font-medium">
                    <Sparkles className="w-4 h-4" /> Analyzing fit...
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                        <Sparkles className="w-4 h-4" /> {matchScores[job._id].score}% AI Match
                      </div>
                      <button onClick={() => handleApply(job._id)} className="bg-blue-600 hover:bg-blue-500 text-white border-none px-5 py-2 rounded-lg text-sm font-bold transition-colors">
                        Apply Now
                      </button>
                    </div>
                    {matchScores[job._id].gap && (
                      <p className="text-xs text-zinc-400 bg-[#121212]/50 p-3 rounded-lg border border-zinc-800">
                        <span className="font-bold text-zinc-300">AI Note: </span>{matchScores[job._id].gap}
                      </p>
                    )}
                    
                    <div className="border-t border-zinc-800 pt-4 mt-4">
                      {coverLetters[job._id]?.text ? (
                        <div className="bg-[#121212]/80 p-4 rounded-xl text-xs text-zinc-300 whitespace-pre-wrap border border-zinc-800">
                          <h4 className="font-bold text-zinc-100 mb-2 flex items-center gap-1"><Sparkles className="w-4 h-4 text-blue-400"/> AI Cover Letter</h4>
                          {coverLetters[job._id].text}
                        </div>
                      ) : (
                        <button 
                          onClick={() => generateCoverLetter(job._id)} 
                          disabled={coverLetters[job._id]?.loading}
                          className="w-full bg-zinc-800 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                        >
                          {coverLetters[job._id]?.loading ? <span className="animate-pulse">Generating...</span> : <><Sparkles className="w-4 h-4" /> Auto-Write Cover Letter</>}
                        </button>
                      )}
                    </div>
                  </div>
                )
              ) : (
                <div className="flex justify-between items-center">
                  <button onClick={() => calculateMatch(job._id)} className="text-blue-400 text-xs font-bold flex items-center gap-1 hover:text-blue-300 transition-colors">
                    <Sparkles className="w-4 h-4" /> Get AI Match Score
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveJob(job._id)} className="bg-zinc-800 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 p-2 rounded-lg transition-colors">
                      <Heart className={`w-4 h-4 ${savedJobIds.includes(job._id) ? 'fill-rose-500 text-rose-500' : 'text-rose-400'}`} />
                    </button>
                    <button onClick={() => handleApply(job._id)} className="glass-button px-5 py-2 rounded-lg text-sm">
                      Quick Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};

export default JobSearch;
