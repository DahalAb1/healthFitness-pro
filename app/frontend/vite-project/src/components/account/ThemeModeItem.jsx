import SegmentedMenuItem from './SegmentedMenuItem';
import { useTheme } from '../../context/useTheme';

const THEME_OPTIONS = ['Dark', 'Light'];

export default function ThemeModeItem() {
  const { theme, setTheme } = useTheme();

  return (
    <SegmentedMenuItem
      label="Theme"
      options={THEME_OPTIONS}
      value={theme === 'light' ? 'Light' : 'Dark'}
      onChange={(next) => setTheme(next.toLowerCase())}
      icon={
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </>
      }
    />
  );
}
