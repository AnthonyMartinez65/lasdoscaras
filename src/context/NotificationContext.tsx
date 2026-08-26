import { createContext, useContext, useState, type ReactNode } from 'react';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationState {
  msg: string;
  type: NotificationType;
}

interface NotificationContextType {
  notification: NotificationState | null;
  showNotification: (msg: string, type?: NotificationType) => void;
}

export const NotificationContext = createContext<NotificationContextType>({
  notification: null,
  showNotification: () => {},
});

// Duraciones diferenciadas segun el enunciado:
// errores/warnings: 4s (el usuario necesita leerlos)
// exito/info: 2.5s
const DURATIONS: Record<NotificationType, number> = {
  error: 4000,
  warning: 4000,
  success: 2500,
  info: 2500,
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const showNotification = (msg: string, type: NotificationType = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), DURATIONS[type]);
  };

  return (
    <NotificationContext.Provider value={{ showNotification, notification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);