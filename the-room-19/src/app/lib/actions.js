"use server";
import postgres from "postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

// Schema validation for session data
const SessionSchema = z.object({
  id: z.string(),
  category: z.string(),
  arrival_date: z.string(),
  shift_name: z.string(),
  full_name: z.string(),
  group_member1: z.string().nullable(),
  group_member2: z.string().nullable(),
  group_member3: z.string().nullable(),
  group_member4: z.string().nullable(),
  status: z.enum(["not attended", "attended", "canceled"]),
  payment_id: z.string().nullable(),
  payment_status: z.string().nullable(),
  payment_method: z.string().nullable(),
  amount: z.number().nullable(),
});

// Schema for updating session status
const UpdateSessionStatus = SessionSchema.pick({ status: true });

export async function submitSessionReservation(formData) {
  try {
    console.log("Received form data:", formData); // Debug log

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
      amount: formData.amount,
    };

    console.log("Formatted data for DB:", dbFormData);
    // Validation after conversion
    if (!dbFormData.category) throw new Error("Category is required");
    if (!dbFormData.arrival_date) throw new Error("Arrival date is required");
    if (!dbFormData.shift_name) throw new Error("Shift name is required");
    if (!dbFormData.full_name) throw new Error("Full name is required");
    if (
      formData.groupMember === "group" &&
      (!formData.members || formData.members.length === 0)
    ) {
      throw new Error("At least one group member is required");
    }

    // Check existing reservations for the same date and shift
    const existingReservations = await sql`
      SELECT COUNT(*) as count 
      FROM sessions 
      WHERE arrival_date = ${dbFormData.arrival_date} 
      AND shift_name = ${dbFormData.shift_name}
      AND status != 'canceled'
    `;

    if (existingReservations[0].count >= 2) {
      throw new Error(
        "Sorry, this shift is already fully booked. Please choose another shift or date."
      );
    }

    // Fetch shift details
    const [shift] = await sql`
      SELECT shift_start, shift_end FROM shifts
      WHERE shift_name = ${dbFormData.shift_name}
    `;

    if (!shift) throw new Error("Invalid shift selected");

    console.log("Inserting data:", dbFormData);

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
        ${"not_attended"},
        ${dbFormData.payment_id},
        ${dbFormData.payment_status},
        ${dbFormData.payment_method},
        ${dbFormData.amount}
      )
      RETURNING *
    `;

    console.log("Insert result:", result);
    return {
      success: true,
      data: result[0],
    };
  } catch (error) {
    console.error("Reservation submission error:", error);
    return {
      success: false,
      error: error.message || "Failed to submit reservation",
    };
  }
}

export async function submitEventCreation(formData) {
  try {
    const [month, day, year] = formData.event_date.split("-");
    const formattedDate = `${year}-${month}-${day}`;

    // Convert File object to base64 string if exists
    let posterUrl = formData.event_poster;
    if (formData.event_poster instanceof File) {
      const buffer = await formData.event_poster.arrayBuffer();
      const base64String = Buffer.from(buffer).toString("base64");
      posterUrl = `data:${formData.event_poster.type};base64,${base64String}`;
    }

    const dbFormData = {
      event_name: formData.event_name,
      description: formData.description,
      event_date: formattedDate,
      shift_name: formData.shift_name,
      max_participants: parseInt(formData.max_participants),
      ticket_fee: parseInt(formData.ticket_fee),
      additional_notes: formData.additional_notes,
      event_poster: posterUrl,
    };

    // Validasi data
    if (!dbFormData.event_name) throw new Error("Title is required");
    if (!dbFormData.event_date) throw new Error("Event date is required");
    if (!dbFormData.shift_name) throw new Error("Shift name is required");
    if (!dbFormData.ticket_fee) throw new Error("Price is required");

    // Fetch shift details
    const [shift] = await sql`
      SELECT shift_start, shift_end FROM shifts
      WHERE shift_name = ${dbFormData.shift_name}
    `;

    if (!shift) throw new Error("Invalid shift selected");

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
        event_poster,
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
        ${dbFormData.event_poster},
        NOW()
      ) RETURNING *
    `;

    return { success: true, data: newEvent };
  } catch (error) {
    console.error("Error creating event:", error);
    return { success: false, error: error.message };
  }
}

export async function submitEventUpdate(eventId, formData) {
  try {
    const [month, day, year] = formData.event_date.split("-");
    const formattedDate = `${year}-${month}-${day}`;

    // Convert File object to base64 string if exists
    let posterUrl = formData.event_poster;
    if (formData.event_poster instanceof File) {
      const buffer = await formData.event_poster.arrayBuffer();
      const base64String = Buffer.from(buffer).toString("base64");
      posterUrl = `data:${formData.event_poster.type};base64,${base64String}`;
    }

    const dbFormData = {
      event_name: formData.event_name,
      description: formData.description,
      event_date: formattedDate,
      shift_name: formData.shift_name,
      max_participants: parseInt(formData.max_participants),
      ticket_fee: parseInt(formData.ticket_fee),
      additional_notes: formData.additional_notes,
      event_poster: posterUrl,
    };

    // Validasi data
    if (!dbFormData.event_name) throw new Error("Title is required");
    if (!dbFormData.event_date) throw new Error("Event date is required");
    if (!dbFormData.shift_name) throw new Error("Shift name is required");
    if (!dbFormData.ticket_fee) throw new Error("Price is required");

    // Fetch shift details
    const [shift] = await sql`
      SELECT shift_start, shift_end FROM shifts
      WHERE shift_name = ${dbFormData.shift_name}
    `;

    if (!shift) throw new Error("Invalid shift selected");

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
        event_poster = ${dbFormData.event_poster}
      WHERE id = ${eventId}
      RETURNING *
    `;

    return { success: true, data: updatedEvent };
  } catch (error) {
    console.error("Error updating event:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Updates a session's status and handles slot availability
 */
export async function updateSessionStatus(id, formData) {
  const { status } = UpdateSessionStatus.parse({
    status: formData.get("status"),
  });
  const cancellationReason = formData.get("cancellationReason");

  try {
    // Get current session data to calculate slots to return if canceling
    const currentSession = await sql`
      SELECT * FROM sessions WHERE id = ${id}
    `;

    if (!currentSession || currentSession.length === 0) {
      throw new Error("Session not found");
    }

    // Update the session status
    const updatedSession = await sql`
      UPDATE sessions 
      SET 
        status = ${status},
        cancellation_reason = CASE 
          WHEN ${status} = 'canceled' THEN ${cancellationReason}
          ELSE cancellation_reason
        END
      WHERE id = ${id}
      RETURNING *
    `;

    // If canceling, calculate and log returned slots
    if (status === "canceled") {
      const slotsToReturn =
        1 + // Main person
        (currentSession[0].group_member1 ? 1 : 0) +
        (currentSession[0].group_member2 ? 1 : 0) +
        (currentSession[0].group_member3 ? 1 : 0) +
        (currentSession[0].group_member4 ? 1 : 0);

      console.log(`Returning ${slotsToReturn} slots to availability`);
    }

    // Revalidate the sessions page to show updated data
    revalidatePath("/staff/dashboard/data-collection");

    return {
      success: true,
      data: updatedSession[0],
      // Message shown when session status is successfully updated
      message: `Session status updated to ${status} successfully`,
    };
  } catch (error) {
    console.error("Error updating session status:", error);
    throw new Error(error.message || "Failed to update session status");
  }
}

/**
 * Checks session availability for a given date and shift
 */
export async function checkSessionAvailability(formData) {
  const data = {
    arrival_date: formData.get("arrival_date"),
    shift_name: formData.get("shift_name"),
    reservation_type: formData.get("reservation_type"),
    group_size: parseInt(formData.get("group_size") || "1"),
  };

  if (!data.arrival_date || !data.shift_name) {
    throw new Error("Arrival date and shift name are required");
  }

  try {
    const MAX_PEOPLE_PER_SHIFT = 18;

    // Get all active reservations for the given date and shift
    const existingReservations = await sql`
      SELECT 
        CASE 
          WHEN group_member1 IS NOT NULL THEN 
            1 + (CASE WHEN group_member2 IS NOT NULL THEN 1 ELSE 0 END) +
            (CASE WHEN group_member3 IS NOT NULL THEN 1 ELSE 0 END) +
            (CASE WHEN group_member4 IS NOT NULL THEN 1 ELSE 0 END)
          ELSE 1
        END as total_people
      FROM sessions 
      WHERE arrival_date = ${data.arrival_date}
      AND shift_name = ${data.shift_name}
      AND status != 'canceled'
    `;

    // Calculate total people already registered
    const totalExistingPeople = existingReservations.reduce(
      (sum, res) => sum + res.total_people,
      0
    );

    // Calculate remaining available slots
    const availableSlots = MAX_PEOPLE_PER_SHIFT - totalExistingPeople;

    // Check if there are enough slots for the requested reservation
    const requestedSlots =
      data.reservation_type === "group" ? data.group_size : 1;
    const isAvailable = availableSlots >= requestedSlots;

    return {
      available: isAvailable,
      current_people: totalExistingPeople,
      available_slots: availableSlots,
      max_people: MAX_PEOPLE_PER_SHIFT,
      message: isAvailable
        ? `Available ${availableSlots} slots out of a total of ${MAX_PEOPLE_PER_SHIFT} slots`
        : `Sorry, only ${availableSlots} slots remaining out of a total of ${MAX_PEOPLE_PER_SHIFT} slots`,
    };
  } catch (error) {
    console.error("Error checking availability:", error);
    throw new Error("Failed to check session availability");
  }
}

export async function submitEventReservation(formData) {
  try {
    console.log("Received form data:", formData);

    // Convert camelCase to snake_case for database consistency
    const dbFormData = {
      event_name: formData.event_name,
      description: formData.description,
      event_date: formData.event_date,
      shift_name: formData.shift_name,
      shift_start: formData.shift_start,
      shift_end: formData.shift_end,
      max_participants: formData.max_participants,
      ticket_fee: formData.ticket_fee,
      additional_notes: formData.additional_notes,
      full_name: formData.full_name,
      members: formData.members || [],
      status: "not_attended",
      payment_id: formData.payment_id,
      payment_status: formData.payment_status,
      payment_method: formData.payment_method,
    };

    // Validation
    if (!dbFormData.event_name) throw new Error("Event name is required");
    if (!dbFormData.event_date) throw new Error("Event date is required");
    if (!dbFormData.shift_name) throw new Error("Shift name is required");
    if (!dbFormData.full_name) throw new Error("Full name is required");

    // Insert reservation into database
    const result = await sql`
      INSERT INTO eventreservations (
        event_name,
        description,
        event_date,
        shift_name,
        shift_start,
        shift_end,
        max_participants,
        ticket_fee,
        additional_notes,
        full_name,
        group_member1,
        group_member2,
        group_member3,
        group_member4,
        status,
        payment_id,
        payment_status,
        payment_method,
        created_at
      )
      VALUES (
        ${dbFormData.event_name},
        ${dbFormData.description},
        ${dbFormData.event_date},
        ${dbFormData.shift_name},
        ${dbFormData.shift_start},
        ${dbFormData.shift_end},
        ${dbFormData.max_participants},
        ${dbFormData.ticket_fee},
        ${dbFormData.additional_notes},
        ${dbFormData.full_name},
        ${dbFormData.members[0] || null},
        ${dbFormData.members[1] || null},
        ${dbFormData.members[2] || null},
        ${dbFormData.members[3] || null},
        ${dbFormData.status},
        ${dbFormData.payment_id},
        ${dbFormData.payment_status},
        ${dbFormData.payment_method},
        NOW()
      )
      RETURNING *
    `;

    console.log("Event reservation created:", result);

    return {
      success: true,
      data: result[0],
    };
  } catch (error) {
    console.error("Event reservation submission error:", error);
    return {
      success: false,
      error: error.message || "Failed to submit event reservation",
    };
  }
}

export async function createCategory(formData) {
  try {
    const categoryName = formData.get("category_name");

    if (!categoryName) {
      throw new Error("Category name is required");
    }

    // Check if category already exists
    const existingCategory = await sql`
      SELECT * FROM categories 
      WHERE LOWER(category_name) = LOWER(${categoryName})
    `;

    if (existingCategory.length > 0) {
      throw new Error("Category already exists");
    }

    // Insert new category
    const result = await sql`
      INSERT INTO categories (
        category_name,
        number_of_items
      ) VALUES (
        ${categoryName},
        0
      )
      RETURNING *
    `;

    revalidatePath("/staff/dashboard/inventory/categorization-inventory");
    return { success: true, data: result[0] };
  } catch (error) {
    console.error("Error creating category:", error);
    return { success: false, error: error.message };
  }
}

export async function updateCategory(id, formData) {
  try {
    const categoryName = formData.get("category_name");

    if (!categoryName) {
      throw new Error("Category name is required");
    }

    // Check if category name already exists (excluding current category)
    const existingCategory = await sql`
      SELECT * FROM categories 
      WHERE LOWER(category_name) = LOWER(${categoryName})
      AND id != ${id}
    `;

    if (existingCategory.length > 0) {
      throw new Error("Category name already exists");
    }

    // Update category
    const result = await sql`
      UPDATE categories
      SET category_name = ${categoryName}
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      throw new Error("Category not found");
    }

    revalidatePath("/staff/dashboard/inventory/categorization-inventory");
    return { success: true, data: result[0] };
  } catch (error) {
    console.error("Error updating category:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteCategory(id) {
  try {
    // Check if category has items
    const category = await sql`
      SELECT number_of_items FROM categories
      WHERE id = ${id}
    `;

    if (category[0]?.number_of_items > 0) {
      throw new Error("Cannot delete category with existing items");
    }

    // Delete category
    const result = await sql`
      DELETE FROM categories
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      throw new Error("Category not found");
    }

    revalidatePath("/staff/dashboard/inventory/categorization-inventory");
    return { success: true, data: result[0] };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: error.message };
  }
}

export async function updateBookStock(id, formData) {
  try {
    const stock = parseInt(formData.get("stock"));

    if (isNaN(stock) || stock < 0) {
      throw new Error("Stock must be a valid non-negative number");
    }

    // Update book stock
    const result = await sql`
      UPDATE books
      SET stock = ${stock}
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      throw new Error("Book not found");
    }

    revalidatePath("/staff/dashboard/inventory/manage-books");
    return { success: true, data: result[0] };
  } catch (error) {
    console.error("Error updating book stock:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteBook(id) {
  try {
    // Check if book exists
    const book = await sql`
      SELECT * FROM books
      WHERE id = ${id}
    `;

    if (book.length === 0) {
      throw new Error("Book not found");
    }

    // Delete book
    await sql`
      DELETE FROM books
      WHERE id = ${id}
    `;

    revalidatePath("/staff/dashboard/inventory/manage-books");
    return { success: true, message: "Book deleted successfully" };
  } catch (error) {
    console.error("Error deleting book:", error);
    return { success: false, error: error.message };
  }
}

export async function submitInventoryItem(formData) {
  try {
    // Validate required fields
    if (!formData.item_name) throw new Error("Item name is required");
    if (!formData.price) throw new Error("Price is required");

    // Insert item into database
    const result = await sql`
      INSERT INTO inventory (
        item_name,
        description,
        price,
        stock_quantity,
        item_image
      ) VALUES (
        ${formData.item_name},
        ${formData.description},
        ${formData.price},
        ${formData.stock_quantity},
        ${formData.item_image}
      )
      RETURNING *
    `;

    revalidatePath("/staff/dashboard/inventory/manage-inventory");
    return { success: true, data: result[0] };
  } catch (error) {
    console.error("Error creating inventory item:", error);
    return { success: false, error: error.message };
  }
}
