'use server'
import postgres from 'postgres';

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

    console.log('Formatted data for DB:', dbFormData); // Debug log

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

    console.log('Insert result:', result); // Debug log

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