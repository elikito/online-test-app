'use client'

import { useState, useEffect } from 'react'

type Opcion = {
  clave: string
  texto: string
  correcta: boolean
}

type PreguntaInput = {
  id: number
  pregunta: string
  opciones: Record<string, string>
  respuesta_correcta: string | null
}

type ExamenInput = {
  nombre: string
  preguntas: PreguntaInput[]
}

interface ExamClientProps {
  examen: ExamenInput
  slug: string
}

export default function ExamClient({ examen, slug }: ExamClientProps) {
  const storageKey = `examProgress_${slug}`
  const questionTime = 30  // segundos por pregunta

  // Estados
  const [order, setOrder]             = useState<number[] | null>(null)
  const [pointer, setPointer]         = useState(0)
  const [correctCount, setCorrect]    = useState(0)
  const [incorrectCount, setIncorrect]= useState(0)
  const [answered, setAnswered]       = useState(false)
  const [feedback, setFeedback]       = useState<string | null>(null)
  const [timeLeft, setTimeLeft]       = useState(questionTime)

  // 1) Cargar o inicializar progreso y orden barajado
  useEffect(() => {
    const saved = typeof window !== 'undefined'
      ? localStorage.getItem(storageKey)
      : null

    if (saved) {
      const { order, pointer, correctCount, incorrectCount } = JSON.parse(saved)
      setOrder(order)
      setPointer(pointer)
      setCorrect(correctCount)
      setIncorrect(incorrectCount)
    } else {
      const indices = examen.preguntas.map((_, i) => i)
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[indices[i], indices[j]] = [indices[j], indices[i]]
      }
      setOrder(indices)
      localStorage.setItem(
        storageKey,
        JSON.stringify({ order: indices, pointer: 0, correctCount: 0, incorrectCount: 0 })
      )
    }
  }, [examen.preguntas, storageKey])

  // 2) Persistir en localStorage al cambiar progreso
  useEffect(() => {
    if (!order) return
    localStorage.setItem(
      storageKey,
      JSON.stringify({ order, pointer, correctCount, incorrectCount })
    )
  }, [order, pointer, correctCount, incorrectCount, storageKey])

  // 3) Reset de temporizador al cambiar de pregunta
  useEffect(() => {
    setTimeLeft(questionTime)
    setAnswered(false)
    setFeedback(null)
  }, [pointer])

  // 4) Cuenta atrás y timeout
  useEffect(() => {
    if (!order || answered) return

    if (timeLeft <= 0) {
      // tiempo agotado → tratar como incorrecto y avanzar
      setFeedback('Tiempo agotado')
      setIncorrect(i => i + 1)
      setAnswered(true)
      setTimeout(() => {
        setPointer(p => p + 1)
      }, 1500)
      return
    }

    const timerId = setTimeout(() => {
      setTimeLeft(t => t - 1)
    }, 1000)

    return () => clearTimeout(timerId)
  }, [timeLeft, answered, order])

  if (!order) {
    return <div>Cargando examen…</div>
  }

  const total    = order.length
  const answeredCount = correctCount + incorrectCount
  const progressPct   = Math.round((answeredCount / total) * 100)

  // Pregunta actual
  const currentIndex   = order[pointer]
  const preguntaActual = examen.preguntas[currentIndex]
  const opcionesArray: Opcion[] = Object.entries(preguntaActual.opciones).map(
    ([clave, texto]) => ({
      clave,
      texto,
      correcta: clave === preguntaActual.respuesta_correcta
    })
  )

  // Al responder manual
  function handleAnswer(isCorrect: boolean) {
    if (answered) return
    setAnswered(true)
    if (isCorrect) {
      setFeedback('¡Correcto!')
      setCorrect(c => c + 1)
    } else {
      setFeedback('Incorrecto')
      setIncorrect(i => i + 1)
    }
    // avanza tras mostrar feedback
    setTimeout(() => {
      setPointer(p => p + 1)
    }, 800)
  }

  // Fin del examen
  if (pointer >= total) {
    return (
      <div className="text-center">
        <h2 className="text-2xl mb-4">Examen completado</h2>
        <p>✅ Correctas: {correctCount} / {total}</p>
        <p>❌ Incorrectas: {incorrectCount} / {total}</p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto">

      {/* Barra de progreso examen */}
      <div className="w-full bg-gray-200 h-2 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <p className="text-right text-sm text-gray-600 mb-4">{progressPct}% completado</p>

      {/* Temporizador */}
      <div className="mb-4 text-right text-lg font-mono">
        ⏱ {timeLeft}s
      </div>

      {/* Contadores */}
      <div className="flex justify-between mb-4 text-lg">
        <span>✅ {correctCount}</span>
        <span>❌ {incorrectCount}</span>
      </div>

      {/* Título e ID */}
      <h3 className="text-2xl font-semibold mb-1">{examen.nombre}</h3>
      <p className="text-sm text-gray-600 mb-4">
        Pregunta #{preguntaActual.id} — {pointer + 1} / {total}
      </p>

      {/* Enunciado */}
      <h4 className="mb-4">{preguntaActual.pregunta}</h4>

      {/* Opciones */}
      {opcionesArray.map((opt, i) => (
        <button
          key={i}
          onClick={() => handleAnswer(opt.correcta)}
          disabled={answered}
          className={`
            block w-full mb-2 px-4 py-2 border rounded 
            ${answered
              ? opt.correcta
                ? 'bg-green-100 border-green-400'
                : 'bg-red-100 border-red-400'
              : 'bg-white hover:bg-gray-50'}
          `}
        >
          {opt.texto}
        </button>
      ))}

      {/* Feedback */}
      {feedback && (
        <div className={`mt-4 p-3 rounded ${
          feedback === '¡Correcto!' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {feedback}
        </div>
      )}

      {/* Navegación manual */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setPointer(p => Math.max(0, p - 1))}
          disabled={pointer === 0}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <button
          onClick={() => setPointer(p => Math.min(total, p + 1))}
          disabled={pointer >= total - 1}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}


