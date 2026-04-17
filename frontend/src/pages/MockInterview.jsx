import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { ArrowLeft, Send, CheckCircle, Video, Mic, StopCircle } from 'lucide-react';

const MockInterview = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [interviewActive, setInterviewActive] = useState(false);
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startInterview = async () => {
    setIsLoading(true);
    setInterviewActive(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/mock-interview`, {
        jobId,
        history: [],
        latestAnswer: ''
      }, config);

      setMessages([
        { role: 'assistant', content: response.data.nextQuestion }
      ]);
    } catch (error) {
      console.error(error);
      alert('Error starting interview.');
      setInterviewActive(false);
    }
    setIsLoading(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || questionCount >= 5) return;

    const userMessage = { role: 'user', content: input };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/mock-interview`, {
        jobId,
        history: newHistory.map(m => ({ role: m.role, content: m.content })),
        latestAnswer: userMessage.content
      }, config);

      setScore(prev => prev + response.data.score);
      setQuestionCount(prev => prev + 1);

      setMessages(prev => [
        ...prev, 
        { role: 'assistant', content: response.data.feedback, type: 'feedback' },
        { role: 'assistant', content: response.data.nextQuestion }
      ]);

    } catch (error) {
      console.error(error);
      alert('Error processing answer.');
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors font-bold">
        <ArrowLeft className="w-5 h-5" /> Back to Dashboard
      </button>

      <div className="glass-card flex flex-col h-[75vh] overflow-hidden border border-zinc-800 shadow-sm rounded-3xl">
        {/* Header */}
        <div className="p-6 bg-[#121212] border-b border-zinc-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Video className="w-6 h-6 text-blue-500" />
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">AI Mock Interview</h1>
              <p className="text-zinc-400 text-sm font-medium">Practicing for Application ID: {jobId.substring(0, 8)}</p>
            </div>
          </div>
          {interviewActive && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold">Progress</p>
                <p className="text-blue-400 font-bold">{questionCount} / 5 Questions</p>
              </div>
              <button onClick={() => setInterviewActive(false)} className="bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-2 rounded-xl font-bold flex items-center gap-2 border border-red-500/20 transition-colors">
                <StopCircle className="w-4 h-4" /> End
              </button>
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-black/50">
          {!interviewActive && messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20">
                <Mic className="w-12 h-12 text-blue-500" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-3">Ready for your interview?</h2>
                <p className="text-zinc-400 max-w-md mx-auto leading-relaxed">The AI will act as a hiring manager. You will be asked 5 questions based on the job description and your profile. You will receive real-time grading.</p>
              </div>
              <button onClick={startInterview} disabled={isLoading} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold shadow-lg transition-all shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50">
                {isLoading ? 'Connecting to AI...' : 'Start Interview Now'}
              </button>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.type === 'feedback' ? (
                    <div className="max-w-[85%] p-4 rounded-2xl text-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-200/90 rounded-tl-sm flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="block font-bold text-emerald-500 mb-1">Feedback</span>
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    <div className={`max-w-[85%] p-5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-zinc-800 border border-zinc-800 text-zinc-200 rounded-tl-sm font-medium'}`}>
                      {msg.content}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] p-4 rounded-2xl text-sm bg-zinc-800 border border-zinc-800 text-zinc-400 rounded-tl-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              )}
              {questionCount >= 5 && !isLoading && (
                <div className="flex justify-center my-8">
                  <div className="bg-zinc-800 border border-zinc-800 p-6 rounded-2xl text-center shadow-sm">
                    <h3 className="text-2xl font-bold text-white mb-2">Interview Complete!</h3>
                    <p className="text-zinc-400 mb-4">You have answered 5 questions.</p>
                    <div className="text-5xl font-bold text-blue-400">{Math.round(score / 5)}<span className="text-xl text-zinc-500">/10</span></div>
                    <p className="text-xs uppercase tracking-widest font-bold text-zinc-500 mt-2">Average Score</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        {interviewActive && questionCount < 5 && (
          <div className="p-4 bg-[#121212] border-t border-zinc-800">
            <form onSubmit={handleSend} className="flex gap-3">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type your answer here..." 
                className="flex-1 bg-black border border-zinc-800 rounded-xl px-5 py-4 text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors placeholder-zinc-500 shadow-inner"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-xl transition-colors disabled:opacity-50 font-bold flex items-center gap-2 shadow-lg"
              >
                <Send className="w-5 h-5" /> Send Answer
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockInterview;
