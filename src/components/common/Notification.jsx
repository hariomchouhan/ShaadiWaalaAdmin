import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function Notification({ notification }) {
  if (!notification) return null;

  const styles = {
    error: { bg: 'bg-red-600', icon: AlertCircle },
    info: { bg: 'bg-brand-brown', icon: Info },
    success: { bg: 'bg-brand-gold', icon: CheckCircle },
  };
  const { bg, icon: Icon } = styles[notification.type] || styles.success;

  return (
    <div className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white ${bg} border border-white/10 animate-[slideDown_0.3s_ease-out]`}>
      <Icon className="w-5 h-5 shrink-0" />
      <p className="text-sm font-medium flex-1">{notification.message}</p>
    </div>
  );
}
