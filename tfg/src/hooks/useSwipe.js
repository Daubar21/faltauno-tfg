// Hook que controla el índice de la tarjeta activa en el mazo de swipe.
// advance() pasa a la siguiente tarjeta; reset() vuelve al principio.
import { useState } from 'react'

export function useSwipe() {
  const [index, setIndex] = useState(0)

  const advance = () => setIndex((prev) => prev + 1)
  const reset = () => setIndex(0)

  return { index, advance, reset }
}
