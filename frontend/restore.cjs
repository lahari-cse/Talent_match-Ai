const fs = require('fs');
let c = fs.readFileSync('src/pages/ResumeBuilder.jsx', 'utf8');

const htmlPreview = `        {/* Render a simulated visual preview of the PDF here (Keeping it White so it looks like a paper PDF) */}
        <div className="flex-1 bg-slate-950 p-6 overflow-y-auto">
          <div className="bg-white max-w-[210mm] mx-auto min-h-[297mm] shadow-xl text-slate-900 p-12">
            <div className="flex items-start justify-between gap-6 mb-8 border-b-2 border-slate-800 pb-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2 tracking-tight text-slate-900">{user.name}</h1>
                <p className="text-sm text-slate-600 mb-2">{user.email} {data.phone && \`• \${data.phone}\`}</p>
                <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                  {data.links.linkedin && <span>LinkedIn: {data.links.linkedin}</span>}
                  {data.links.github && <span>GitHub: {data.links.github}</span>}
                  {data.links.portfolio && <span>Portfolio: {data.links.portfolio}</span>}
                </div>
              </div>
              {data.profileImage && (
                <img src={data.profileImage} alt="Profile" className="w-24 h-24 rounded object-cover border border-slate-200" />
              )}
            </div>
            
            {data.aiSummary && (
              <div className="mb-6">
                <h3 className="text-sm font-bold border-b border-slate-300 pb-1 mb-2 tracking-widest uppercase text-slate-800">Professional Summary</h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{data.aiSummary}</p>
              </div>
            )}

            {/* Conditionally ordered HTML Preview Sections */}
            {experienceLevel === 'experienced' ? (
              <>
                {data.experience.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-bold border-b border-slate-300 pb-1 mb-3 tracking-widest uppercase text-slate-800">Experience</h3>
                    <div className="space-y-5">
                      {data.experience.map((exp, i) => (
                        <div key={i}>
                          <div className="flex justify-between items-baseline mb-1">
                            <h4 className="font-bold text-slate-900">{exp.role}</h4>
                            <span className="text-xs text-slate-500">{exp.duration}</span>
                          </div>
                          <div className="text-sm text-blue-600 font-medium mb-2">{exp.company}</div>
                          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {data.projects.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-bold border-b border-slate-300 pb-1 mb-3 tracking-widest uppercase text-slate-800">Projects</h3>
                    <div className="space-y-4">
                      {data.projects.map((proj, i) => (
                        <div key={i}>
                          <h4 className="font-bold text-slate-900 mb-1">{proj.title}</h4>
                          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {data.projects.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-bold border-b border-slate-300 pb-1 mb-3 tracking-widest uppercase text-slate-800">Projects</h3>
                    <div className="space-y-4">
                      {data.projects.map((proj, i) => (
                        <div key={i}>
                          <h4 className="font-bold text-slate-900 mb-1">{proj.title}</h4>
                          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {data.experience.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-bold border-b border-slate-300 pb-1 mb-3 tracking-widest uppercase text-slate-800">Experience</h3>
                    <div className="space-y-5">
                      {data.experience.map((exp, i) => (
                        <div key={i}>
                          <div className="flex justify-between items-baseline mb-1">
                            <h4 className="font-bold text-slate-900">{exp.role}</h4>
                            <span className="text-xs text-slate-500">{exp.duration}</span>
                          </div>
                          <div className="text-sm text-blue-600 font-medium mb-2">{exp.company}</div>
                          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {data.education.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold border-b border-slate-300 pb-1 mb-3 tracking-widest uppercase text-slate-800">Education</h3>
                <div className="space-y-3">
                  {data.education.map((edu, i) => (
                    <div key={i} className="flex justify-between items-baseline">
                      <div>
                        <h4 className="font-bold text-slate-900">{edu.degree}</h4>
                        <div className="text-sm text-slate-700">{edu.institution}</div>
                      </div>
                      <span className="text-xs text-slate-500">{edu.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.skills.length > 0 && (
              <div>
                <h3 className="text-sm font-bold border-b border-slate-300 pb-1 mb-3 tracking-widest uppercase text-slate-800">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium border border-slate-200">
                      {skill}
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
};`;

c = c.replace(/\{\/\* Real PDF Preview \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\};/, htmlPreview);
fs.writeFileSync('src/pages/ResumeBuilder.jsx', c);
