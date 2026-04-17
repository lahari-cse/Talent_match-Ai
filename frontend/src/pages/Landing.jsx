import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Sparkles, Brain, Target, ArrowRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-[90vh] flex flex-col justify-center items-center px-6 py-20 bg-black overflow-hidden relative">
      {/* Very subtle grid background for professional dev-tool aesthetic */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>
      
      <div className="max-w-7xl w-full z-10 text-center space-y-10">
        
        <div className="inline-flex items-center gap-2 bg-[#121212] px-4 py-1.5 rounded-full border border-zinc-800 text-sm font-medium text-zinc-300">
          <Sparkles className="w-4 h-4 text-blue-500" />
          The New Standard in Hiring
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-zinc-100 max-w-4xl mx-auto leading-[1.1]">
          Hire smarter. <br/>
          <span className="text-zinc-500">Build faster.</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed">
          The AI-native talent platform that matches the world's best engineers with category-defining companies.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
          <Link to="/register" className="bg-zinc-100 hover:bg-white text-black px-8 py-4 rounded-lg font-medium text-lg transition-colors flex items-center justify-center gap-2 group">
            Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/login" className="bg-[#121212] border border-zinc-800 hover:bg-zinc-900 text-zinc-300 px-8 py-4 rounded-lg font-medium text-lg transition-colors text-center">
            Sign In
          </Link>
        </div>

      </div>

      {/* Feature Cards Below */}
      <div className="max-w-7xl w-full grid md:grid-cols-3 gap-6 mt-32 z-10">
        <div className="bg-[#0a0a0a] border border-zinc-800/50 p-10 rounded-2xl hover:border-zinc-700 transition-colors">
          <Sparkles className="w-6 h-6 mb-8 text-zinc-100" />
          <h3 className="text-2xl font-semibold mb-4 text-zinc-100 tracking-tight">Precision Matching</h3>
          <p className="text-zinc-400 text-base leading-relaxed font-light">Advanced neural networks analyze thousands of data points to find the perfect synergy between candidates and technical requirements.</p>
        </div>
        <div className="bg-[#0a0a0a] border border-zinc-800/50 p-10 rounded-2xl hover:border-zinc-700 transition-colors">
          <Brain className="w-6 h-6 mb-8 text-zinc-100" />
          <h3 className="text-2xl font-semibold mb-4 text-zinc-100 tracking-tight">Intelligent Parsing</h3>
          <p className="text-zinc-400 text-base leading-relaxed font-light">Upload any format. Our AI instantly converts unstructured CV data into normalized, searchable profiles with zero manual entry.</p>
        </div>
        <div className="bg-[#0a0a0a] border border-zinc-800/50 p-10 rounded-2xl hover:border-zinc-700 transition-colors">
          <Target className="w-6 h-6 mb-8 text-zinc-100" />
          <h3 className="text-2xl font-semibold mb-4 text-zinc-100 tracking-tight">Automated Screening</h3>
          <p className="text-zinc-400 text-base leading-relaxed font-light">Conduct autonomous AI-driven technical interviews that assess coding ability, system design, and communication skills.</p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
