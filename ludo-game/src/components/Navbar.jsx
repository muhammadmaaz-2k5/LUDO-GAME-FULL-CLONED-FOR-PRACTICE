import { MobileSidebar } from './mobile-sidebar';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const user = null; // Dummy for ludo-game

  return (
    <div className="fixed left-0 right-0 top-0 z-20 bg-bgAuxiliary/90 backdrop-blur-md md:hidden text-white border-b border-white/10 shadow-sm">
      <nav className="flex h-16 items-center justify-between px-4">
        <div>
          <MobileSidebar />
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center font-bold text-xs text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-textSecondary">{user.name}</span>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="bg-green-600 text-white border-none hover:bg-green-500 font-semibold"
              onClick={() => {
                navigate('/'); // Or to a login page if one existed
              }}
            >
              Login
            </Button>
          )}
        </div>
      </nav>
    </div>
  );
}
