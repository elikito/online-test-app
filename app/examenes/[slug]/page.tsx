// app/examenes/[slug]/page.tsx
import fs from 'fs/promises'
import path from 'path'
import ExamClient from '../../../components/ExamClient'

export async function generateStaticParams() {
  const dir = path.join(process.cwd(), 'assets')
  const files = await fs.readdir(dir)
  return files.map(file => ({
    slug: file.replace('.json', '')
  }))
}

export default async function Page({ params }: { params: { slug: string } }) {
  const filePath = path.join(process.cwd(), 'assets', `${params.slug}.json`)
  const raw = await fs.readFile(filePath, 'utf8')
  const examen = JSON.parse(raw)

  return <ExamClient examen={examen} slug={params.slug} />
}
