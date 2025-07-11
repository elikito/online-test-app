// app/layout.tsx
import './globals.css'    // aquí metemos Tailwind y tus overrides

export const metadata = {
  title: 'Online Test App',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-50 min-h-screen">
        <header className="bg-blue-600 text-white p-4">
          <h1 className="text-2xl font-bold">Online Test App</h1>
        </header>
        <main className="p-6">{children}</main>
      </body>
    </html>
  )
}
