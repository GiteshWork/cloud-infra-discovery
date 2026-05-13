import { useState } from 'react'

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

const CATEGORY_STYLE = {
  compute:    { color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
  storage:    { color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  networking: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  unknown:    { color: '#6b7280', bg: 'rgba(107,114,128,0.15)' },
}

const STATUS_STYLE = {
  running:   { color: '#10b981', dot: '#10b981' },
  available: { color: '#10b981', dot: '#10b981' },
  stopped:   { color: '#ef4444', dot: '#ef4444' },
  pending:   { color: '#f59e0b', dot: '#f59e0b' },
  unknown:   { color: '#6b7280', dot: '#6b7280' },
}

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'compute', label: '⚡ Compute' },
  { key: 'storage', label: '🗄️ Storage' },
  { key: 'networking', label: '🌐 Networking' },
]

function Badge({ text, style }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'capitalize',
      ...style,
    }}>
      {text}
    </span>
  )
}

function StatusDot({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.unknown
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: s.color }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%', background: s.dot,
        boxShadow: status === 'running' || status === 'available' ? `0 0 0 3px ${s.dot}33` : 'none',
        display: 'inline-block',
      }} />
      {status}
    </span>
  )
}

export default function ResourceTable({ resources }) {
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('monthly_cost')
  const [sortDir, setSortDir] = useState('desc')

  const filtered = resources
    .filter(r => activeTab === 'all' || r.category === activeTab)
    .filter(r => {
      const q = search.toLowerCase()
      return !q || r.name.toLowerCase().includes(q) || r.type.toLowerCase().includes(q) || r.region.toLowerCase().includes(q)
    })
    .sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1
      if (sortKey === 'monthly_cost') return (a.monthly_cost - b.monthly_cost) * mul
      if (sortKey === 'name') return a.name.localeCompare(b.name) * mul
      return 0
    })

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const SortArrow = ({ k }) => sortKey === k
    ? <span style={{ marginLeft: 4, opacity: 0.8 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
    : <span style={{ marginLeft: 4, opacity: 0.3 }}>↕</span>

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
    }}>
      {/* Header + controls */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600 }}>
            All Resources
            <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>
              ({filtered.length} shown)
            </span>
          </h3>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, type, region…"
            style={{
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              color: 'var(--text)', padding: '6px 12px', borderRadius: 6,
              fontSize: 13, width: 240, outline: 'none',
            }}
          />
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 4 }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '5px 14px',
                borderRadius: 6,
                border: 'none',
                fontSize: 12,
                fontWeight: 500,
                background: activeTab === tab.key ? 'var(--accent)' : 'var(--surface-2)',
                color: activeTab === tab.key ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)' }}>
              {[
                { key: 'name', label: 'Name' },
                { key: 'type', label: 'Type' },
                { key: 'category', label: 'Category' },
                { key: 'region', label: 'Region' },
                { key: 'status', label: 'Status' },
                { key: 'monthly_cost', label: 'Monthly Cost' },
              ].map(col => (
                <th
                  key={col.key}
                  onClick={() => (col.key === 'name' || col.key === 'monthly_cost') && handleSort(col.key)}
                  style={{
                    padding: '10px 16px',
                    textAlign: 'left',
                    color: 'var(--text-muted)',
                    fontWeight: 500,
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    cursor: (col.key === 'name' || col.key === 'monthly_cost') ? 'pointer' : 'default',
                    userSelect: 'none',
                  }}
                >
                  {col.label}
                  {(col.key === 'name' || col.key === 'monthly_cost') && <SortArrow k={col.key} />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => {
              const cs = CATEGORY_STYLE[r.category] || CATEGORY_STYLE.unknown
              return (
                <tr
                  key={r.id}
                  style={{
                    borderTop: '1px solid var(--border)',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                  }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 500, color: 'var(--text)' }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>
                      {r.id.length > 24 ? r.id.slice(0, 24) + '…' : r.id}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--text-muted)' }}>{r.type}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <Badge text={r.category} style={{ color: cs.color, background: cs.bg }} />
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
                    {r.region}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <StatusDot status={r.status} />
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text)', textAlign: 'right' }}>
                    {r.monthly_cost === 0 ? (
                      <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Free</span>
                    ) : fmt(r.monthly_cost)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            No resources match your filters.
          </div>
        )}
      </div>
    </div>
  )
}
