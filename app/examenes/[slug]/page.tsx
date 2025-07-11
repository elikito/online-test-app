// app/examenes/[slug]/page.tsx
import fs from 'fs/promises'
import path from 'path'
import ExamClient from '../../../components/ExamClient'

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const dir   = path.join(process.cwd(), 'assets')
  const files = await fs.readdir(dir)
  return files.map(f => ({ slug: f.replace(/\.json$/, '') }))
}

// No uses un type PageProps propio ni <PageProps> genérico
export default async function Page({
  params: { slug }
}: {
  params: { slug: string }
}) {
  const filePath = path.join(process.cwd(), 'assets', `${slug}.json`)
  const raw      = await fs.readFile(filePath, 'utf8')
  const examen   = JSON.parse(raw)

  return <ExamClient examen={examen} slug={slug} />
}
