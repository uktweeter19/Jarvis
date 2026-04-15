export const metadata = {
  title: 'JARVIS',
  description: 'Family Intelligence System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
