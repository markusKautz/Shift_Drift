import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({ error: 'Missing Supabase credentials' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // Perform a simple query to keep the project active
        const { data, error } = await supabase
            .from('scores') // Assuming 'scores' table exists as per previous conversations
            .select('*')
            .limit(1);

        if (error) {
            console.error('Supabase query error:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ status: 'OK', message: 'Keep-alive query successful' });
    } catch (err) {
        console.error('Unexpected error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
