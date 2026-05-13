const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

const COLORS = {
  compute:    { bar: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
  storage:    { bar: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  networking: { bar: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  unknown:    { bar: '#6b7280', bg: 'rgba(107,114,128,0.15)' },
}

const TYPE_ICONS = {
  EC2: '🖥️', ECS: '📦', Lambda: '⚡', EKS: '☸️',
  S3: '🪣', RDS: '🗃️', EBS: '💾', ElastiCache: '⚡', DynamoDB: '📊',
  VPC: '🔒', ALB: '⚖️', NATGateway: '🔀', CloudFront: '🌐', Route53: '🔍',
}

export default function CostBreakdown({ breakdown }) {
  if (!breakdown) return null

  const categories = breakdown.categories.filter(c => c.resource_count > 0)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {/* Category bar chart */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 24,
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 20, color: 'var(--text)' }}>
          Cost by Category
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {categories.map(cat => {
            const col = COLORS[cat.category] || COLORS.unknown
            return (
              <div key={cat.category}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{cat.category}</span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {fmt(cat.total_cost)} · {cat.percentage}%
                  </span>
                </div>
                <div style={{ height: 8, background: col.bg, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${cat.percentage}%`,
                    background: col.bar,
                    borderRadius: 4,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  {cat.resource_count} resources · avg {fmt(cat.average_cost)}/resource
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top 5 costly resources */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 24,
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 20, color: 'var(--text)' }}>
          Top Costly Resources
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {breakdown.top_costly_resources.map((r, i) => {
            const col = COLORS[r.category] || COLORS.unknown
            return (
              <div key={r.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                background: col.bg,
                borderRadius: 8,
                border: `1px solid ${col.bar}22`,
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: col.bar,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {TYPE_ICONS[r.type] || '🔧'} {r.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.type} · {r.category}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: col.bar, flexShrink: 0 }}>
                  {fmt(r.monthly_cost)}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
