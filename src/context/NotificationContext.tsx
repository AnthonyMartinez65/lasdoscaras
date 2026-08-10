import { createContext, useState, ReactNode } from 'react';

type NotificationType = 'success' | 'error' | 'info';

interface NotificationState {
  msg: string;
  type: NotificationType;
}

export const NotificationContext = createContext<any>(null);

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
