interface Props {
  title: string
  subtitle?: string
  breadcrumbs?: { label: string; href?: string }[]
}

export default function PageHero({ title, subtitle, breadcrumbs }: Props) {
  return (
    <section className="relative flex min-h-[40vh] items-end bg-bg pb-16 pt-32">
      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(229,62,62,0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(229,62,62,0.04) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Accent glow */}
      <div className="pointer-events-none absolute right-0 top-1/3 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

      <div className="container relative z-10">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="mb-4 flex items-center gap-2 text-xs text-[#888888]">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span>/</span>}
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-white transition-colors">
                    {crumb.label}
                  </a>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Label */}
        <p className="section-label mb-3">Innovation Music</p>

        {/* Title */}
        <h1 className="font-display text-5xl font-bold leading-tight text-white lg:text-7xl">
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="mt-4 max-w-xl text-lg text-[#888888]">{subtitle}</p>
        )}

        {/* Accent line */}
        <div className="mt-8 h-1 w-16 rounded-full bg-accent" />
      </div>
    </section>
  )
}
