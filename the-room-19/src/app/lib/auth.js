'use client';
import { createClient } from '@/app/supabase/client';

// Define user types
export const USER_TYPES = {
  VISITOR: 'visitor',
  STAFF: 'staff',
  OWNER: 'owner'
};

// Original visitor signup function
export async function signUpVisitor(email, password, fullName, phoneNumber) {
  const supabase = createClient();
  try {
    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: fullName,
          phone_number: phoneNumber
        }
      }
    });

    if (error) {
      console.error('Auth signup error:', error);
      throw error;
    }
    if (!data.user) {
      throw new Error('Signup failed: No user data returned');
    }

    // Verify the visitors table exists
    const { error: tableError } = await supabase
      .from('visitors')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('Visitors table error:', tableError);
      throw new Error('Visitors table not accessible');
    }

    // Insert into visitors table
    const { error: visitorError } = await supabase
      .from('visitors')
      .insert([{ 
        id: data.user.id, 
        name: fullName, 
        email, 
        phone_number: phoneNumber 
      }]);

    if (visitorError) {
      console.error('Raw visitor error:', visitorError);
      if (visitorError.code === '23503') {
        throw new Error('Foreign key constraint failed. User might not exist in auth.users table.');
      }
      throw new Error(`Failed to create visitor profile: ${visitorError.message}`);
    }

    // Verify the preferences table exists
    const { error: prefTableError } = await supabase
      .from('preferences')
      .select('id')
      .limit(1);

    if (prefTableError) {
      console.error('Preferences table error:', prefTableError);
      throw new Error('Preferences table not accessible');
    }

    // Insert into preferences table
    const { error: preferencesError } = await supabase
      .from('preferences')
      .insert([{
        user_id: data.user.id,
        // Initialize with default values
        age_group: null,
        occupation: null,
        education_level: null,
        state: null,
        city: null,
        preferred_language: null,
        reading_frequency: null,
        reading_time_availability: null,
        reader_type: null,
        reading_goals: null,
        reading_habits: null,
        favorite_genres: [],
        preferred_book_types: [],
        preferred_formats: [],
        favorite_books: [],
        desired_feelings: [],
        disliked_genres: []
      }]);

    if (preferencesError) {
      console.error('Raw preferences error:', preferencesError);
      if (preferencesError.code === '23503') {
        throw new Error('Foreign key constraint failed for preferences. User might not exist in auth.users table.');
      }
      throw new Error(`Failed to create preferences profile: ${preferencesError.message}`);
    }

    return {
      user: data.user,
      message: 'Please check your email to verify your account'
    };
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
}

// New function for staff/owner registration (admin only)
export async function registerUser(userType, userData) {
  const supabase = createClient();
  if (!['staff', 'owner'].includes(userType)) {
    throw new Error('Invalid user type for registration');
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (error) throw error;
    if (!data.user) {
      throw new Error('Registration failed: No user data returned');
    }

    const commonData = {
      id: data.user.id,
      name: userData.fullName,
      email: userData.email,
      phone_number: userData.phoneNumber
    };

    let tableError;
    if (userType === 'staff') {
      const { error: staffError } = await supabase
        .from('staff')
        .insert([{
          ...commonData,
          position: userData.position,
          hire_date: new Date().toISOString(),
          employee_id: userData.employeeId
        }]);
      tableError = staffError;
    } else {
      const { error: ownerError } = await supabase
        .from('owners')
        .insert([{
          ...commonData,
          business_registration_number: userData.businessRegNumber,
          ownership_date: new Date().toISOString()
        }]);
      tableError = ownerError;
    }

    if (tableError) {
      await supabase.auth.signOut();
      throw new Error(`Failed to create ${userType} profile: ${tableError.message}`);
    }

    return data.user;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

// Log in function
export async function logInWithEmail(email, password) {
  const supabase = createClient();
  try {
    console.log('Auth: Attempting login for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Auth: Supabase login error:', error);
      throw error;
    }

    if (!data.user) {
      throw new Error('No user data returned from authentication');
    }
    
    console.log('Auth: Supabase login successful, user ID:', data.user.id);

    // Check which type of user they are
    const tables = ['visitors', 'staffs', 'owners'];
    let userType = null;
    let userData = null;

    console.log('Auth: Checking user tables...');
    
    for (const table of tables) {
      console.log('Auth: Querying table:', table);
      const { data: tableData, error: tableError } = await supabase
        .from(table)
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (tableError) {
        console.log('Auth: Table query error for', table, ':', tableError);
        continue;
      }

      if (tableData) {
        userType = table.slice(0, -1); // Remove 's' from end
        userData = tableData;
        console.log('Auth: Found user in table:', table, 'userType:', userType);
        break;
      } else {
        console.log('Auth: No data found in table:', table);
      }
    }

    if (!userType) {
      console.error('Auth: User profile not found in any table');
      throw new Error('User profile not found');
    }

    console.log('Auth: Login complete, returning user type:', userType);
    return { user: data.user, userType, userData };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Log out function
export async function logOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// User sessions
export function onAuthStateChange(callback) {
  const supabase = createClient();
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}