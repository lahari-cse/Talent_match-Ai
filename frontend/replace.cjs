const fs = require('fs');
let c = fs.readFileSync('src/pages/ResumeBuilder.jsx', 'utf8');
c = c.replace(/\{\/\* Render a simulated visual preview of the PDF here[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\};/, `        {/* Real PDF Preview */}
        <div className="flex-1 bg-slate-950 p-4 h-[calc(100vh-6rem)]">
          <PDFViewer style={{ width: '100%', height: '100%', border: 'none', borderRadius: '0.5rem' }}>
            <ResumePDF data={data} user={user} experienceLevel={experienceLevel} />
          </PDFViewer>
        </div>
      </div>
    </div>
  );
};`);
fs.writeFileSync('src/pages/ResumeBuilder.jsx', c);
