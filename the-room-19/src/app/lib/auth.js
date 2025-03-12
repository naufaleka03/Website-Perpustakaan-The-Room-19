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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) {
      throw new Error('Signup failed: No user data returned');
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
      await supabase.auth.signOut();
      throw new Error(`Failed to create visitor profile: ${visitorError.message}`);
    }

    return data.user;
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