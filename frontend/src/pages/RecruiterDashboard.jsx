import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Plus, Users, Briefcase, BarChart2, Search } from 'lucide-react';
import RecruiterAnalytics from '../components/RecruiterAnalytics';

const RecruiterDashboard = () => {
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' or 'talent'
  const [talentSearch, setTalentSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [formData, setFormData] = useState({ title: '', company: '', location: '', description: '', requiredSkills: '', salaryRange: '', deadline: '' });

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [jobsRes, profilesRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/jobs`),
        axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/profiles/all`, config)
      ]);
      const myJobs = jobsRes.data.filter(job => job.recruiter && job.recruiter._id === user._id);
      setJobs(myJobs);
      setProfiles(profilesRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { if (user) fetchData(); }, [user]);

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/jobs`, {
        ...formData,
        requiredSkills: formData.requiredSkills.split(',').map(s => s.trim())
      }, config);
      setShowForm(false);
      setFormData({ title: '', company: '', location: '', description: '', requiredSkills: '', salaryRange: '', deadline: '' });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleViewApplicants = async (job) => {
    setSelectedJob(job);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/jobs/${job._id}/applicants`, config);
      setApplicants(data);
    } catch (error) {
      console.error('Error fetching applicants:', error);
    }
  };

  const handleUpdateStatus = async (applicationId, status) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/jobs/applications/${applicationId}/status`, { status }, config);
      setApplicants(applicants.map(app => app._id === applicationId ? { ...app, status } : app));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center text-white">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recruiter Dashboard</h1>
          <p className="text-zinc-400 mt-1">Manage your job postings and find top talent.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-[#121212] p-1 rounded-xl border border-zinc-800 flex shadow-sm">
            <button onClick={() => setActiveTab('jobs')} className={`px-6 py-2 rounded-lg font-bold transition-colors ${activeTab === 'jobs' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'}`}>
              My Jobs
            </button>
            <button onClick={() => setActiveTab('talent')} className={`px-6 py-2 rounded-lg font-bold transition-colors ${activeTab === 'talent' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'}`}>
              Discover Talent
            </button>
            <button onClick={() => setActiveTab('analytics')} className={`px-6 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 ${activeTab === 'analytics' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'}`}>
              <BarChart2 className="w-4 h-4" /> Analytics
            </button>
          </div>
          {activeTab === 'jobs' && (
            <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg">
              <Plus className="w-5 h-5" /> Post New Job
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="bg-[#121212] border border-zinc-800 p-8 rounded-3xl animate-in fade-in slide-in-from-top-4 text-white shadow-sm">
          <h2 className="text-xl font-bold mb-6 tracking-tight">Create Job Posting</h2>
          <form onSubmit={handlePostJob} className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold mb-2 text-zinc-400 uppercase tracking-wider">Job Title</label>
              <input type="text" className="w-full p-3.5 rounded-xl bg-black border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-zinc-200 transition-all" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            </div>
            <div>
              <label className="block text-xs font-bold mb-2 text-zinc-400 uppercase tracking-wider">Company Name</label>
              <input type="text" className="w-full p-3.5 rounded-xl bg-black border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-zinc-200 transition-all" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} required />
            </div>
            <div>
              <label className="block text-xs font-bold mb-2 text-zinc-400 uppercase tracking-wider">Location</label>
              <input type="text" className="w-full p-3.5 rounded-xl bg-black border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-zinc-200 transition-all" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold mb-2 text-zinc-400 uppercase tracking-wider">Required Skills (comma separated)</label>
              <input type="text" className="w-full p-3.5 rounded-xl bg-black border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-zinc-200 transition-all" placeholder="React, Node.js, Python" value={formData.requiredSkills} onChange={e => setFormData({...formData, requiredSkills: e.target.value})} required />
            </div>
            <div>
              <label className="block text-xs font-bold mb-2 text-zinc-400 uppercase tracking-wider">Application Deadline</label>
              <input type="date" className="w-full p-3.5 rounded-xl bg-black border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-zinc-200 transition-all" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold mb-2 text-zinc-400 uppercase tracking-wider">Job Description</label>
              <textarea className="w-full p-3.5 rounded-xl h-32 bg-black border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-zinc-200 transition-all" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
            </div>
            <div className="md:col-span-2 flex justify-end gap-4 mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl font-bold text-zinc-400 hover:text-white transition-colors">Cancel</button>
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-lg">Publish Job</button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map(job => (
            <div key={job._id} className="bg-[#121212] border border-zinc-800 p-6 rounded-2xl hover:border-zinc-800 hover:-translate-y-1 transition-all cursor-pointer group text-white shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Briefcase className="w-6 h-6" />
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">Active</span>
              </div>
              <h3 className="font-bold text-xl mb-1 tracking-tight">{job.title}</h3>
              <p className="text-zinc-400 text-sm mb-4 font-medium">{job.company} • {job.location}</p>
              {job.deadline && <p className="text-zinc-500 text-xs mb-4">Deadline: {new Date(job.deadline).toLocaleDateString()}</p>}
              <div 
                className="flex items-center justify-center gap-2 text-sm font-bold text-zinc-300 bg-zinc-800/50 hover:bg-blue-600 hover:text-white border border-zinc-800 hover:border-blue-500 py-3 rounded-xl transition-colors mt-4"
                onClick={() => handleViewApplicants(job)}
              >
                <Users className="w-4 h-4" /> View Applicants
              </div>
            </div>
          ))}
          {jobs.length === 0 && !showForm && (
            <div className="col-span-full text-center py-20 text-zinc-500 bg-[#121212]/50 border border-zinc-800 rounded-3xl border-dashed">
              You haven't posted any jobs yet. Click "Post New Job" to get started.
            </div>
          )}
        </div>
      )}

      {activeTab === 'talent' && (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <div className="relative max-w-xl mx-auto mb-10">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search talent by name, email, or skills..." 
              value={talentSearch}
              onChange={(e) => setTalentSearch(e.target.value)}
              className="w-full bg-[#121212] border border-zinc-800 focus:border-blue-500 rounded-full py-4 pl-12 pr-6 text-zinc-200 outline-none transition-all shadow-lg text-sm"
            />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(profiles || []).filter(p => {
              const search = (talentSearch || '').toLowerCase();
              const nameMatch = (p?.user?.name || '').toLowerCase().includes(search);
              const emailMatch = (p?.user?.email || '').toLowerCase().includes(search);
              const skillsMatch = Array.isArray(p?.skills) ? p.skills.some(s => (s || '').toLowerCase().includes(search)) : false;
              return nameMatch || emailMatch || skillsMatch;
            }).map(profile => (
            <div key={profile._id} className="bg-[#121212] border border-zinc-800 p-8 rounded-3xl flex flex-col items-center text-center hover:border-zinc-800 hover:-translate-y-1 transition-all shadow-sm">
              <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 border-4 border-zinc-800 shadow-sm overflow-hidden mb-5">
                {profile.profileImage ? (
                  <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Users className="w-12 h-12" />
                )}
              </div>
              <h3 className="font-bold text-xl text-white tracking-tight mb-1">{profile.user?.name || 'Unknown Candidate'}</h3>
              <p className="text-zinc-400 text-sm font-medium mb-6">{profile.user?.email}</p>
              
              <button 
                onClick={() => setViewingProfile({ user: profile.user, profile: profile })}
                className="w-full mt-auto glass-button py-3 rounded-xl text-sm font-bold"
              >
                View Profile
              </button>
            </div>
          ))}
            {(profiles || []).filter(p => {
              const search = (talentSearch || '').toLowerCase();
              const nameMatch = (p?.user?.name || '').toLowerCase().includes(search);
              const emailMatch = (p?.user?.email || '').toLowerCase().includes(search);
              const skillsMatch = Array.isArray(p?.skills) ? p.skills.some(s => (s || '').toLowerCase().includes(search)) : false;
              return nameMatch || emailMatch || skillsMatch;
            }).length === 0 && (
              <div className="col-span-full text-center py-20 text-zinc-500 bg-[#121212]/50 border border-zinc-800 rounded-3xl border-dashed">
                {talentSearch ? 'No talent found matching your search.' : 'No talent profiles available to discover yet.'}
              </div>
            )}
          </div>
        </div>
      )}

      {selectedJob && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl p-8 relative shadow-sm">
            <button onClick={() => setSelectedJob(null)} className="absolute top-6 right-6 text-zinc-500 hover:text-white bg-zinc-800 hover:bg-zinc-800 rounded-full p-2 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <h2 className="text-3xl font-bold mb-2 text-white tracking-tight">Applicants for {selectedJob.title}</h2>
            <p className="text-zinc-400 mb-8 font-medium">{applicants.length} candidates applied to this position.</p>
            
            <div className="space-y-6">
              {applicants.map(app => (
                <div key={app._id} className="bg-zinc-800/50 border border-zinc-800 p-6 rounded-2xl flex flex-col md:flex-row gap-6 hover:border-zinc-500 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-white tracking-tight">{app.candidate?.name || 'Unknown Candidate'}</h3>
                      <div className="bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-full text-xs uppercase tracking-widest font-bold border border-blue-500/20">
                        {app.aiMatchScore}% AI Match
                      </div>
                    </div>
                    <p className="text-sm text-zinc-400 mb-4 font-medium">{app.candidate?.email} {app.profile?.phone ? `• ${app.profile.phone}` : ''}</p>
                    
                    {app.profile && (
                      <div className="mb-4 space-y-3">
                        {app.profile.skills && app.profile.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {app.profile.skills.map((skill, idx) => (
                              <span key={idx} className="bg-black text-zinc-300 border border-zinc-800 px-2 py-1 rounded-md text-xs font-bold">{skill}</span>
                            ))}
                          </div>
                        )}
                        {app.profile.aiSummary && (
                          <p className="text-sm text-zinc-300 italic border-l-2 border-blue-500 pl-4 bg-[#121212]/50 py-2 pr-2 rounded-r-lg leading-relaxed">"{app.profile.aiSummary}"</p>
                        )}
                      </div>
                    )}

                    {app.aiGapAnalysis && (
                      <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl mb-4 text-sm text-yellow-200/90 leading-relaxed">
                        <span className="font-bold text-yellow-500 block mb-1">AI Gap Analysis:</span> {app.aiGapAnalysis}
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="mt-4 flex items-center gap-3">
                      <span className="text-sm font-bold text-zinc-500 uppercase">Status:</span>
                      <span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full border ${
                        app.status === 'Interviewing' || app.status === 'Offer' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        app.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                      }`}>
                        {app.status || 'Applied'}
                      </span>
                    </div>

                  </div>
                  <div className="md:w-48 flex flex-col justify-center gap-3">
                    {app.profile ? (
                      <button 
                        onClick={() => setViewingProfile({ user: app.candidate, profile: app.profile, application: app })}
                        className="w-full py-2.5 text-sm font-bold bg-black hover:bg-blue-600 text-zinc-300 hover:text-white border border-zinc-800 hover:border-blue-500 rounded-xl transition-colors"
                      >
                        View Full Profile
                      </button>
                    ) : (
                      <span className="text-xs text-zinc-500 italic text-center">No profile provided</span>
                    )}

                    {(!app.status || app.status === 'Applied') && (
                      <div className="flex gap-2 w-full mt-2">
                        <button 
                          onClick={() => handleUpdateStatus(app._id, 'Interviewing')}
                          className="flex-1 py-2 text-xs font-bold bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white border border-emerald-500/20 hover:border-emerald-500 rounded-xl transition-all"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(app._id, 'Rejected')}
                          className="flex-1 py-2 text-xs font-bold bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 hover:border-red-500 rounded-xl transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {applicants.length === 0 && (
                <div className="text-center py-10 text-zinc-500 italic bg-[#121212]/50 border border-zinc-800 rounded-2xl border-dashed">No applications received yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {viewingProfile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-md rounded-3xl p-10 relative text-white shadow-sm flex flex-col items-center text-center">
            <button onClick={() => setViewingProfile(null)} className="absolute top-6 right-6 text-zinc-500 hover:text-white bg-zinc-800 hover:bg-zinc-800 rounded-full p-2 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            
            <div className="w-32 h-32 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 border-4 border-zinc-800 shadow-sm overflow-hidden mb-6">
              {viewingProfile.profile?.profileImage ? (
                <img src={viewingProfile.profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <Users className="w-16 h-16" />
              )}
            </div>
            
            <h2 className="text-3xl font-bold mb-2 tracking-tight">{viewingProfile.user?.name || 'Unknown Candidate'}</h2>
            <p className="text-zinc-400 text-lg mb-8">{viewingProfile.user?.email || 'No email available'}</p>
            
            {viewingProfile.profile?.resumeUrl ? (
              <a href={viewingProfile.profile.resumeUrl} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg shadow-none">
                <Briefcase className="w-5 h-5" /> View Attached Resume
              </a>
            ) : (
              <div className="w-full bg-zinc-800/50 text-zinc-400 p-4 rounded-xl border border-zinc-800/50 text-sm font-medium">
                No resume attached
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'talent' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-4 text-zinc-500"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              placeholder="Search candidates by skill (e.g. React, Python)..." 
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#121212] border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-zinc-200 transition-all shadow-sm"
              value={talentSearch}
              onChange={e => setTalentSearch(e.target.value)}
            />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.filter(p => !talentSearch || p.skills.some(s => s.toLowerCase().includes(talentSearch.toLowerCase()))).map(profile => (
              <div key={profile._id} className="bg-[#121212] border border-zinc-800 p-6 rounded-3xl flex flex-col hover:border-zinc-800 transition-colors shadow-lg">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-bold text-xl text-blue-400">
                    {profile.user?.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white tracking-tight">{profile.user?.name}</h3>
                    <p className="text-zinc-400 text-sm font-medium">{profile.user?.email}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-5">
                  {profile.skills?.slice(0, 5).map((skill, idx) => (
                    <span key={idx} className="bg-zinc-800 border border-zinc-800 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest text-zinc-300">
                      {skill}
                    </span>
                  ))}
                  {profile.skills?.length > 5 && <span className="text-zinc-500 text-[10px] font-bold uppercase py-1">+{profile.skills.length - 5} more</span>}
                </div>
                {profile.aiSummary && (
                  <p className="text-zinc-400 text-sm italic line-clamp-3 mb-6 flex-1 leading-relaxed">
                    "{profile.aiSummary}"
                  </p>
                )}
                <button 
                  onClick={() => setViewingProfile({ user: profile.user, profile: profile })}
                  className="w-full bg-zinc-800 hover:bg-blue-600 border border-zinc-800 hover:border-blue-500 text-zinc-200 hover:text-white font-bold py-3 rounded-xl text-sm transition-colors mt-auto"
                >
                  View Full Profile
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {activeTab === 'analytics' && (
        <RecruiterAnalytics jobs={jobs} />
      )}
    </div>
  );
};

export default RecruiterDashboard;
