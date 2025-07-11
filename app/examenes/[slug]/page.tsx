// app/examenes/[slug]/page.tsx
import fs from 'fs/promises'
import path from 'path'
import ExamClient from '../../../components/ExamClient'

export async function generateStaticParams() {
  const files = await fs.readdir(path.join(process.cwd(), 'assets'))
  return files.map(f => ({ slug: f.replace('.json', '') }))
}

type PageProps = {
  params: { slug: string }
}

export default async function Page({ params }: PageProps) {
  const filePath = path.join(process.cwd(), 'assets', `${params.slug}.json`)
  const raw      = await fs.readFile(filePath, 'utf8')
  const examen   = JSON.parse(raw)

  return <ExamClient examen={examen} slug={params.slug} />
}
