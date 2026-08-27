import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getOrCreateDeviceIdentity, attachDeviceCookie } from '@/lib/security/device-identity'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next()

  // Initialize device identity cookie if missing
  const deviceIdentity = getOrCreateDeviceIdentity(req)
  if (deviceIdentity.isNew) {
    res = attachDeviceCookie(res, deviceIdentity.signedCookieValue)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Skip supabase auth middleware if not configured (build time)
    return res
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storageKey: 'nepalreforms.auth',
    },
    cookies: {
      getAll() {
        return req.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          res.cookies.set(name, value, options)
        })
      },
    },
  })

  const isApiAdmin = req.nextUrl.pathname.startsWith('/api/admin')
  const isAdminPage = req.nextUrl.pathname.startsWith('/admin')

  // Only check Supabase Auth for Admin areas
  if (isApiAdmin || isAdminPage) {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      if (isApiAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const loginUrl = new URL('/auth/login', req.url)
      loginUrl.searchParams.set('redirect', req.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Role check via profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile?.role || (profile.role !== 'admin' && profile.role !== 'moderator')) {
      if (isApiAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return res
}

export const config = {
  // Run on all routes except static files and images
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
