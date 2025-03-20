import './globals.css'
import { poppins, manrope } from '@/components/fonts'


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