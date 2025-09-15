
interface TeacherIconProps {
  className?: string;
}

export const TeacherIcon = ({ className = "w-4 h-4" }: TeacherIconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="7" r="4" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#059669" fillOpacity="0.3"/>
  </svg>
);
