import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = cookies()
    
    // Karena Next.js 15 mengharuskan cookies() sebagai async API
    // kita harus menggunakan await untuk mendapatkan data cookies
    const allCookies = cookieStore.getAll()
    
    // Catat nama dan nilai cookies (hapus nilai yang sensitif seperti token auth sebelum log)
    const cookieNames = allCookies.map(cookie => ({
      name: cookie.name,
      // Jangan tampilkan nilai penuh untuk cookie auth
      hasValue: !!cookie.value,
      isAuth: cookie.name.includes('auth')
    }))
    
    return Response.json({
      success: true,
      message: 'Cookies debug info',
      cookieCount: allCookies.length,
      cookieNames
    })
  } catch (error) {
    console.error('Error debugging cookies:', error)
    
    return Response.json({
      success: false,
      message: 'Error debugging cookies',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, {
      status: 500
    })
  }
} 