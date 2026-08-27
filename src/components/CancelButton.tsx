import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface CancelButtonProps {
  isDirty: boolean;
  to: string;
  className?: string;
}

// Si el formulario no tiene cambios sin guardar, "Cancelar" navega de
// una vez. Si sí los tiene, el primer clic pide confirmación (mismo
// patrón de dos clics que ConfirmButton) antes de descartarlos.
export default function CancelButton({ isDirty, to, className = '' }: CancelButtonProps) {
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!confirming) return;
    const timeout = setTimeout(() => setConfirming(false), 3000);
    return () => clearTimeout(timeout);
  }, [confirming]);

  const handleClick = () => {
    if (!isDirty) {
      navigate(to);
      return;
    }
    if (confirming) {
      navigate(to);
    } else {
      setConfirming(true);
    }
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      {confirming ? '¿Descartar cambios?' : 'Cancelar'}
    </button>
  );
}