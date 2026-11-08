import React from 'react';

export default function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'ghost' | 'accent'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ariaLabel,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-[10px] transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none';

  const sizeClasses = {
    sm: 'h-9 px-3 text-xs gap-1.5',
    md: 'h-11 px-4 text-sm gap-2',
    lg: 'h-13 px-6 text-base gap-2.5',
  };

  const variants = {
    primary: 'bg-[#c6ff3d] hover:brightness-110 active:scale-[0.98] text-[#0b0f14] font-bold border border-[#c6ff3d]',
    secondary: 'bg-[#182231] hover:bg-[#212d40] text-[#e8eef5] border border-[#243146] hover:border-[#8a9ab0]',
    danger: 'bg-[#e5473f] hover:brightness-110 text-white font-bold',
    ghost: 'bg-transparent hover:bg-[#182231] text-[#8a9ab0] hover:text-[#e8eef5]',
    accent: 'bg-[#2fd27e] hover:brightness-110 text-[#0b0f14] font-bold',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`${base} ${sizeClasses[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {children}
    </button>
  );
}
