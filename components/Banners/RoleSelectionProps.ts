export interface RoleSelectionProps {
  hoveredIcon: number | null;
  setHoveredIcon: (index: number | null) => void;
  handleIconClick: () => void;
  isDarkMode: boolean;
}