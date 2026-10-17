import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getFallbackNewsAll } from '@/lib/fallbackNews';

// Create Supabase client with server-side keys
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('rating', {ascending: false})
      .limit(100);

    if (error || !data || data.length === 0) {
      if (error) console.error("Supabase fetch error:", error);
      return NextResponse.json(getFallbackNewsAll());
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("News API fallback:", err);
    return NextResponse.json(getFallbackNewsAll());
  }
}
