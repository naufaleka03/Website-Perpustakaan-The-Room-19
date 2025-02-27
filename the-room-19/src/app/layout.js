import './globals.css'
import Header from '@/components/header'
import { poppins, manrope } from '@/components/fonts'

export const metadata = {
  title: 'The Room 19',
  description: 'Welcome to The Room 19',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-poppins`}>
        {/* <Header /> */}
        <main>{children}</main>
      </body>
    </html>
  )
}