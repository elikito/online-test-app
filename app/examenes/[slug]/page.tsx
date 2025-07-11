import fs from 'fs/promises'
import path from 'path'
import ExamClient from '../../../components/ExamClient'

export async function generateStaticParams() {
  const dir = path.join(process.cwd(), 'assets')
  const files = await fs.readdir(dir)
  return files.map((f) => ({ slug: f.replace('.json', '') }))
}

// esta es la clave: declaramos la página como `const` y usamos `satisfies`
const Page = async ({ params }: { params: { slug: string } }) => {
  const filePath = path.join(process.cwd(), 'assets', `${params.slug}.json`)
  const raw = await fs.readFile(filePath, 'utf8')
  const examen = JSON.parse(raw)

  return <ExamClient examen={examen} slug={params.slug} />
}

export default Page
