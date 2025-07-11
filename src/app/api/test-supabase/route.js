import { NextResponse } from 'next/server';
import { createClient } from '@/app/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();
    
    // Test basic connection
    const { data, error } = await supabase
      .from('staffs')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Supabase test error:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection working',
      data: data
    });

  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
} 