'use server'
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

export async function submitSessionReservation(formData) {
  try {
    // Validasi manual
    if (!formData.category) throw new Error('Category is required');
    if (!formData.arrivalDate) throw new Error('Arrival date is required');
    if (!formData.shiftName) throw new Error('Shift name is required');
    if (!formData.fullName) throw new Error('Full name is required');
    if (formData.groupMember === 'group' && (!formData.members || formData.members.length === 0)) {
      throw new Error('At least one group member is required');
    }

    // Fetch shift details
    const [shift] = await sql`
      SELECT shift_start, shift_end FROM shifts
      WHERE shift_name = ${formData.shiftName}
    `;

    if (!shift) throw new Error('Invalid shift selected');

    await sql`
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
        group_member4
      )
      VALUES (
        ${formData.category},
        ${formData.arrivalDate},
        ${formData.shiftName},
        ${shift.shift_start},
        ${shift.shift_end},
        ${formData.fullName},
        ${formData.members[0] || null},
        ${formData.members[1] || null},
        ${formData.members[2] || null},
        ${formData.members[3] || null}
      )
    `;

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error.message || 'Failed to submit reservation' 
    };
  }
}