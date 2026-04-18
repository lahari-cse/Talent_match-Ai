import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { User, Mail, Award, CheckCircle, Bell, AlertTriangle, Upload, FileText, Trash2 } from 'lucide-react';
import KanbanBoard from '../components/KanbanBoard';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [myApps, setMyApps] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const profileRes = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/profiles`, config);
        setProfile(profileRes.data);

        // Fetch applications to filter out jobs already applied to
        let myAppJobIds = [];
        try {
          const appsRes = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/jobs/my-applications`, config);
          setMyApps(appsRes.data);
          myAppJobIds = appsRes.data.map(app => app.job?._id || app.job);
        } catch (e) {
          console.error("Error fetching applications", e);
        }

        // Fetch jobs for notifications
        try {
          const jobsRes = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/jobs`);
          // Only consider active jobs with a deadline that the user hasn't applied to yet
          const activeJobs = jobsRes.data.filter(j => j.isActive && j.deadline && !myAppJobIds.includes(j._id));
          
          const newNotifications = [];
          const now = new Date();
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 2); // Within next 48 hours
          
          activeJobs.forEach(job => {
            const jobDeadline = new Date(job.deadline);
            if (jobDeadline > now && jobDeadline <= tomorrow) {
              newNotifications.push({
                id: job._id,
                message: `Deadline approaching for ${job.title} at ${job.company}! Apply before ${jobDeadline.toLocaleDateString()}`,
                job: job
              });
            }
          });
          setNotifications(newNotifications);
        } catch (e) {
          console.error("Error fetching jobs for notifications", e);
        }
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      }
    };
    if (user) fetchDashboardData();
  }, [user]);

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('resume', file);
      const config = { headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' } };

      const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/profiles/upload-resume`, formData, config);
      if (res.data && res.data.resumeUrl) {
        setProfile(prev => ({ ...prev, resumeUrl: res.data.resumeUrl }));
        alert('CV/Resume attached successfully!');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading CV/Resume');
    }
  };

  const handleResumeRemove = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/profiles`, { resumeUrl: null }, config);
      setProfile(prev => ({ ...prev, resumeUrl: null }));
    } catch (err) {
      console.error("Remove Error:", err.response?.data || err.message);
      alert('Error removing CV/Resume: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleResumeDownload = async () => {
    try {
      const config = { 
        headers: { Authorization: `Bearer ${user.token}` },
        responseType: 'blob' 
      };
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/profiles/download-resume`, config);
      
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'resume.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (err) {
      console.error(err);
      alert('Error downloading CV/Resume');
    }
  };

  if (!profile) return <div className="text-center mt-20">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="glass-card p-10 flex flex-col items-center text-center gap-6">
        <div className="w-48 h-48 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 border-4 border-zinc-800 shadow-sm overflow-hidden">
          <User className="w-24 h-24" />
        </div>
        
        <div>
          <h1 className="text-5xl font-bold mb-3 text-white tracking-tight">{user.name}</h1>
          <div className="flex items-center justify-center gap-2 text-zinc-400 mb-8 text-base font-medium">
            <Mail className="w-5 h-5" /> {user.email}
          </div>
          
          <div className="flex flex-col items-center gap-4">
            {!profile.resumeUrl ? (
              <label className="cursor-pointer bg-zinc-800 hover:bg-zinc-800 border border-zinc-500 px-6 py-3.5 rounded-xl flex items-center justify-center gap-3 text-zinc-200 text-sm font-bold transition-all shadow-lg hover:border-blue-500 w-64">
                <Upload className="w-5 h-5 text-blue-400" /> Attach CV / Resume
                <input type="file" accept="application/pdf" className="hidden" onChange={handleResumeUpload} />
              </label>
            ) : (
              <div className="flex gap-2 w-64">
                <button onClick={handleResumeDownload} className="flex-1 flex items-center justify-center gap-2 text-sm font-bold text-blue-400 bg-blue-500/10 px-4 py-3 rounded-xl border border-blue-500/20 hover:bg-blue-500/20 transition-all">
                  <FileText className="w-4 h-4" /> View Resume
                </button>
                <button onClick={handleResumeRemove} className="flex-1 flex items-center justify-center gap-2 text-sm font-bold text-red-400 bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-all">
                  <Trash2 className="w-4 h-4" /> Remove
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card p-6 border-l-4 border-l-blue-500 relative">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-bold text-white tracking-tight">Notification Center</h2>
          {notifications.length > 0 && <span className="bg-blue-500/20 text-blue-400 px-2.5 py-0.5 rounded-full text-xs font-bold">{notifications.length}</span>}
        </div>
        
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map(note => (
              <div key={note.id} className="bg-[#121212] p-4 rounded-xl border border-zinc-800 flex justify-between items-center hover:border-zinc-700 transition-colors shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-zinc-100 font-bold text-sm mb-1">{note.message}</h4>
                    <p className="text-xs text-zinc-500 font-medium">Job: {note.job.title} • {note.job.company}</p>
                  </div>
                </div>
                <Link to="/jobs" className="text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ml-4 border border-blue-500/20 hover:border-blue-500/40">
                  View Job
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#121212] p-6 rounded-xl border border-zinc-800 text-center text-zinc-400 shadow-sm">
            You have no new notifications.
          </div>
        )}
      </div>

      {/* Application Tracking Kanban */}
      <div className="glass-card p-8">
        <h2 className="text-2xl font-bold mb-6 text-white border-b border-zinc-800 pb-4">Application Pipeline</h2>
        <KanbanBoard initialApps={myApps} />
      </div>
    </div>
  );
};

export default Dashboard;
