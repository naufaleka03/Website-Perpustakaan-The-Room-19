import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

async function seedUsers(tx) {
  const sql = tx ?? sql;
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  // Visitors table
  await sql`
        CREATE TABLE IF NOT EXISTS visitors (
            id UUID PRIMARY KEY REFERENCES auth.users(id),
            name VARCHAR(255) NOT NULL,
            email TEXT NOT NULL UNIQUE,
            phone_number VARCHAR(20),
            member_status VARCHAR(20) NOT NULL DEFAULT 'guest',
            profile_picture VARCHAR(255),
            address VARCHAR(255),
            city VARCHAR(100),
            state VARCHAR(100),
            postal_code VARCHAR(20),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
            profile_picture VARCHAR(255),
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

async function seedMembershipApplications(tx) {
    const sql = tx ?? sql;
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    
    // Membership Applications table
    await sql`
        CREATE TABLE IF NOT EXISTS memberships (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id),
            full_name VARCHAR(255) NOT NULL,
            email TEXT NOT NULL,
            phone_number VARCHAR(20) NOT NULL,
            address VARCHAR(255) NOT NULL,
            favorite_book_genre VARCHAR(100),
            emergency_contact_name VARCHAR(255) NOT NULL,
            emergency_contact_number VARCHAR(20) NOT NULL,
            id_card_url VARCHAR(255) NOT NULL,
            status VARCHAR(20) DEFAULT 'request' NOT NULL,
            notes TEXT,
            reviewed_by UUID REFERENCES staffs(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
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
            cancellation_reason TEXT,
            payment_id VARCHAR(255),
            payment_status VARCHAR(50),
            payment_method VARCHAR(50),
            amount INTEGER,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
            FOREIGN KEY (shift_name, shift_start, shift_end) 
                REFERENCES shifts(shift_name, shift_start, shift_end)
        )`;
}

async function seedEvents(tx) {
  const sql = tx ?? sql;
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
        CREATE TABLE IF NOT EXISTS events (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            event_name VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            event_date DATE NOT NULL,
            shift_name VARCHAR(255) NOT NULL,
            shift_start TIME NOT NULL,
            shift_end TIME NOT NULL,
            max_participants INTEGER NOT NULL,
            ticket_fee INTEGER NOT NULL,
            additional_notes TEXT,
            event_poster TEXT,
            status VARCHAR(50) DEFAULT 'open' NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
            FOREIGN KEY (shift_name, shift_start, shift_end) 
                REFERENCES shifts(shift_name, shift_start, shift_end)
        )`;
}

async function seedEventReservations(tx) {
  const sql = tx ?? sql;
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS eventreservations (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            event_name VARCHAR(255) NOT NULL,
            description TEXT,
            event_date DATE NOT NULL,
            shift_name VARCHAR(255) NOT NULL,
            shift_start TIME NOT NULL,
            shift_end TIME NOT NULL,
            max_participants INTEGER NOT NULL,
            ticket_fee INTEGER NOT NULL,
            additional_notes TEXT,
            full_name VARCHAR(255) NOT NULL,
            group_member1 VARCHAR(255),
            group_member2 VARCHAR(255),
            group_member3 VARCHAR(255),
            group_member4 VARCHAR(255),
            status VARCHAR(50) DEFAULT 'not_attended' NOT NULL,
            cancellation_reason TEXT,
            payment_id VARCHAR(255),
            payment_status VARCHAR(50),
            payment_method VARCHAR(50),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
            FOREIGN KEY (shift_name, shift_start, shift_end) 
                REFERENCES shifts(shift_name, shift_start, shift_end)
    )`;
}

async function seedBooks(tx) {
  const sql = tx ?? sql;
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
        CREATE TABLE IF NOT EXISTS books (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            book_title VARCHAR(255) NOT NULL,
            isbn_code VARCHAR(20),
            language VARCHAR(50),
            author VARCHAR(255) NOT NULL,
            publisher VARCHAR(255) NOT NULL,
            cover_type VARCHAR(50),
            usage VARCHAR(50) NOT NULL,
            price NUMERIC(10, 2) NOT NULL,
            published_year INTEGER,
            description TEXT,
            book_type VARCHAR(50),
            content_type VARCHAR(50),
            genre VARCHAR(100),
            rating NUMERIC(3, 2) DEFAULT 0.00 NOT NULL,
            cover_image TEXT,
            themes TEXT[],
            stock INTEGER DEFAULT 0 NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        )`;
}

async function seedManageBooks(tx) {
  const sql = tx ?? sql;
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
        CREATE TABLE IF NOT EXISTS manage_books (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            book_id UUID REFERENCES books(id),
            copies INTEGER DEFAULT 0 NOT NULL,
            status VARCHAR(50) DEFAULT 'Not Specified' NOT NULL,
            comment TEXT,
            is_retired BOOLEAN DEFAULT FALSE NOT NULL,
            handle_by UUID REFERENCES staffs(id),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        )`;
}

async function seedCategories(tx) {
  const sql = tx ?? sql;
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
        CREATE TABLE IF NOT EXISTS categories (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            category_name VARCHAR(100) NOT NULL,
            number_of_items INTEGER DEFAULT 0 NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        )`;
}

async function seedInventory(tx) {
  const sql = tx ?? sql;
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
        CREATE TABLE IF NOT EXISTS inventory (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            item_name VARCHAR(255) NOT NULL,
            description TEXT,
            price NUMERIC(10, 2) NOT NULL,
            stock_quantity INTEGER DEFAULT 0 NOT NULL,
            item_image TEXT,
            comment TEXT,
            category_id UUID REFERENCES categories(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        )`;
}

async function seedInventoryLogs(tx) {
  const sql = tx ?? sql;
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
        CREATE TABLE IF NOT EXISTS inventory_logs (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            inventory_id UUID REFERENCES inventory(id),
            mode VARCHAR(50) NOT NULL,
            item_name VARCHAR(255) NOT NULL,
            category_id UUID REFERENCES categories(id),
            stock_before INTEGER NOT NULL,
            stock_after INTEGER NOT NULL,
            comment TEXT,
            handle_by UUID REFERENCES staffs(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        )`;
}

async function seedBookGenres(tx) {
  const sql = tx ?? sql;
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
        CREATE TABLE IF NOT EXISTS genres (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            genre_name VARCHAR(100) NOT NULL,
            number_of_books INTEGER DEFAULT 0 NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        )`;
}

async function seedBookLoans(tx) {
  const sql = tx ?? sql;
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
        CREATE TABLE IF NOT EXISTS loans (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            full_name VARCHAR(255) NOT NULL,
            loan_start DATE NOT NULL,
            loan_due DATE NOT NULL,
            book_name1 VARCHAR(255),
            book_name2 VARCHAR(255) NOT NULL,
            status VARCHAR(50) DEFAULT 'borrowed' NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        )`;

  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
      CREATE TABLE IF NOT EXISTS loans (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id UUID REFERENCES visitors(id) ON DELETE CASCADE,
        book_id1 UUID REFERENCES books(id) ON DELETE SET NULL NOT NULL,
        book_id2 UUID REFERENCES books(id) ON DELETE SET NULL,
        book_title1 VARCHAR(255) NOT NULL,
        book_title2 VARCHAR(255),
        genre1 VARCHAR(100),
        genre2 VARCHAR(100),
        cover_image1 TEXT,
        cover_image2 TEXT,
        price1 NUMERIC(10, 2),
        price2 NUMERIC(10, 2),
        total_price NUMERIC(10, 2) GENERATED ALWAYS AS (
          COALESCE(price1, 0) + COALESCE(price2, 0)
        ) STORED,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        loan_start DATE NOT NULL DEFAULT CURRENT_DATE,
        loan_due DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '7 days'),
        status VARCHAR(50) DEFAULT 'On Going' NOT NULL,
        extend_count INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      )
    `;
}

async function seedUserPreferences(tx) {
  const sql = tx ?? sql;
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
        CREATE TABLE IF NOT EXISTS preferences (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id),
            
            -- Demographic Info
            age_group VARCHAR(20),
            occupation VARCHAR(100),
            education_level VARCHAR(50),
            state VARCHAR(100),
            city VARCHAR(100),
            preferred_language VARCHAR(50),
            
            -- Reading Behavior & Preferences
            reading_frequency VARCHAR(50),
            reading_time_availability VARCHAR(20),
            reader_type VARCHAR(50),
            reading_goals INTEGER,
            reading_habits TEXT,
            
            -- Arrays for multiple selections
            favorite_genres TEXT[],
            preferred_book_types TEXT[],
            preferred_formats TEXT[],
            favorite_books TEXT[],
            desired_feelings TEXT[],
            disliked_genres TEXT[],
            
            -- Timestamps
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
            
            -- Ensure one preference record per user
            UNIQUE(user_id)
        )`;
}

export async function GET() {
  try {
    await sql.begin(async (tx) => {
      await seedUsers(tx);
      await seedShifts(tx);
      await seedSession(tx);
      await seedEvents(tx);
      await seedBooks(tx);
      await seedBookGenres(tx);
      await seedBookLoans(tx);
      await seedUserPreferences(tx);
      await seedMembershipApplications(tx);
      await seedEventReservations(tx);
      await seedCategories(tx);
      await seedInventory(tx);
      await seedInventoryLogs(tx);
      await seedManageBooks(tx);
    });

    return Response.json({
      success: true,
      message: "Database seeded successfully",
    });
  } catch (error) {
    console.error("Database seeding failed:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to seed database",
        // Only send safe error information
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}
