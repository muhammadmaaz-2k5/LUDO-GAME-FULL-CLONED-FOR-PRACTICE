import { LUDO_THEMES } from '../constants/themes';
import { useThemeContext } from '../context/themeContext';
import { Check, Sparkles } from 'lucide-react';
import { useNotificationStore } from '../store/useNotificationStore';

export function Themes() {
  const { theme: currentTheme, setTheme } = useThemeContext();

  const handleSelectTheme = (selectedTheme) => {
    setTheme(selectedTheme);
    useNotificationStore.getState().addToast({
      type: 'success',
      message: `Board Theme changed to "${selectedTheme.name}"!`,
    });
  };

  return (
    <div className="flex-1 py-2 max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Sparkles size={20} className="text-yellow-400" /> Ludo Board Themes
        </h2>
        <p className="text-xs text-textSecondary mt-1">
          Select your favorite battlefield background texture. The active theme is applied instantly to all online & offline matches.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {LUDO_THEMES.map((themeItem) => {
          const isSelected =
            currentTheme.id === themeItem.id ||
            currentTheme.name.toLowerCase() === themeItem.name.toLowerCase();

          return (
            <div
              key={themeItem.id || themeItem.name}
              onClick={() => handleSelectTheme(themeItem)}
              className={`group relative rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
                isSelected
                  ? 'border-green-500 ring-2 ring-green-500/50 bg-bgDark shadow-xl shadow-green-500/10'
                  : 'border-white/10 bg-bgDark/70 hover:border-white/25 hover:shadow-lg'
              }`}
            >
              {/* Board Background Image Preview */}
              <div className="relative w-full h-36 overflow-hidden bg-stone-950">
                <img
                  src={themeItem.image}
                  alt={themeItem.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Selected Status Badge */}
                {isSelected && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 text-[11px] font-extrabold bg-green-500 text-stone-950 px-2.5 py-1 rounded-full shadow-lg">
                    <Check size={13} strokeWidth={3} /> Active
                  </div>
                )}

                {/* Color Palette Indicators */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1 p-1 bg-black/60 backdrop-blur rounded-lg border border-white/10">
                  <span
                    className="w-3.5 h-3.5 rounded-full shadow"
                    style={{ backgroundColor: themeItem.colors.red }}
                    title="Red Base"
                  />
                  <span
                    className="w-3.5 h-3.5 rounded-full shadow"
                    style={{ backgroundColor: themeItem.colors.green }}
                    title="Green Base"
                  />
                  <span
                    className="w-3.5 h-3.5 rounded-full shadow"
                    style={{ backgroundColor: themeItem.colors.yellow }}
                    title="Yellow Base"
                  />
                  <span
                    className="w-3.5 h-3.5 rounded-full shadow"
                    style={{ backgroundColor: themeItem.colors.blue }}
                    title="Blue Base"
                  />
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    {themeItem.name}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectTheme(themeItem);
                    }}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                      isSelected
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white border border-white/10'
                    }`}
                  >
                    {isSelected ? 'Activated' : 'Activate'}
                  </button>
                </div>
                <p className="text-xs text-textSecondary line-clamp-2">
                  {themeItem.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
