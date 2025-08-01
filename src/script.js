import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';

// These will be replaced during build
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Your app logic
async function fetchData() {
    try {
        const { data, error } = await supabase
            .from('your_table')
            .select('*');
        
        if (error) throw error;
        console.log('Data:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

console.log('Supabase initialized');