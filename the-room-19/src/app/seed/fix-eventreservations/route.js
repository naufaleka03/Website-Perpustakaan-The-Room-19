import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

async function fixEventReservationsTable() {
  try {
    // Drop tabel eventreservations jika sudah ada
    console.log("Dropping eventreservations table...");
    await sql`DROP TABLE IF EXISTS eventreservations CASCADE`;

    // Membuat tabel eventreservations baru dengan referensi ke visitors dan shifts
    console.log("Creating new eventreservations table...");
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    await sql`
      CREATE TABLE IF NOT EXISTS eventreservations (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id UUID REFERENCES visitors(id) ON DELETE CASCADE,
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
      )
    `;

    return true;
  } catch (error) {
    console.error("Error fixing eventreservations table:", error);
    throw error;
  }
}

export async function GET() {
  try {
    await fixEventReservationsTable();

    // Periksa foreign keys setelah perubahan
    const foreignKeys = await sql`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE
        tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'eventreservations'
    `;

    return Response.json({
      success: true,
      message: "Event Reservations table fixed successfully",
      foreignKeys,
    });
  } catch (error) {
    console.error("Failed to fix eventreservations table:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to fix eventreservations table",
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
