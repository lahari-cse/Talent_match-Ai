import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Sparkles, Save, Download, Upload, Plus, Trash2, Camera } from 'lucide-react';
import { usePDF, PDFViewer, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#ffffff' },
  headerContainer: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, borderBottomWidth: 2, borderBottomColor: '#1e293b', borderBottomStyle: 'solid', paddingBottom: 15 },
  profileImage: { width: 80, height: 80, objectFit: 'cover', borderRadius: 4 },
  headerText: { flex: 1, paddingRight: 20 },
  name: { fontSize: 28, fontWeight: 'bold', marginBottom: 6, color: '#0f172a' },
  contact: { fontSize: 10, color: '#475569', marginBottom: 4 },
  section: { marginTop: 15, marginBottom: 10 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#1e293b', marginBottom: 8, letterSpacing: 1, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', borderBottomStyle: 'solid', paddingBottom: 4 },
  text: { fontSize: 10, lineHeight: 1.6, color: '#334155' },
  itemContainer: { marginBottom: 12 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  itemTitle: { fontSize: 11, fontWeight: 'bold', color: '#0f172a' },
  itemDate: { fontSize: 9, color: '#64748b' },
  itemSubtitle: { fontSize: 10, color: '#475569', fontStyle: 'italic', marginBottom: 4 },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  skillItem: { fontSize: 9, color: '#334155', backgroundColor: '#f1f5f9', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4, marginRight: 5, marginBottom: 5 }
});

const ResumePDF = ({ data, user, experienceLevel }) => {
  const SummarySection = data.aiSummary ? (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>PROFESSIONAL SUMMARY</Text>
      <Text style={styles.text}>{data.aiSummary}</Text>
    </View>
  ) : null;

  const ExperienceSection = data.experience && data.experience.length > 0 ? (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>EXPERIENCE</Text>
      {data.experience.map((exp, i) => (
        <View key={i} style={styles.itemContainer}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle}>{exp.title} at {exp.company}</Text>
            <Text style={styles.itemDate}>{exp.duration}</Text>
          </View>
          <Text style={styles.text}>{exp.description}</Text>
        </View>
      ))}
    </View>
  ) : null;

  const EducationSection = data.education && data.education.length > 0 ? (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>EDUCATION</Text>
      {data.education.map((edu, i) => (
        <View key={i} style={styles.itemContainer}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle}>{edu.degree}</Text>
            <Text style={styles.itemDate}>{edu.year}</Text>
          </View>
          <Text style={styles.itemSubtitle}>{edu.institution}</Text>
        </View>
      ))}
    </View>
  ) : null;

  const SkillsSection = data.skills && data.skills.length > 0 ? (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>SKILLS</Text>
      <View style={styles.skillsContainer}>
        {typeof data.skills === 'string' 
          ? data.skills.split(',').filter(skill => skill.trim()).map((skill, i) => (
              <Text key={i} style={styles.skillItem}>{skill.trim()}</Text>
            )) 
          : data.skills.filter(skill => typeof skill === 'string' && skill.trim()).map((skill, i) => (
              <Text key={i} style={styles.skillItem}>{skill.trim()}</Text>
            ))}
      </View>
    </View>
  ) : null;

  const HobbiesSection = data.hobbies && data.hobbies.length > 0 ? (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>HOBBIES</Text>
      <Text style={styles.text}>{typeof data.hobbies === 'string' ? data.hobbies : data.hobbies.join(', ')}</Text>
    </View>
  ) : null;

  const ProjectsSection = data.projects && data.projects.length > 0 ? (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>PROJECTS</Text>
      {data.projects.map((proj, i) => (
        <View key={i} style={styles.itemContainer}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle}>{proj.title}</Text>
          </View>
          <Text style={styles.text}>{proj.description}</Text>
        </View>
      ))}
    </View>
  ) : null;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerContainer}>
          <View style={styles.headerText}>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.contact}>
              {user?.email} {data.phone ? `• ${data.phone}` : ''}
            </Text>
            <Text style={styles.contact}>
              {data.links?.linkedin ? `LinkedIn: ${data.links.linkedin} ` : ''}
              {data.links?.github ? `• GitHub: ${data.links.github} ` : ''}
              {data.links?.portfolio ? `• Portfolio: ${data.links.portfolio}` : ''}
            </Text>
          </View>
          {/* Removed profileImage from PDF to prevent HTTP fetch failures that corrupt the generated PDF Blob */}
        </View>
        
        {SummarySection}

        {experienceLevel === 'experienced' ? (
          <View>
            {ExperienceSection}
            {ProjectsSection}
            {SkillsSection}
            {EducationSection}
            {HobbiesSection}
          </View>
        ) : (
          <View>
            {ProjectsSection}
            {EducationSection}
            {SkillsSection}
            {HobbiesSection}
            {ExperienceSection}
          </View>
        )}
      </Page>
    </Document>
  );
};

const ResumeBuilder = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState({ 
    phone: '', 
    skills: '', 
    hobbies: '',
    aiSummary: '',
    links: { github: '', linkedin: '', portfolio: '' },
    education: [],
    experience: [],
    projects: [],
    profileImage: null,
    resumeUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [experienceLevel, setExperienceLevel] = useState('fresher');

  const [pdfInstance, updatePdfInstance] = usePDF({ document: <ResumePDF data={data} user={user} experienceLevel={experienceLevel} /> });

  const handleNativeDownload = () => {
    if (!pdfInstance.blob) return;
    const reader = new FileReader();
    reader.readAsDataURL(pdfInstance.blob);
    reader.onloadend = () => {
      const base64data = reader.result;
      
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/ai/echo-pdf`;
      form.target = '_blank'; // Prevent main page from reloading
      
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'pdfBase64';
      input.value = base64data;
      form.appendChild(input);

      const nameInput = document.createElement('input');
      nameInput.type = 'hidden';
      nameInput.name = 'filename';
      nameInput.value = experienceLevel === 'experienced' ? "cv.pdf" : "resume.pdf";
      form.appendChild(nameInput);
      
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    };
  };

  useEffect(() => {
    updatePdfInstance(<ResumePDF data={data} user={user} experienceLevel={experienceLevel} />);
  }, [data, user, experienceLevel, updatePdfInstance]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/profiles`, config);
        if (res.data) {
          setData({
            phone: res.data.phone || '',
            skills: res.data.skills ? res.data.skills.join(', ') : '',
            hobbies: res.data.hobbies ? res.data.hobbies.join(', ') : '',
            aiSummary: res.data.aiSummary || '',
            links: res.data.links || { github: '', linkedin: '', portfolio: '' },
            education: res.data.education || [],
            experience: res.data.experience || [],
            profileImage: res.data.profileImage || null,
            resumeUrl: res.data.resumeUrl || ''
          });
          setIsEditing(false);
        }
      } catch (err) { console.error(err); }
    };
    if (user) fetchProfile();
  }, [user]);

  const handleSave = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/profiles`, {
        ...data,
        skills: typeof data.skills === 'string' ? data.skills.split(',').map(s => s.trim()).filter(s => s) : data.skills,
        hobbies: typeof data.hobbies === 'string' ? data.hobbies.split(',').map(s => s.trim()).filter(s => s) : data.hobbies
      }, config);
      alert('Profile saved successfully!');
      setIsEditing(false);
    } catch (err) { console.error(err); }
  };





  const handleEnhance = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const profileData = { 
        skills: typeof data.skills === 'string' ? data.skills.split(',').map(s => s.trim()) : data.skills, 
        experience: data.experience, 
        education: data.education 
      };
      const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/ai/enhance-summary`, { profileData }, config);
      setData({ ...data, aiSummary: res.data.summary });
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const addEducation = () => setData({ ...data, education: [...data.education, { degree: '', institution: '', year: '' }] });
  const updateEducation = (index, field, value) => {
    const newEdu = [...data.education];
    newEdu[index][field] = value;
    setData({ ...data, education: newEdu });
  };
  const removeEducation = (index) => setData({ ...data, education: data.education.filter((_, i) => i !== index) });

  const addExperience = () => setData({ ...data, experience: [...data.experience, { title: '', company: '', duration: '', description: '' }] });
  const updateExperience = (index, field, value) => {
    const newExp = [...data.experience];
    newExp[index][field] = value;
    setData({ ...data, experience: newExp });
  };
  const removeExperience = (index) => setData({ ...data, experience: data.experience.filter((_, i) => i !== index) });

  const addProject = () => setData({ ...data, projects: [...(data.projects || []), { title: '', description: '' }] });
  const updateProject = (index, field, value) => {
    const newProj = [...(data.projects || [])];
    newProj[index][field] = value;
    setData({ ...data, projects: newProj });
  };
  const removeProject = (index) => setData({ ...data, projects: (data.projects || []).filter((_, i) => i !== index) });

  return (
    <div className={`grid ${isEditing ? 'lg:grid-cols-2' : 'lg:grid-cols-1 max-w-4xl mx-auto'} gap-8 h-[calc(100vh-8rem)]`}>
      {/* Editor Side */}
      {isEditing && (
        <div className="bg-[#121212] rounded-xl overflow-hidden flex flex-col border border-zinc-800 shadow-sm">
          <div className="p-8 overflow-y-auto flex-1 space-y-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">{experienceLevel === 'experienced' ? 'CV Generator' : 'Resume Generator'}</h2>
                <div className="flex items-center gap-4 mt-3">
                  <label className="text-zinc-400 text-sm flex items-center gap-2 cursor-pointer hover:text-zinc-300">
                    <input type="radio" name="exp" checked={experienceLevel === 'fresher'} onChange={() => setExperienceLevel('fresher')} className="accent-blue-500 w-4 h-4" />
                    Fresher (Resume)
                  </label>
                  <label className="text-zinc-400 text-sm flex items-center gap-2 cursor-pointer hover:text-zinc-300">
                    <input type="radio" name="exp" checked={experienceLevel === 'experienced'} onChange={() => setExperienceLevel('experienced')} className="accent-blue-500 w-4 h-4" />
                    Experienced (CV)
                  </label>
                </div>
              </div>
            </div>
            
            {/* Personal Info Section */}
            <section className="bg-black p-6 rounded-xl border border-zinc-800">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-zinc-100">Personal Information</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1 text-zinc-400">Phone</label>
                  <input type="text" className="w-full p-3 rounded-lg bg-black border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-zinc-200 transition-all" value={data.phone} onChange={e => setData({...data, phone: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-zinc-400">LinkedIn</label>
                  <input type="text" className="w-full p-3 rounded-lg bg-black border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-zinc-200 transition-all" value={data.links.linkedin} onChange={e => setData({...data, links: {...data.links, linkedin: e.target.value}})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-zinc-400">GitHub</label>
                  <input type="text" className="w-full p-3 rounded-lg bg-black border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-zinc-200 transition-all" value={data.links.github} onChange={e => setData({...data, links: {...data.links, github: e.target.value}})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1 text-zinc-400">Portfolio Website</label>
                  <input type="text" className="w-full p-3 rounded-lg bg-black border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-zinc-200 transition-all" value={data.links.portfolio} onChange={e => setData({...data, links: {...data.links, portfolio: e.target.value}})} />
                </div>
              </div>
            </section>

            {/* Professional Summary Section */}
            <section className="bg-black p-6 rounded-xl border border-zinc-800">
              <div className="flex justify-between items-end mb-4">
                <h3 className="text-lg font-bold text-zinc-100">Professional Summary</h3>
                <button onClick={handleEnhance} disabled={loading} className="text-xs bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-blue-500 px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold transition-colors disabled:opacity-50">
                  <Sparkles className="w-3 h-3" /> {loading ? 'Generating...' : 'AI Enhance'}
                </button>
              </div>
              <textarea className="w-full p-3 rounded-xl h-32 bg-black border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-zinc-200 transition-all placeholder-zinc-600" value={data.aiSummary} onChange={e => setData({...data, aiSummary: e.target.value})} placeholder="A brief summary of your professional background..." />
            </section>

            {/* Experience Section */}
            <section className="bg-black p-6 rounded-xl border border-zinc-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-zinc-100">Experience</h3>
                <button onClick={addExperience} className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 p-2 rounded-lg text-zinc-300 transition-colors"><Plus className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                {data.experience.map((exp, index) => (
                  <div key={index} className="bg-[#121212] p-4 rounded-xl border border-zinc-800 relative group">
                    <button onClick={() => removeExperience(index)} className="absolute top-2 right-2 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold mb-1 text-zinc-400 uppercase tracking-wider">Job Title</label>
                        <input type="text" className="w-full p-2.5 rounded-lg bg-black border border-zinc-800 focus:border-blue-500 outline-none text-sm text-zinc-200 transition-colors" value={exp.title} onChange={e => updateExperience(index, 'title', e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1 text-zinc-400 uppercase tracking-wider">Company</label>
                        <input type="text" className="w-full p-2.5 rounded-lg bg-black border border-zinc-800 focus:border-blue-500 outline-none text-sm text-zinc-200 transition-colors" value={exp.company} onChange={e => updateExperience(index, 'company', e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold mb-1 text-zinc-400 uppercase tracking-wider">Duration (e.g. Jan 2020 - Present)</label>
                        <input type="text" className="w-full p-2.5 rounded-lg bg-black border border-zinc-800 focus:border-blue-500 outline-none text-sm text-zinc-200 transition-colors" value={exp.duration} onChange={e => updateExperience(index, 'duration', e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold mb-1 text-zinc-400 uppercase tracking-wider">Description</label>
                        <textarea className="w-full p-2.5 rounded-lg bg-black border border-zinc-800 focus:border-blue-500 outline-none text-sm h-24 text-zinc-200 transition-colors" value={exp.description} onChange={e => updateExperience(index, 'description', e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
                {data.experience.length === 0 && <p className="text-zinc-500 text-sm italic">No experience added.</p>}
              </div>
            </section>

            {/* Projects Section */}
            <section className="bg-black p-6 rounded-xl border border-zinc-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-zinc-100">Projects</h3>
                <button onClick={addProject} className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 p-2 rounded-lg text-zinc-300 transition-colors"><Plus className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                {(data.projects || []).map((proj, index) => (
                  <div key={index} className="bg-[#121212] p-4 rounded-xl border border-zinc-800 relative group">
                    <button onClick={() => removeProject(index)} className="absolute top-2 right-2 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-xs font-bold mb-1 text-zinc-400 uppercase tracking-wider">Project Title</label>
                        <input type="text" className="w-full p-2.5 rounded-lg bg-black border border-zinc-800 focus:border-blue-500 outline-none text-sm text-zinc-200 transition-colors" value={proj.title} onChange={e => updateProject(index, 'title', e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1 text-zinc-400 uppercase tracking-wider">Description</label>
                        <textarea className="w-full p-2.5 rounded-lg bg-black border border-zinc-800 focus:border-blue-500 outline-none text-sm h-24 text-zinc-200 transition-colors" value={proj.description} onChange={e => updateProject(index, 'description', e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
                {(!data.projects || data.projects.length === 0) && <p className="text-zinc-500 text-sm italic">No projects added.</p>}
              </div>
            </section>

            {/* Education Section */}
            <section className="bg-black p-6 rounded-xl border border-zinc-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-zinc-100">Education</h3>
                <button onClick={addEducation} className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 p-2 rounded-lg text-zinc-300 transition-colors"><Plus className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                {data.education.map((edu, index) => (
                  <div key={index} className="bg-[#121212] p-4 rounded-xl border border-zinc-800 relative group grid grid-cols-2 gap-3">
                    <button onClick={() => removeEducation(index)} className="absolute top-2 right-2 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold mb-1 text-zinc-400 uppercase tracking-wider">Degree/Certificate</label>
                      <input type="text" className="w-full p-2.5 rounded-lg bg-black border border-zinc-800 focus:border-blue-500 outline-none text-sm text-zinc-200 transition-colors" value={edu.degree} onChange={e => updateEducation(index, 'degree', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1 text-zinc-400 uppercase tracking-wider">Institution</label>
                      <input type="text" className="w-full p-2.5 rounded-lg bg-black border border-zinc-800 focus:border-blue-500 outline-none text-sm text-zinc-200 transition-colors" value={edu.institution} onChange={e => updateEducation(index, 'institution', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1 text-zinc-400 uppercase tracking-wider">Graduation Year</label>
                      <input type="text" className="w-full p-2.5 rounded-lg bg-black border border-zinc-800 focus:border-blue-500 outline-none text-sm text-zinc-200 transition-colors" value={edu.year} onChange={e => updateEducation(index, 'year', e.target.value)} />
                    </div>
                  </div>
                ))}
                {data.education.length === 0 && <p className="text-zinc-500 text-sm italic">No education added.</p>}
              </div>
            </section>

            {/* Skills & Hobbies Section */}
            <section className="bg-black p-6 rounded-xl border border-zinc-800 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-zinc-100 mb-1">Skills</h3>
                <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase tracking-wider">Comma separated (e.g. React, Node.js, Python)</label>
                <input type="text" className="w-full p-3 rounded-xl bg-black border border-zinc-800 focus:border-blue-500 outline-none text-zinc-200 transition-all" value={data.skills} onChange={e => setData({...data, skills: e.target.value})} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-zinc-100 mb-1">Hobbies</h3>
                <label className="block text-xs font-bold mb-2 text-zinc-500 uppercase tracking-wider">Comma separated (e.g. Reading, Hiking, Coding)</label>
                <input type="text" className="w-full p-3 rounded-xl bg-black border border-zinc-800 focus:border-blue-500 outline-none text-zinc-200 transition-all" value={data.hobbies} onChange={e => setData({...data, hobbies: e.target.value})} />
              </div>
            </section>
          </div>
          
          {/* Fixed Footer for Save Button */}
          <div className="p-4 bg-[#121212] border-t border-zinc-800 flex justify-end shadow-sm">
            <button onClick={handleSave} disabled={loading} className="bg-blue-600 text-white hover:bg-blue-500 px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg">
              {loading ? <span className="animate-pulse">Saving...</span> : <><Save className="w-5 h-5" /> Save Profile</>}
            </button>
          </div>
        </div>
      )}

      {/* Preview Side */}
      <div className="glass-card flex flex-col shadow-sm bg-[#121212] border border-zinc-800">
        <div className="flex justify-between items-center p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-white tracking-tight">Profile Preview</h2>
          <div className="flex gap-3">
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)} 
                className="bg-zinc-800 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 px-4 py-2 rounded-lg font-bold text-sm transition-colors"
              >
                Edit Profile
              </button>
            )}
            
            {pdfInstance.loading ? (
              <div className="bg-white text-[#121212] px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm opacity-70 cursor-wait">
                Preparing PDF...
              </div>
            ) : pdfInstance.error ? (
              <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm">
                PDF Error
              </div>
            ) : (
              <button 
                onClick={handleNativeDownload}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-500 transition-colors flex items-center gap-2 shadow-lg shadow-none"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
            )}
          </div>
        </div>
        
                        {/* Render a simulated visual preview of the PDF here (Keeping it White so it looks like a paper PDF) */}
        <div className="flex-1 bg-black p-6 overflow-y-auto">
          <div className="bg-white max-w-[210mm] mx-auto min-h-[297mm] shadow-sm text-[#121212] p-12">
            <div className="flex items-start justify-between gap-6 mb-8 border-b-2 border-zinc-800 pb-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2 tracking-tight text-[#121212]">{user?.name || 'Your Name'}</h1>
                <p className="text-sm text-zinc-500 mb-2">{user?.email || 'email@example.com'} {data.phone && `• ${data.phone}`}</p>
                <div className="text-xs text-zinc-500 flex flex-wrap gap-x-4 gap-y-1">
                  {data.links?.linkedin && <span>LinkedIn: {data.links.linkedin}</span>}
                  {data.links?.github && <span>GitHub: {data.links.github}</span>}
                  {data.links?.portfolio && <span>Portfolio: {data.links.portfolio}</span>}
                </div>
              </div>
            </div>
            
            {data.aiSummary && (
              <div className="mb-6">
                <h3 className="text-sm font-bold border-b border-zinc-300 pb-1 mb-2 tracking-widest uppercase text-zinc-800">Professional Summary</h3>
                <p className="text-sm text-zinc-800 leading-relaxed whitespace-pre-line">{data.aiSummary}</p>
              </div>
            )}

            {/* Conditionally ordered HTML Preview Sections */}
            {experienceLevel === 'experienced' ? (
              <>
                {data.experience?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-bold border-b border-zinc-300 pb-1 mb-3 tracking-widest uppercase text-zinc-800">Experience</h3>
                    <div className="space-y-5">
                      {data.experience.map((exp, i) => (
                        <div key={i}>
                          <div className="flex justify-between items-baseline mb-1">
                            <h4 className="font-bold text-[#121212]">{exp.role || exp.title}</h4>
                            <span className="text-xs text-zinc-500">{exp.duration}</span>
                          </div>
                          <div className="text-sm text-blue-600 font-medium mb-2">{exp.company}</div>
                          <p className="text-sm text-zinc-800 leading-relaxed whitespace-pre-line">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {data.projects?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-bold border-b border-zinc-300 pb-1 mb-3 tracking-widest uppercase text-zinc-800">Projects</h3>
                    <div className="space-y-4">
                      {data.projects.map((proj, i) => (
                        <div key={i}>
                          <h4 className="font-bold text-[#121212] mb-1">{proj.title}</h4>
                          <p className="text-sm text-zinc-800 leading-relaxed whitespace-pre-line">{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {data.projects?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-bold border-b border-zinc-300 pb-1 mb-3 tracking-widest uppercase text-zinc-800">Projects</h3>
                    <div className="space-y-4">
                      {data.projects.map((proj, i) => (
                        <div key={i}>
                          <h4 className="font-bold text-[#121212] mb-1">{proj.title}</h4>
                          <p className="text-sm text-zinc-800 leading-relaxed whitespace-pre-line">{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {data.experience?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-bold border-b border-zinc-300 pb-1 mb-3 tracking-widest uppercase text-zinc-800">Experience</h3>
                    <div className="space-y-5">
                      {data.experience.map((exp, i) => (
                        <div key={i}>
                          <div className="flex justify-between items-baseline mb-1">
                            <h4 className="font-bold text-[#121212]">{exp.role || exp.title}</h4>
                            <span className="text-xs text-zinc-500">{exp.duration}</span>
                          </div>
                          <div className="text-sm text-blue-600 font-medium mb-2">{exp.company}</div>
                          <p className="text-sm text-zinc-800 leading-relaxed whitespace-pre-line">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {data.education?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold border-b border-zinc-300 pb-1 mb-3 tracking-widest uppercase text-zinc-800">Education</h3>
                <div className="space-y-3">
                  {data.education.map((edu, i) => (
                    <div key={i} className="flex justify-between items-baseline">
                      <div>
                        <h4 className="font-bold text-[#121212]">{edu.degree}</h4>
                        <div className="text-sm text-zinc-800">{edu.institution}</div>
                      </div>
                      <span className="text-xs text-zinc-500">{edu.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.skills?.length > 0 && (
              <div>
                <h3 className="text-sm font-bold border-b border-zinc-300 pb-1 mb-3 tracking-widest uppercase text-zinc-800">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {(typeof data.skills === 'string' ? data.skills.split(',').filter(s => s.trim()) : data.skills).map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-zinc-100 text-zinc-800 rounded-full text-xs font-medium border border-zinc-200">
                      {typeof skill === 'string' ? skill.trim() : skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
