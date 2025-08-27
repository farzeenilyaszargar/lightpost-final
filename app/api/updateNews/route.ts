import { NextRequest, NextResponse } from 'next/server';
import { fetchAndStoreNews } from '../../../lib/fetchNews';

export async function GET(req: NextRequest) {
  try {
    await fetchAndStoreNews();
    return NextResponse.json({ message: "News updated successfully" });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
