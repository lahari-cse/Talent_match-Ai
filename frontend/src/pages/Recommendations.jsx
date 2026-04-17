import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Sparkles, Target, BookOpen, ExternalLink, ChevronRight, Loader2 } from 'lucide-react';

const Recommendations = () => {
  const { user } = useContext(AuthContext);
  const [targetJob, setTargetJob] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState('');

  const fetchRecommendations = async (e) => {
    e.preventDefault();
    if (!targetJob.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      const config = { 
        headers: { Authorization: `Bearer ${user.token}` },
        timeout: 45000 // 45 second timeout for AI responses
      };
      const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/ai/recommend-courses`, { targetJob }, config);
      setRecommendations(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to generate recommendations. Please try again or rephrase your target job.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="glass-card p-8 border border-zinc-800">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">AI Learning Recommendations</h1>
            <p className="text-zinc-400">Get personalized course recommendations based on your profile skills.</p>
          </div>
        </div>

        <form onSubmit={fetchRecommendations} className="mt-8">
          <label className="block text-sm font-bold mb-2 text-zinc-300">What is your target job?</label>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Target className="absolute left-4 top-3.5 w-5 h-5 text-zinc-500" />
              <input 
                type="text" 
                placeholder="e.g. Senior Frontend Developer, Data Scientist..." 
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-black border border-zinc-800 focus:bg-[#121212] focus:border-zinc-800 focus:ring-1 focus:ring-blue-500 transition-all outline-none text-zinc-200 placeholder-zinc-500"
                value={targetJob}
                onChange={(e) => setTargetJob(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg w-full md:w-auto"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</>
              ) : (
                <><Sparkles className="w-5 h-5" /> Generate</>
              )}
            </button>
          </div>
        </form>
        {error && <p className="text-red-400 mt-4 text-sm bg-red-900/20 border border-red-500/30 p-3 rounded-lg">{error}</p>}
      </div>

      {/* Results Section */}
      {recommendations && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          {/* Preparation Guide */}
          <div className="glass-card p-8 border border-zinc-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 relative z-10">
              <Target className="w-5 h-5 text-blue-400" /> Preparation Guide
            </h2>
            <p className="text-zinc-300 leading-relaxed relative z-10">
              {recommendations.preparationGuide}
            </p>
          </div>

          {/* Courses List */}
          <h2 className="text-xl font-bold text-white px-2 flex items-center gap-2 mt-8">
            <BookOpen className="w-5 h-5 text-blue-400" /> Recommended Courses
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {recommendations.courses.map((course, idx) => (
              <div key={idx} className="bg-[#121212] rounded-2xl p-6 border border-zinc-800 hover:border-zinc-800 hover:-translate-y-1 transition-all flex flex-col h-full group shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full">
                    {course.platform}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-zinc-100 mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-zinc-400 text-sm flex-1 mb-6 leading-relaxed">{course.description}</p>
                
                <a 
                  href={`https://www.google.com/search?q=${encodeURIComponent(course.searchQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto w-full bg-zinc-800 hover:bg-blue-600 border border-zinc-800 hover:border-blue-500 text-zinc-200 hover:text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all text-sm"
                >
                  Search Course <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommendations;
