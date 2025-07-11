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

  // Estados principales
  const [order, setOrder]             = useState<number[] | null>(null)
  const [pointer, setPointer]         = useState(0)
  const [correctCount, setCorrect]    = useState(0)
  const [incorrectCount, setIncorrect]= useState(0)
  const [answered, setAnswered]       = useState(false)
  const [feedback, setFeedback]       = useState<string | null>(null)

  // 1) Al montar, leer LocalStorage o inicializar
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
      // Generar orden aleatorio (Fisher–Yates)
      const indices = examen.preguntas.map((_, i) => i)
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[indices[i], indices[j]] = [indices[j], indices[i]]
      }
      setOrder(indices)
      // Guardar estado inicial
      localStorage.setItem(
        storageKey,
        JSON.stringify({ order: indices, pointer: 0, correctCount: 0, incorrectCount: 0 })
      )
    }
  }, [examen.preguntas, storageKey])

  // 2) Cada vez que cambie el progreso, actualizar LocalStorage
  useEffect(() => {
    if (!order) return
    localStorage.setItem(
      storageKey,
      JSON.stringify({ order, pointer, correctCount, incorrectCount })
    )
  }, [order, pointer, correctCount, incorrectCount, storageKey])

  // Mientras cargamos el order, mostramos un loading
  if (!order) {
    return <div>Cargando examen…</div>
  }

  // Determinar pregunta actual
  const currentIndex   = order[pointer]
  const preguntaActual = examen.preguntas[currentIndex]

  // Convertir opciones objeto→array
  const opcionesArray: Opcion[] = Object.entries(preguntaActual.opciones).map(
    ([clave, texto]) => ({
      clave,
      texto,
      correcta: clave === preguntaActual.respuesta_correcta
    })
  )

  // Responder pregunta
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
  }

  // Navegación
  function goNext() {
    if (pointer < order.length - 1) {
      setPointer(p => p + 1)
      resetAnswerState()
    }
  }
  function goPrev() {
    if (pointer > 0) {
      setPointer(p => p - 1)
      resetAnswerState()
    }
  }
  function resetAnswerState() {
    setAnswered(false)
    setFeedback(null)
  }

  // Si acabas todas las preguntas…
  if (pointer >= order.length) {
    return (
      <div>
        <h2 className="text-2xl">Examen completado</h2>
        <p>✅ Correctas: {correctCount} / {order.length}</p>
        <p>❌ Incorrectas: {incorrectCount} / {order.length}</p>
      </div>
    )
  }

  // Render del quiz
  return (
    <div className="max-w-xl mx-auto">
      {/* Contadores */}
      <div className="flex justify-between mb-4 text-lg">
        <span>✅ {correctCount}</span>
        <span>❌ {incorrectCount}</span>
      </div>

      {/* Título e ID */}
      <h3 className="text-2xl font-semibold mb-1">{examen.nombre}</h3>
      <p className="text-sm text-gray-600 mb-4">
        Pregunta #{preguntaActual.id} — {pointer + 1} / {order.length}
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

      {/* Botones de navegación */}
      <div className="flex justify-between mt-6">
        <button
          onClick={goPrev}
          disabled={pointer === 0}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <button
          onClick={goNext}
          disabled={pointer >= order.length - 1}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}
