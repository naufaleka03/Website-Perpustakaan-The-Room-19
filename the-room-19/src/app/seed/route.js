import bcrypt from 'bcrypt';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

async function seedUsers(tx) {
    const sql = tx ?? sql;
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    
    // Visitors table (existing)
    await sql`
        CREATE TABLE IF NOT EXISTS visitors (
            id UUID PRIMARY KEY REFERENCES auth.users(id),
            name VARCHAR(255) NOT NULL,
            email TEXT NOT NULL UNIQUE,
            phone_number VARCHAR(20),
            member_status VARCHAR(20) NOT NULL DEFAULT 'guest'
        )`;

    // Staff table
    await sql`
        CREATE TABLE IF NOT EXISTS staffs (
            id UUID PRIMARY KEY REFERENCES auth.users(id),
            name VARCHAR(255) NOT NULL,
            email TEXT NOT NULL UNIQUE,
            phone_number VARCHAR(20),
            position VARCHAR(50) NOT NULL,
            hire_date DATE NOT NULL,
            employee_id VARCHAR(20) UNIQUE
        )`;

    // Owners table
    await sql`
        CREATE TABLE IF NOT EXISTS owners (
            id UUID PRIMARY KEY REFERENCES auth.users(id),
            name VARCHAR(255) NOT NULL,
            email TEXT NOT NULL UNIQUE,
            phone_number VARCHAR(20),
            business_registration_number VARCHAR(50),
            ownership_date DATE
        )`;
}

async function seedShifts(tx) {
    const sql = tx ?? sql;
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await sql`
        CREATE TABLE IF NOT EXISTS shifts (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            shift_name VARCHAR(255) NOT NULL,
            shift_start TIME NOT NULL,
            shift_end TIME NOT NULL,
            UNIQUE(shift_name, shift_start, shift_end)
        )`;
}

async function seedSession(tx) {
    const sql = tx ?? sql;
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await sql`
        CREATE TABLE IF NOT EXISTS sessions (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            category VARCHAR(255) NOT NULL,
            arrival_date DATE NOT NULL,
            shift_name VARCHAR(255) NOT NULL,
            shift_start TIME NOT NULL,
            shift_end TIME NOT NULL,
            full_name VARCHAR(255) NOT NULL,
            group_member1 VARCHAR(255),
            group_member2 VARCHAR(255),
            group_member3 VARCHAR(255),
            group_member4 VARCHAR(255),
            status VARCHAR(50) DEFAULT 'not_attended' NOT NULL,
            payment_id VARCHAR(255),
            payment_status VARCHAR(50),
            payment_method VARCHAR(50),
            amount INTEGER,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
            FOREIGN KEY (shift_name, shift_start, shift_end) 
                REFERENCES shifts(shift_name, shift_start, shift_end)
        )`;
}

export async function GET() {
    try {
        await sql.begin(async (tx) => {
            await seedUsers(tx);
            await seedShifts(tx);
            await seedSession(tx);
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
