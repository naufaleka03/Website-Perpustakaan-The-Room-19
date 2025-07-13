import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/user', '/staff', '/owner'];

// Role-based route access
const roleRoutes = {
  'visitor': ['/user'],
  'staff': ['/staff'],
  'owner': ['/owner']
};

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name, options) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: user } = await supabase.auth.getUser();

  // Get the pathname from the request URL
  const { pathname } = request.nextUrl;
  console.log('Middleware: Current pathname:', pathname);
  
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute && !user) {
    console.log('Middleware: No session, redirecting to login');
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  if (user && isProtectedRoute) {
    const userId = user.user.id;
    console.log('Middleware: Checking user type for ID:', userId);
    
    // Check user type in the database tables
    const tables = ['visitors', 'staffs', 'owners'];
    let userType = null;
    
    for (const table of tables) {
      console.log(`Middleware: Querying table: ${table} for user ID: ${userId}`);
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.log(`Middleware: Error querying table ${table}:`, error);
      }

      console.log(`Middleware: Query result for table ${table}:`, data);
      
      if (data) {
        userType = table.slice(0, -1); // Remove 's' from end
        console.log('Middleware: Found user type:', userType);
        break;
      }
    }
    
    if (!userType) {
      console.log('Middleware: No user type found, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Check if user has access to this route based on their role
    const allowedRoutes = roleRoutes[userType] || [];
    const hasAccess = allowedRoutes.some(route => pathname.startsWith(route));
    
    if (!hasAccess) {
      const dashboardPath = userType === 'visitor' ? '/user/dashboard' : `/${userType}/dashboard`;
      console.log('Middleware: Redirecting to dashboard:', dashboardPath);
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }
  }

  return response
}

// Configure which routes the middleware should run on
export const config = {
  matcher: ['/user/:path*', '/staff/:path*', '/owner/:path*'],
}
