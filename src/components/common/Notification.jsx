export default function Notification({ notification }) {
  if (!notification) return null;

  const bgClass = notification.type === 'error'
    ? 'bg-red-500'
    : notification.type === 'info'
      ? 'bg-blue-500'
      : 'bg-emerald-600';

  return (
    <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white ${bgClass}`}>
      {notification.message}
    </div>
  );
}
