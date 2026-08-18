import { useState, useEffect } from 'react';

// Hook genérico: devuelve `value`, pero retrasado `delayMs` milisegundos
// desde el último cambio — para no disparar una búsqueda en cada tecla.
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}