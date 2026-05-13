const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

const CATEGORY_META = {
  compute:    { label: 'Compute',    color: '#6366f1', icon: '⚡' },
  storage:    { label: 'Storage',    color: '#10b981', icon: '🗄️' },
  networking: { label: 'Networking', color: '#f59e0b', icon: '🌐' },
}

const cardStyle = (accent) => ({
  background: 'var(--surface)',
  border: `1px solid var(--border)`,
  borderRadius: 'var(--radius)',
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  borderLeft: `3px solid ${accent}`,
  transition: 'transform 0.15s',
})

export default function SummaryCards({ summary }) {
  if (!summary) return null

  const totalCard = {
    label: 'Total Infrastructure Cost',
    value: fmt(summary.total_monthly_cost),
    sub: `${summary.total_resources} resources across all categories`,
    icon: '☁️',
    accent: '#6366f1',
  }

  const catCards = Object.entries(CATEGORY_META)
    .filter(([key]) => summary.categories[key])
    .map(([key, meta]) => ({
      label: meta.label,
      value: fmt(summary.categories[key].monthly_cost),
      sub: `${summary.categories[key].resource_count} resources`,
      icon: meta.icon,
      accent: meta.color,
    }))

  const cards = [totalCard, ...catCards]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: 16,
      marginBottom: 32,
    }}>
      {cards.map((c, i) => (
        <div key={i} style={cardStyle(c.accent)}>
          <div style={{ fontSize: 22 }}>{c.icon}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {c.label}
          </div>
          <div style={{ fontSize: i === 0 ? 30 : 24, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>
            {c.value}
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>/mo</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.sub}</div>
        </div>
      ))}
    </div>
  )
}
