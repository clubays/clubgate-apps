export default function Avatar({ src, name = '', size = 56 }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2)
    .map((p) => p[0].toUpperCase()).join('');
  const style = { width: size, height: size, fontSize: size * 0.36 };
  return src ? (
    <img className="avatar" src={src} alt={name} style={style} />
  ) : (
    <span className="avatar avatar-fallback" style={style} aria-label={name}>
      {initials || '?'}
    </span>
  );
}
