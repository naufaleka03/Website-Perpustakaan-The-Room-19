import postgres from 'postgres';
import { NextResponse } from 'next/server';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

// UPDATE genre
export async function PUT(request, { params }) {
    try {
        const id = await params.id;
        const { genre_name } = await request.json();
        
        const updatedGenre = await sql`
            UPDATE genres
            SET genre_name = ${genre_name}
            WHERE id = ${id}
            RETURNING *
        `;
        
        if (updatedGenre.length === 0) {
            return NextResponse.json({ success: false, error: 'Genre not found' }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, data: updatedGenre[0] });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
// DELETE genre
export async function DELETE(request, { params }) {
    try {
        const id = params.id;
        
        const deletedGenre = await sql`
            DELETE FROM genres
            WHERE id = ${id}
            RETURNING *
        `;
        
        if (deletedGenre.length === 0) {
            return NextResponse.json({ success: false, error: 'Genre not found' }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, data: deletedGenre[0] });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
} 