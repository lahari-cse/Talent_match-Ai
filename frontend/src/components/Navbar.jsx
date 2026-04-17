import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Briefcase, User, LogOut, FileText, Menu, X, LayoutDashboard, Search, BookOpen } from 'lucide-react';
import axios from 'axios';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user && user.role === 'candidate') {
        try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/profiles`, config);
          if (res.data && res.data.profileImage) {
            setProfileImage(res.data.profileImage);
          }
        } catch (err) {
          console.error('Error fetching profile image:', err);
        }
      }
    };
    fetchProfile();
  }, [user, isSidebarOpen]);

  const handleLogout = () => {
    logout();
    setIsSidebarOpen(false);
    navigate('/login');
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <>
      {/* Top Navbar */}
      <nav className="bg-black/90 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-40 w-full">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center text-zinc-100">
          <Link to="/" className="text-xl font-bold flex items-center gap-2 tracking-tight">
            <Briefcase className="w-6 h-6 text-blue-500" />
            TalentMatch AI
          </Link>
          
          <div className="flex items-center gap-4">
            {user ? (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-2"
              >
                <span className="font-medium hidden sm:block text-zinc-300">Menu</span>
                <Menu className="w-5 h-5 text-zinc-300" />
              </button>
            ) : (
              <div className="flex gap-4">
                <Link to="/login" className="font-medium text-zinc-300 hover:text-white transition-colors py-2">Log in</Link>
                <Link to="/register" className="bg-white text-black hover:bg-zinc-200 px-5 py-2 rounded-lg font-medium transition-all">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Sidebar Overlay */}
      {isSidebarOpen && user && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={closeSidebar}
          ></div>
          
          {/* Sidebar Panel */}
          <div className="relative w-80 bg-[#0a0a0a] shadow-sm h-full flex flex-col transform transition-transform border-l border-zinc-800">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-700">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-zinc-400" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-zinc-100">{user.name}</p>
                  <p className="text-xs text-zinc-400 capitalize">{user.role}</p>
                </div>
              </div>
              <button onClick={closeSidebar} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            {/* Sidebar Links */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
              <Link 
                to="/dashboard" 
                onClick={closeSidebar}
                className="flex items-center gap-3 px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-all font-medium text-sm"
              >
                <LayoutDashboard className="w-4 h-4" /> Profile
              </Link>
              
              {user.role === 'candidate' && (
                <>
                  <Link 
                    to="/resume-builder" 
                    onClick={closeSidebar}
                    className="flex items-center gap-3 px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-all font-medium text-sm"
                  >
                    <FileText className="w-4 h-4" /> Resume / CV Generator
                  </Link>
                  <Link 
                    to="/jobs" 
                    onClick={closeSidebar}
                    className="flex items-center gap-3 px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-all font-medium text-sm"
                  >
                    <Search className="w-4 h-4" /> Find Jobs
                  </Link>
                  <Link 
                    to="/recommendations" 
                    onClick={closeSidebar}
                    className="flex items-center gap-3 px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-all font-medium text-sm"
                  >
                    <BookOpen className="w-4 h-4" /> Learning Recommendations
                  </Link>
                </>
              )}

              {/* Removed redundant Discover Talent link for recruiter */}
            </div>

            {/* Sidebar Footer */}
            <div className="p-6 border-t border-zinc-800">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-zinc-800 rounded-lg transition-colors font-medium text-sm"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
