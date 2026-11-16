import type { Handler, HandlerEvent } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /.netlify/functions/visitor-counts
 *
 * Returns aggregated visitor counts by country for the last 30 days.
 * Uses the Supabase service role key (server-side only) so the site_visits
 * table can remain locked to admins in RLS while still powering the public bar.
 *
 * Response shape:
 *   { visitorCounts: { country: string, country_code: string, count: number }[], totalVisits: number, firstVisitDate: string | null }
 */
const handler: Handler = async (event: HandlerEvent) => {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };

    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers: corsHeaders, body: "" };
    }

    if (event.httpMethod !== "GET") {
        return { statusCode: 405, headers: corsHeaders, body: "Method Not Allowed" };
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    // Service role key: use SUPABASE_SERVICE_ROLE_KEY in Netlify dashboard (no VITE_ prefix),
    // or VITE_SUPABASE_SERVICE_ROLE_KEY locally (from .env). Never expose to browser bundle.
    const serviceKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
        console.error("⚠️ Supabase env vars not configured for visitor-counts function");
        return {
            statusCode: 503,
            headers: corsHeaders,
            body: JSON.stringify({ error: "Service not configured" }),
        };
    }

    try {
        // Use service role — bypasses RLS entirely
        const supabase = createClient(supabaseUrl, serviceKey, {
            auth: { persistSession: false },
        });

        // 1. Fetch exact total visit count directly from PostgreSQL
        const { count: exactTotal, error: countErr } = await supabase
            .from("site_visits")
            .select("*", { count: "exact", head: true });

        if (countErr) {
            console.error("Error fetching exact visit count:", countErr);
        }

        const total = exactTotal ?? 0;

        // 2. Fetch first visit date
        const { data: firstVisitData } = await supabase
            .from("site_visits")
            .select("created_at")
            .order("created_at", { ascending: true })
            .limit(1);

        const firstVisitDate =
            firstVisitData && firstVisitData.length > 0
                ? firstVisitData[0].created_at
                : null;

        // 3. Aggregate all countries across pages (up to 15,000 rows to avoid PostgREST 1000 row cap)
        const countMap = new Map<string, { country: string; count: number }>();
        const pageSize = 1000;
        let from = 0;
        let hasMore = true;

        while (hasMore && from < 15000) {
            const { data: pageRows, error: pageErr } = await supabase
                .from("site_visits")
                .select("country_code, country")
                .range(from, from + pageSize - 1);

            if (pageErr || !pageRows || pageRows.length === 0) {
                break;
            }

            for (const row of pageRows) {
                if (!row.country_code || row.country_code === "UNKNOWN") continue;
                const existing = countMap.get(row.country_code);
                if (existing) {
                    existing.count++;
                } else {
                    countMap.set(row.country_code, {
                        country: row.country || row.country_code,
                        count: 1,
                    });
                }
            }

            if (pageRows.length < pageSize) {
                hasMore = false;
            } else {
                from += pageSize;
            }
        }

        const visitorCounts = Array.from(countMap.entries())
            .map(([code, d]) => ({
                country_code: code,
                country: d.country,
                count: d.count,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 35);

        return {
            statusCode: 200,
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
                // Cache for 20 seconds — fresh enough to show live increases quickly
                "Cache-Control": "public, max-age=20, s-maxage=30",
            },
            body: JSON.stringify({ visitorCounts, totalVisits: total, firstVisitDate }),
        };
    } catch (err) {
        console.error("visitor-counts function error:", err);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: "Internal server error" }),
        };
    }
};

export { handler };
