const fs = require('fs');
const path = require('path');

// Create dist directory if it doesn't exist
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

// Create assets directory in dist
if (!fs.existsSync('dist/assets')) {
    fs.mkdirSync('dist/assets');
}

// Function to process JS files (replace environment variables)
function processJSFile(inputPath, outputPath) {
    if (!fs.existsSync(inputPath)) {
        console.log(`⚠️  File not found: ${inputPath} - skipping`);
        return;
    }
    
    let jsContent = fs.readFileSync(inputPath, 'utf8');
    
    // Replace process.env references with actual values
    jsContent = jsContent.replace(
        /process\.env\.SUPABASE_URL/g, 
        `"${process.env.SUPABASE_URL || ''}"`
    );
    jsContent = jsContent.replace(
        /process\.env\.SUPABASE_ANON_KEY/g, 
        `"${process.env.SUPABASE_ANON_KEY || ''}"`
    );
    
    fs.writeFileSync(outputPath, jsContent);
    console.log(`✅ Processed: ${inputPath} -> ${outputPath}`);
}

// Function to copy files as-is
function copyFile(inputPath, outputPath) {
    if (!fs.existsSync(inputPath)) {
        console.log(`⚠️  File not found: ${inputPath} - skipping`);
        return;
    }
    
    fs.copyFileSync(inputPath, outputPath);
    console.log(`📁 Copied: ${inputPath} -> ${outputPath}`);
}

// Process all JS files (including config.js which needs env var replacement)
const jsFiles = [
    'config.js',        // Important: This needs to be processed first
    'script.js',
    'admin.js', 
    'auth.js',
    'contact.js',
    'dashboard.js',
    'index.js',
    'onboarding.js',
    'reset-password.js'
];

console.log('🔄 Processing JavaScript files...');
jsFiles.forEach(file => {
    const srcPath = `src/${file}`;
    const distPath = `dist/${file}`;
    processJSFile(srcPath, distPath);
});

// Copy all HTML files
const htmlFiles = [
    'index.html',
    'about.html',
    'admin.html', 
    'contact.html',
    'dashboard.html',
    'login.html',
    'onboarding.html',
    'reset-password.html',
    'current-coffee.html'
];

console.log('🔄 Copying HTML files...');
htmlFiles.forEach(file => {
    const srcPath = `src/${file}`;
    const distPath = `dist/${file}`;
    copyFile(srcPath, distPath);
});

// Copy all CSS files
const cssFiles = [
    'globals.css',
    'style.css', 
    'styleguide.css'
];

console.log('🔄 Copying CSS files...');
cssFiles.forEach(file => {
    const srcPath = `src/${file}`;
    const distPath = `dist/${file}`;
    copyFile(srcPath, distPath);
});

// Copy all assets (images)
console.log('🔄 Copying assets...');
if (fs.existsSync('src/assets')) {
    const assetFiles = fs.readdirSync('src/assets');
    assetFiles.forEach(file => {
        const srcPath = `src/assets/${file}`;
        const distPath = `dist/assets/${file}`;
        copyFile(srcPath, distPath);
    });
} else {
    console.log('⚠️  No src/assets directory found - skipping assets');
}

// Copy any additional files that might be needed
const otherFiles = ['netlify.toml', 'SUPABASE_DATABASE_SETUP.md', 'EMAILJS_SETUP.md'];
otherFiles.forEach(file => {
    if (fs.existsSync(file)) {
        copyFile(file, `dist/${file}`);
    }
});

console.log('\n🎉 Build completed successfully!');
console.log('📁 Files generated in dist/ directory');
console.log('🚀 Ready for deployment to Netlify');

// Show environment variable status
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    console.log('✅ Environment variables found and injected');
} else {
    console.log('⚠️  Environment variables not found - make sure they are set in Netlify');
}