import postgres from "postgres";
import { NextResponse } from "next/server";

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

export async function GET() {
  try {
    // Add cancellation_reason column if it doesn't exist
    await sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'sessions' 
          AND column_name = 'cancellation_reason'
        ) THEN 
          ALTER TABLE sessions 
          ADD COLUMN cancellation_reason TEXT;
        END IF;
      END $$;
    `;

    return NextResponse.json({
      success: true,
      message: "Migration completed successfully",
    });
  } catch (error) {
    console.error("Migration failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to run migration",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}
