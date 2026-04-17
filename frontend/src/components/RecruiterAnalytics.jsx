import React, { useState, useEffect, useContext } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from 'recharts';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { TrendingUp, Users, Target } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const RecruiterAnalytics = ({ jobs }) => {
  const { user } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllApplications = async () => {
      setLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        let allApps = [];
        for (const job of jobs) {
          const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/jobs/${job._id}/applicants`, config);
          allApps = [...allApps, ...data];
        }
        setApplications(allApps);
      } catch (error) {
        console.error('Error fetching analytics data', error);
      }
      setLoading(false);
    };

    if (jobs.length > 0) {
      fetchAllApplications();
    } else {
      setLoading(false);
    }
  }, [jobs, user.token]);

  if (loading) return <div className="text-center text-zinc-400 mt-10">Loading analytics...</div>;
  if (jobs.length === 0) return <div className="text-center text-zinc-500 mt-10">Post some jobs to see analytics!</div>;

  // Filter out 'Saved' applications (Wishlist) as they are private to candidate
  const activeApplications = applications.filter(a => a.status !== 'Saved');

  // Data processing
  const totalApplicants = activeApplications.length;
  const averageMatchScore = totalApplicants > 0 
    ? Math.round(activeApplications.reduce((acc, curr) => acc + (curr.aiMatchScore || 0), 0) / totalApplicants) 
    : 0;

  // Match score distribution (Bar Chart)
  const scoreData = [
    { name: '0-20%', count: activeApplications.filter(a => a.aiMatchScore <= 20).length },
    { name: '21-40%', count: activeApplications.filter(a => a.aiMatchScore > 20 && a.aiMatchScore <= 40).length },
    { name: '41-60%', count: activeApplications.filter(a => a.aiMatchScore > 40 && a.aiMatchScore <= 60).length },
    { name: '61-80%', count: activeApplications.filter(a => a.aiMatchScore > 60 && a.aiMatchScore <= 80).length },
    { name: '81-100%', count: activeApplications.filter(a => a.aiMatchScore > 80).length },
  ];

  // Job Popularity (Pie Chart)
  const jobPopularity = jobs.map(job => ({
    name: job.title.substring(0, 15) + (job.title.length > 15 ? '...' : ''),
    value: activeApplications.filter(a => a.job === job._id).length
  })).filter(j => j.value > 0);

  // Status Distribution (Bar Chart)
  const statusCounts = activeApplications.reduce((acc, curr) => {
    acc[curr.status || 'Applied'] = (acc[curr.status || 'Applied'] || 0) + 1;
    return acc;
  }, {});
  
  // Force a logical funnel order
  const orderedStatuses = ['Applied', 'Interviewing', 'Offer', 'Rejected'];
  const statusData = orderedStatuses.map(status => ({
    name: status,
    count: statusCounts[status] || 0
  }));

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#121212] border border-zinc-800 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="bg-blue-500/20 p-4 rounded-xl border border-blue-500/30 text-blue-500">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-zinc-400 text-sm font-bold uppercase tracking-wider">Total Applicants</p>
            <h3 className="text-3xl font-bold text-white">{totalApplicants}</h3>
          </div>
        </div>
        <div className="bg-[#121212] border border-zinc-800 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="bg-emerald-500/20 p-4 rounded-xl border border-emerald-500/30 text-emerald-500">
            <Target className="w-8 h-8" />
          </div>
          <div>
            <p className="text-zinc-400 text-sm font-bold uppercase tracking-wider">Avg AI Match Score</p>
            <h3 className="text-3xl font-bold text-white">{averageMatchScore}%</h3>
          </div>
        </div>
        <div className="bg-[#121212] border border-zinc-800 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="bg-purple-500/20 p-4 rounded-xl border border-purple-500/30 text-purple-500">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <p className="text-zinc-400 text-sm font-bold uppercase tracking-wider">Active Jobs</p>
            <h3 className="text-3xl font-bold text-white">{jobs.length}</h3>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#121212] border border-zinc-800 p-6 rounded-3xl shadow-sm">
          <h3 className="text-lg font-bold text-white mb-6 border-b border-zinc-800 pb-2">Candidate Match Quality</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#121212] border border-zinc-800 p-6 rounded-3xl shadow-sm">
          <h3 className="text-lg font-bold text-white mb-6 border-b border-zinc-800 pb-2">Applications by Job</h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            {jobPopularity.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={jobPopularity} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={5} dataKey="value">
                    {jobPopularity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-zinc-500">No application data yet.</p>
            )}
          </div>
        </div>

        <div className="bg-[#121212] border border-zinc-800 p-6 rounded-3xl shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-white mb-6 border-b border-zinc-800 pb-2">Pipeline Funnel</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }} />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterAnalytics;
