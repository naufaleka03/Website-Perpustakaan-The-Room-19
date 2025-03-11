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

  const { data: { session } } = await supabase.auth.getSession()

  // Get the pathname from the request URL
  const { pathname } = request.nextUrl;
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  // If the user is logged in, check role-based access
  if (session && isProtectedRoute) {
    const userId = session.user.id;
    
    // Check user type in the database tables
    const tables = ['visitors', 'staff', 'owners'];
    let userType = null;
    
    for (const table of tables) {
      const { data } = await supabase
        .from(table)
        .select('id')
        .eq('id', userId)
        .single();
      
      if (data) {
        userType = table.slice(0, -1); // Remove 's' from end
        break;
      }
    }
    
    if (!userType) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Check if user has access to this route based on their role
    const allowedRoutes = roleRoutes[userType] || [];
    const hasAccess = allowedRoutes.some(route => pathname.startsWith(route));
    
    if (!hasAccess) {
      const dashboardUrl = new URL(`/${userType === 'visitor' ? 'user' : userType}/dashboard`, request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return response
}

// Configure which routes the middleware should run on
export const config = {
  matcher: ['/user/:path*', '/staff/:path*', '/owner/:path*'],
}
