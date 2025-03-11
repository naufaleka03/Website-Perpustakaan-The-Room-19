import './globals.css'
import { Poppins } from 'next/font/google'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
})

export const metadata = {
  title: 'The Room 19',
  description: 'Welcome to The Room 19',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script 
          type="text/javascript"
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        />
      </head>
      <body className={`${poppins.variable} font-poppins`}>
        <main>{children}</main>
      </body>
    </html>
  )
}