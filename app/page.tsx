// app/page.tsx
import fs from 'fs/promises'
import path from 'path'
import Link from 'next/link'

export default async function Home() {
  const dir = path.join(process.cwd(), 'assets')
  const files = await fs.readdir(dir)
  const exams = files.map(f => f.replace('.json', ''))

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Selecciona un examen:</h2>
      <ul className="list-disc pl-5 space-y-2">
        {exams.map(slug => (
          <li key={slug}>
            <Link
              href={`/examenes/${slug}`}
              className="text-blue-600 hover:underline">
              {slug.replace(/-/g, ' ')}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
