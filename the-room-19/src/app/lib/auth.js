import { supabase } from './supabase-client';

// Sign up function
export async function signUpWithEmail(email, password, fullName, phoneNumber) {
  const { user, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  // Insert the user's additional information into the visitors table
  const { error: visitorError } = await supabase
    .from('visitors')
    .insert([{ id: user.id, name: fullName, email, phone_number: phoneNumber }]);

  if (visitorError) throw visitorError;

  return user;
}

// Log in function
export async function logInWithEmail(email, password) {
  const { user, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return user;
}

// Log out function
export async function logOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// User sessions
export function onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }