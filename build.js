const fs = require('fs');
const path = require('path');

// Create dist directory if it doesn't exist
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

// Read the template JS file
let jsContent = fs.readFileSync('src/script.js', 'utf8');

// Replace process.env references with actual values
jsContent = jsContent.replace(
    /process\.env\.SUPABASE_URL/g, 
    `"${process.env.SUPABASE_URL}"`
);
jsContent = jsContent.replace(
    /process\.env\.SUPABASE_ANON_KEY/g, 
    `"${process.env.SUPABASE_ANON_KEY}"`
);

// Write the processed JS file
fs.writeFileSync('dist/script.js', jsContent);

// Copy HTML file to dist
fs.copyFileSync('src/index.html', 'dist/index.html');

console.log('Build completed successfully!');
console.log('Files generated in dist/ directory');