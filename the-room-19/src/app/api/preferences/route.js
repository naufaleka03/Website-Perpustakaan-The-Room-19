import postgres from 'postgres';
const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const user_id = searchParams.get('user_id');
  if (!user_id) return Response.json({ error: 'user_id required' }, { status: 400 });
  const prefs = await sql`SELECT * FROM preferences WHERE user_id = ${user_id}`;
  if (!prefs.length) return Response.json({ error: 'not found' }, { status: 404 });
  return Response.json(prefs[0]);
}

export async function POST(request) {
  const body = await request.json();
  const {
    user_id, age_group, occupation, education_level, state, city, preferred_language,
    reading_frequency, reading_time_availability, reader_type, reading_goals, reading_habits,
    favorite_genres, preferred_book_types, preferred_formats, favorite_books, desired_feelings, disliked_genres
  } = body;

  // Upsert logic
  const result = await sql`
    INSERT INTO preferences (
      user_id, age_group, occupation, education_level, state, city, preferred_language,
      reading_frequency, reading_time_availability, reader_type, reading_goals, reading_habits,
      favorite_genres, preferred_book_types, preferred_formats, favorite_books, desired_feelings, disliked_genres
    ) VALUES (
      ${user_id}, ${age_group}, ${occupation}, ${education_level}, ${state}, ${city}, ${preferred_language},
      ${reading_frequency}, ${reading_time_availability}, ${reader_type}, ${reading_goals}, ${reading_habits},
      ${favorite_genres}, ${preferred_book_types}, ${preferred_formats}, ${favorite_books}, ${desired_feelings}, ${disliked_genres}
    )
    ON CONFLICT (user_id) DO UPDATE SET
      age_group = EXCLUDED.age_group,
      occupation = EXCLUDED.occupation,
      education_level = EXCLUDED.education_level,
      state = EXCLUDED.state,
      city = EXCLUDED.city,
      preferred_language = EXCLUDED.preferred_language,
      reading_frequency = EXCLUDED.reading_frequency,
      reading_time_availability = EXCLUDED.reading_time_availability,
      reader_type = EXCLUDED.reader_type,
      reading_goals = EXCLUDED.reading_goals,
      reading_habits = EXCLUDED.reading_habits,
      favorite_genres = EXCLUDED.favorite_genres,
      preferred_book_types = EXCLUDED.preferred_book_types,
      preferred_formats = EXCLUDED.preferred_formats,
      favorite_books = EXCLUDED.favorite_books,
      desired_feelings = EXCLUDED.desired_feelings,
      disliked_genres = EXCLUDED.disliked_genres,
      updated_at = NOW()
    RETURNING *;
  `;
  return Response.json(result[0]);
}
