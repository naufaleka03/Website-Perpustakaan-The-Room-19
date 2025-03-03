import bcrypt from 'bcrypt';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

async function seedVisitors(tx) {
    const sql = tx ?? sql;
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await sql`
        CREATE TABLE IF NOT EXISTS visitors (
            id UUID PRIMARY KEY REFERENCES auth.users(id),
            name VARCHAR(255) NOT NULL,
            email TEXT NOT NULL UNIQUE,
            phone_number VARCHAR(20)
        )`;
}

async function seedShifts(tx) {
    const sql = tx ?? sql;
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await sql`
        CREATE TABLE IF NOT EXISTS shifts (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            shift_name VARCHAR(255) NOT NULL,
            shift_start TIMESTAMP NOT NULL UNIQUE,
            shift_end TIMESTAMP NOT NULL
        )`;
}

export async function GET() {
    try {
        await sql.begin(async (tx) => {
            await seedVisitors(tx);
            await seedShifts(tx);
        });

        return Response.json({ 
            success: true,
            message: 'Database seeded successfully' 
        });
    } catch (error) {
        console.error('Database seeding failed:', error);
        
        return Response.json({ 
            success: false,
            message: 'Failed to seed database',
            // Only send safe error information
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        }, { 
            status: 500 
        });
    }
}