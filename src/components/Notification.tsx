import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';

export default function Notification() {
  const { notification } = useContext(NotificationContext);
  
  if (!notification) return null;

  const bgColor = notification.type === 'error' ? 'bg-red-500' : notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500';

  return (
    <div role="alert" className={`fixed top-4 right-4 text-white px-6 py-3 rounded shadow-lg z-50 ${bgColor}`}>
      {notification.msg}
    </div>
  );
}