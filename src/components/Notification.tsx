import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';

const BG: Record<string, string> = {
  error: 'bg-red-500',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
};

export default function Notification() {
  const { notification } = useContext(NotificationContext);

  if (!notification) return null;

  return (
    <div
      role={notification.type === 'error' || notification.type === 'warning' ? 'alert' : 'status'}
      aria-live={notification.type === 'error' ? 'assertive' : 'polite'}
      className={`fixed top-4 right-4 text-white px-6 py-3 rounded-xl shadow-lg z-[100] font-medium animate-[slideIn_0.3s_ease] ${BG[notification.type]}`}
    >
      {notification.msg}
    </div>
  );
}