import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const getCorsHeaders = (origin: string | null) => ({
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, priority',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
})

serve(async (req) => {
    const origin = req.headers.get('Origin')

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: getCorsHeaders(origin) })
    }

    const corsHeaders = getCorsHeaders(origin)

    try {
        const { name, score, _s, duration } = await req.json()

        // 1. Basic Validation
        if (!name || typeof score !== 'number' || score <= 0) {
            return new Response(
                JSON.stringify({ error: 'Invalid score data' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
        }

        // 2. Server-side Integrity Check (Match the client-side formula)
        const expected_s = (score * 7 + 13) % 2147483647
        if (_s !== expected_s) {
            console.warn(`Tamper detected for user ${name}: score=${score}, token=${_s}`)
            return new Response(
                JSON.stringify({ error: 'Integrity check failed' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
            )
        }

        // 3. Heuristic Validation (e.g., minimum time per score)
        // Example: Getting 1,000,000 points in less than 30 seconds is likely cheating
        if (score > 10000 && duration < (score / 500)) {
            console.warn(`Impossible score density for ${name}: score ${score} in ${duration}s`)
            return new Response(
                JSON.stringify({ error: 'Score density exceeded human limits' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
            )
        }

        // 4. Secure Insert using Service Role Key
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SERVICE_ROLE_KEY') ?? ''
        )

        const { data, error } = await supabaseClient
            .from('leaderboard')
            .insert([{
                name,
                score,
                duration,
                client_ts: new Date().toISOString()
            }])
            .select()

        if (error) throw error

        return new Response(
            JSON.stringify({ message: 'Score saved', data }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})
