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
        CREATE TABLE IF NOT EXISTS staff (
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
            shift_start TIMESTAMP NOT NULL,
            shift_end TIMESTAMP NOT NULL,
            shift_date DATE NOT NULL,
            vacancy_status BOOLEAN NOT NULL DEFAULT true,
            vacancy_number INT NOT NULL DEFAULT 1 CHECK (vacancy_number BETWEEN 1 AND 20),
            CONSTRAINT check_vacancy_status 
                CHECK (
                    (vacancy_number < 20 AND vacancy_status = true) OR 
                    (vacancy_number = 20 AND vacancy_status = false)
                )
        )`;
}

async function seedSession(tx) {
    const sql = tx ?? sql;
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await sql`
        CREATE TABLE IF NOT EXISTS sessions (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            category VARCHAR(255) NOT NULL,
            arrival_date TIMESTAMP NOT NULL,
            shift UUID REFERENCES shifts(id),
            full_name VARCHAR(255) NOT NULL,
            group_member BOOLEAN NOT NULL
        )`;
}

export async function GET() {
    try {
        await sql.begin(async (tx) => {
            await seedUsers(tx);
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