import { supabase } from '../lib/supabase-client';

export async function requireAuth(req, res, next) {
  const { user, error } = await supabase.auth.getUser();

  if (error || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.user = user;
  next();
}
