'use server'
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

export async function submitSessionReservation(formData) {
  try {
    console.log('Received form data:', formData); // Debug log

    // Convert camelCase to snake_case for database consistency
    const dbFormData = {
      category: formData.category,
      arrival_date: formData.arrivalDate || formData.arrival_date,
      shift_name: formData.shiftName || formData.shift_name,
      full_name: formData.fullName || formData.full_name,
      members: formData.members || [],
      payment_id: formData.payment_id,
      payment_status: formData.payment_status,
      payment_method: formData.payment_method,
      amount: formData.amount
    };

    console.log('Formatted data for DB:', dbFormData); 
    // Validation after conversion
    if (!dbFormData.category) throw new Error('Category is required');
    if (!dbFormData.arrival_date) throw new Error('Arrival date is required');
    if (!dbFormData.shift_name) throw new Error('Shift name is required');
    if (!dbFormData.full_name) throw new Error('Full name is required');
    if (formData.groupMember === 'group' && (!formData.members || formData.members.length === 0)) {
      throw new Error('At least one group member is required');
    }

    // Fetch shift details
    const [shift] = await sql`
      SELECT shift_start, shift_end FROM shifts
      WHERE shift_name = ${dbFormData.shift_name}
    `;

    if (!shift) throw new Error('Invalid shift selected');

    console.log('Inserting data:', dbFormData); // Debug log

    // Insert reservation with payment details
    const result = await sql`
      INSERT INTO sessions (
        category, 
        arrival_date,
        shift_name,
        shift_start,
        shift_end,
        full_name,
        group_member1,
        group_member2,
        group_member3,
        group_member4,
        status,
        payment_id,
        payment_status,
        payment_method,
        amount
      )
      VALUES (
        ${dbFormData.category},
        ${dbFormData.arrival_date},
        ${dbFormData.shift_name},
        ${shift.shift_start},
        ${shift.shift_end},
        ${dbFormData.full_name},
        ${dbFormData.members[0] || null},
        ${dbFormData.members[1] || null},
        ${dbFormData.members[2] || null},
        ${dbFormData.members[3] || null},
        ${'not_attended'},
        ${dbFormData.payment_id},
        ${dbFormData.payment_status},
        ${dbFormData.payment_method},
        ${dbFormData.amount}
      )
      RETURNING *
    `;

    console.log('Insert result:', result); 
    return { 
      success: true,
      data: result[0]
    };
  } catch (error) {
    console.error('Reservation submission error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to submit reservation' 
    };
  }
}

export async function submitEventCreation(formData) {
  try {
    const [month, day, year] = formData.event_date.split('-');
    const formattedDate = `${year}-${month}-${day}`;

    // Convert File object to base64 string if exists
    let posterUrl = formData.activity_poster;
    if (formData.activity_poster instanceof File) {
      const buffer = await formData.activity_poster.arrayBuffer();
      const base64String = Buffer.from(buffer).toString('base64');
      posterUrl = `data:${formData.activity_poster.type};base64,${base64String}`;
    }

    const dbFormData = {
      event_name: formData.event_name,
      description: formData.description,
      event_date: formattedDate,
      shift_name: formData.shift_name,
      max_participants: parseInt(formData.max_participants),
      ticket_fee: parseInt(formData.ticket_fee),
      additional_notes: formData.additional_notes,
      activity_poster: posterUrl,
    };

    // Validasi data
    if (!dbFormData.event_name) throw new Error('Title is required');
    if (!dbFormData.event_date) throw new Error('Event date is required');
    if (!dbFormData.shift_name) throw new Error('Shift name is required');
    if (!dbFormData.ticket_fee) throw new Error('Price is required');

    // Fetch shift details
    const [shift] = await sql`
      SELECT shift_start, shift_end FROM shifts
      WHERE shift_name = ${dbFormData.shift_name}
    `;

    if (!shift) throw new Error('Invalid shift selected');

    // Insert ke database dengan shift details
    const [newEvent] = await sql`
      INSERT INTO events (
        event_name,
        description,
        event_date,
        shift_name,
        shift_start,
        shift_end,
        max_participants,
        ticket_fee,
        additional_notes,
        activity_poster,
        created_at
      ) VALUES (
        ${dbFormData.event_name},
        ${dbFormData.description},
        ${dbFormData.event_date}::date,
        ${dbFormData.shift_name},
        ${shift.shift_start},
        ${shift.shift_end},
        ${dbFormData.max_participants},
        ${dbFormData.ticket_fee},
        ${dbFormData.additional_notes},
        ${dbFormData.activity_poster},
        NOW()
      ) RETURNING *
    `;

    return { success: true, data: newEvent };
  } catch (error) {
    console.error('Error creating event:', error);
    return { success: false, error: error.message };
  }
}

export async function submitEventUpdate(eventId, formData) {
  try {
    const [month, day, year] = formData.event_date.split('-');
    const formattedDate = `${year}-${month}-${day}`;

    // Convert File object to base64 string if exists
    let posterUrl = formData.activity_poster;
    if (formData.activity_poster instanceof File) {
      const buffer = await formData.activity_poster.arrayBuffer();
      const base64String = Buffer.from(buffer).toString('base64');
      posterUrl = `data:${formData.activity_poster.type};base64,${base64String}`;
    }

    const dbFormData = {
      event_name: formData.event_name,
      description: formData.description,
      event_date: formattedDate,
      shift_name: formData.shift_name,
      max_participants: parseInt(formData.max_participants),
      ticket_fee: parseInt(formData.ticket_fee),
      additional_notes: formData.additional_notes,
      activity_poster: posterUrl,
    };

    // Validasi data
    if (!dbFormData.event_name) throw new Error('Title is required');
    if (!dbFormData.event_date) throw new Error('Event date is required');
    if (!dbFormData.shift_name) throw new Error('Shift name is required');
    if (!dbFormData.ticket_fee) throw new Error('Price is required');

    // Fetch shift details
    const [shift] = await sql`
      SELECT shift_start, shift_end FROM shifts
      WHERE shift_name = ${dbFormData.shift_name}
    `;

    if (!shift) throw new Error('Invalid shift selected');

    // Update event di database
    const [updatedEvent] = await sql`
      UPDATE events
      SET 
        event_name = ${dbFormData.event_name},
        description = ${dbFormData.description},
        event_date = ${dbFormData.event_date}::date,
        shift_name = ${dbFormData.shift_name},
        shift_start = ${shift.shift_start},
        shift_end = ${shift.shift_end},
        max_participants = ${dbFormData.max_participants},
        ticket_fee = ${dbFormData.ticket_fee},
        additional_notes = ${dbFormData.additional_notes},
        activity_poster = ${dbFormData.activity_poster}
      WHERE id = ${eventId}
      RETURNING *
    `;

    return { success: true, data: updatedEvent };
  } catch (error) {
    console.error('Error updating event:', error);
    return { success: false, error: error.message };
  }
}

// Create genre
export async function createGenre(formData) {
  console.log('[POST] Creating new genre...');
  const genre_name = formData.get('genre_name');

  // Validasi sederhana
  if (!genre_name || genre_name.trim() === '') {
      console.error('[POST] Error: Genre name is required');
      throw new Error('Genre name is required');
  }

  try {
      const result = await sql`
          INSERT INTO genres (genre_name, number_of_books)
          VALUES (${genre_name.trim()}, ${0})
          RETURNING *
      `;
      
      console.log('[POST] Genre created successfully:', result[0]);
      revalidatePath('/dashboard/book-management/genre-settings');
      return { success: true, data: result[0] };
  } catch (error) {
      console.error('[POST] Error creating genre:', error);
      return { success: false, error: error.message };
  }
}

// Update genre
export async function updateGenre(id, formData) {
  console.log('[PUT] Updating genre with ID:', id);
  const genre_name = formData.get('genre_name');

  // Validasi sederhana
  if (!genre_name || genre_name.trim() === '') {
      console.error('[PUT] Error: Genre name is required');
      throw new Error('Genre name is required');
  }

  try {
      // Cek apakah genre dengan ID tersebut ada
      const existingGenre = await sql`
          SELECT * FROM genres WHERE id = ${id}
      `;

      if (existingGenre.length === 0) {
          console.error('[PUT] Error: Genre not found');
          throw new Error('Genre not found');
      }

      const result = await sql`
          UPDATE genres
          SET 
              genre_name = ${genre_name.trim()},
              number_of_books = ${existingGenre[0].number_of_books}
          WHERE id = ${id}
          RETURNING *
      `;

      if (result.length > 0) {
          console.log('[PUT] Genre updated successfully:', result[0]);
          // Revalidate path terlebih dahulu
          revalidatePath('/dashboard/book-management/genre-settings');
          // Kembalikan hasil sukses
          return { success: true, data: result[0] };
      } else {
          throw new Error('Failed to update genre: No rows updated');
      }
  } catch (error) {
      console.error('[PUT] Error updating genre:', error);
      return { success: false, error: error.message };
  }
}

// Delete genre
export async function deleteGenre(id) {
  console.log('[DELETE] Deleting genre with ID:', id);
  
  if (!id) {
      console.error('[DELETE] Error: Genre ID is required');
      throw new Error('Genre ID is required');
  }

  try {
      // Cek apakah genre dengan ID tersebut ada
      const existingGenre = await sql`
          SELECT * FROM genres WHERE id = ${id}
      `;

      if (existingGenre.length === 0) {
          console.error('[DELETE] Error: Genre not found');
          throw new Error('Genre not found');
      }

      const result = await sql`
          DELETE FROM genres 
          WHERE id = ${id}
          RETURNING *
      `;

      console.log('[DELETE] Genre deleted successfully:', result[0]);
      revalidatePath('/dashboard/book-management/genre-settings');
  } catch (error) {
      console.error('[DELETE] Error deleting genre:', error);
      throw new Error(`Failed to delete genre: ${error.message}`);
  }
}

// Get all genres (tambahan untuk logging)
export async function getGenres() {
  console.log('[GET] Fetching all genres...');
  
  try {
      const result = await sql`
          SELECT * FROM genres 
          ORDER BY created_at DESC
      `;
      
      console.log('[GET] Successfully fetched genres:', result.length, 'records');
      return result;
  } catch (error) {
      console.error('[GET] Error fetching genres:', error);
      throw new Error(`Failed to fetch genres: ${error.message}`);
  }
}