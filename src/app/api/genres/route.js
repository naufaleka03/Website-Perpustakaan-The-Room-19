import postgres from 'postgres';
import { NextResponse } from 'next/server';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

// GET all genres
export async function GET() {
    try {
        const genres = await sql`
            SELECT * FROM genres
            ORDER BY created_at DESC
        `;
        return NextResponse.json({ success: true, data: genres });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST new genre
export async function POST(request) {
    try {
        const { genre_name } = await request.json();
        
        const newGenre = await sql`
            INSERT INTO genres (genre_name)
            VALUES (${genre_name})
            RETURNING *
        `;
        
        return NextResponse.json({ success: true, data: newGenre[0] });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
} 