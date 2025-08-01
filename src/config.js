// This will be processed by the build script
const CONFIG = {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY
};

// Make config available globally for other scripts
window.SUPABASE_CONFIG = CONFIG;

export default CONFIG;