import { useState, useEffect, type ReactNode } from 'react';

interface ConfirmButtonProps {
  onConfirm: () => void;
  children: ReactNode;
  confirmLabel?: string;
  className?: string;
  disabled?: boolean;
}

// Reemplaza a window.confirm(), que no está permitido — un primer clic
// arma la pregunta en el propio botón, y hay 3 segundos para confirmar
// con un segundo clic antes de que vuelva a su estado normal.
export default function ConfirmButton({
  onConfirm,
  children,
  confirmLabel = '¿Seguro?',
  className = '',
  disabled,
}: ConfirmButtonProps) {
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!confirming) return;
    const timeout = setTimeout(() => setConfirming(false), 3000);
    return () => clearTimeout(timeout);
  }, [confirming]);

  const handleClick = () => {
    if (confirming) {
      setConfirming(false);
      onConfirm();
    } else {
      setConfirming(true);
    }
  };

  return (
    <button type="button" onClick={handleClick} disabled={disabled} className={className}>
      {confirming ? confirmLabel : children}
    </button>
  );
}