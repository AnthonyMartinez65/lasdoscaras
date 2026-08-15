import { createContext, useContext, useState, type ReactNode } from 'react';

type NotificationType = 'success' | 'error' | 'info';

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

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const showNotification = (msg: string, type: NotificationType = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <NotificationContext.Provider value={{ showNotification, notification }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook de conveniencia para no repetir "useContext(NotificationContext)" en
// cada componente que necesite mostrar una notificación.
export const useNotification = () => useContext(NotificationContext);