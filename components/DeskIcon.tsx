type DeskIconProps = {
  className?: string;
  size?: number;
};

export default function DeskIcon({
  className = "",
  size = 20,
}: DeskIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="4" y="7" width="16" height="4" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <path d="M7 11V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M17 11V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 16H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}