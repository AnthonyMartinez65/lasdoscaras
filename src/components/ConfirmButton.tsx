import { useState, useEffect, type ReactNode } from 'react';

interface ConfirmButtonProps {
  onConfirm: () => void;
  children: ReactNode;
  confirmLabel?: string;
  className?: string;
  disabled?: boolean;
}

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