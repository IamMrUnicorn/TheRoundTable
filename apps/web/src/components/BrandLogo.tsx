export function BrandLogo({ className = '' }: { className?: string }) {
  return (
    <img
      className={`brand-logo ${className}`.trim()}
      src="/brand/owl-logo-512.png"
      alt=""
      aria-hidden="true"
    />
  )
}
