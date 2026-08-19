import { useAuthStore } from '../store/useAuthStore';
import { SideNav } from './side-nav';
import { UpperNavItems, LowerNavItems } from './constants/side-nav';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function Sidebar({ className }) {
  const { user } = useAuthStore();

  return (
    <nav
      className={cn(
        'hidden md:flex flex-col justify-between h-screen py-5 bg-bgAuxiliary text-textMain w-52 shrink-0 border-r border-white/5 sticky top-0 z-30 shadow-xl',
        className,
      )}
    >
      <div className="flex flex-col gap-6">
        <Link to="/" className="flex items-center gap-2.5 px-5">
          <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1">
            Pak <span className="text-green-500">Ludo</span>
          </span>
        </Link>

        {user && (
          <div className="mx-3 p-3 bg-bgDark rounded-xl border border-white/5 flex items-center gap-3 shadow">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center font-bold text-white shadow">
              {user.name?.charAt(0).toUpperCase() || 'P'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[11px] text-green-400 font-semibold">
                Rating: {user.rating || 1200}
              </p>
            </div>
          </div>
        )}

        <SideNav items={UpperNavItems} />
      </div>

      <div className="flex flex-col gap-4">
        <SideNav items={LowerNavItems} />
        <div className="px-5 text-[11px] text-stone-500">
          © 2026 Pak Ludo
        </div>
      </div>
    </nav>
  );
}
