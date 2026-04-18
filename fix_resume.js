const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/ResumeBuilder.jsx', 'utf8');

// Remove handleImageUpload
code = code.replace(/  const handleImageUpload = async \(e\) => \{[\s\S]*?  \};\r?\n\r?\n/, '');

// Remove Upload Photo button
code = code.replace(/<label className=\"cursor-pointer bg-zinc-900.*?>[\s\S]*?<\/label>/, '');

// Fix 'flex items-center justify-between' to just 'mb-4' in Personal Info
code = code.replace(/<div className=\"flex items-center justify-between mb-4\">\r?\n\s*<h3 className=\"text-lg font-bold text-zinc-100\">Personal Information<\/h3>\r?\n\s*<\/div>/, '<div className=\"mb-4\">\n                <h3 className=\"text-lg font-bold text-zinc-100\">Personal Information</h3>\n              </div>');

// Remove profile image preview
code = code.replace(/\{data\.profileImage && \([\s\S]*?<img src=\{data\.profileImage\}[\s\S]*?<\/div>\r?\n\s*\)\}/, '');

// Remove preview from the PDF simulation side
code = code.replace(/\{data\.profileImage && \([\s\S]*?<img src=\{data\.profileImage\}[\s\S]*?<\/div>\r?\n\s*\)\}/, '');

// Remove the final one
code = code.replace(/\{data\.profileImage && \([\s\S]*?<img src=\{data\.profileImage\}[\s\S]*?\)\}/, '');

fs.writeFileSync('frontend/src/pages/ResumeBuilder.jsx', code);
console.log('ResumeBuilder.jsx updated successfully');
