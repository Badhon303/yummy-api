import React from 'react'
import { getPayload } from 'payload'
import config from '../payload.config'

async function StockAlerts() {
  let alerts: any[] = []

  try {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'branch-products',
      limit: 100,
      depth: 1,
      overrideAccess: true,
    })
    alerts = (docs as any[]).filter((doc) => doc.stockQuantity <= doc.lowStockThreshold)
  } catch {
    alerts = []
  }

  if (!alerts.length) {
    return (
      <div
        style={{
          padding: '1.5rem',
          color: 'var(--theme-success-700)',
          fontFamily: 'var(--font-body)',
        }}
      >
        All stock levels are healthy.
      </div>
    )
  }

  return (
    <div style={{ padding: '1.5rem', fontFamily: 'var(--font-body)' }}>
      <h3
        style={{
          fontSize: '1.1rem',
          fontWeight: 600,
          margin: '0 0 0.75rem 0',
          color: 'var(--theme-error-500)',
        }}
      >
        Low Stock Alerts ({alerts.length})
      </h3>
      <div
        style={{
          borderRadius: 'var(--style-radius-l)',
          border: '1px solid var(--theme-elevation-150)',
          overflow: 'hidden',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.875rem',
          }}
        >
          <thead>
            <tr
              style={{
                background: 'var(--theme-elevation-50)',
                textAlign: 'left',
              }}
            >
              <th
                style={{
                  padding: '0.75rem 1rem',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--theme-elevation-400)',
                  fontWeight: 600,
                }}
              >
                Product
              </th>
              <th
                style={{
                  padding: '0.75rem 1rem',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--theme-elevation-400)',
                  fontWeight: 600,
                }}
              >
                Branch
              </th>
              <th
                style={{
                  padding: '0.75rem 1rem',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--theme-elevation-400)',
                  fontWeight: 600,
                }}
              >
                Stock
              </th>
              <th
                style={{
                  padding: '0.75rem 1rem',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--theme-elevation-400)',
                  fontWeight: 600,
                }}
              >
                Threshold
              </th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert) => (
              <tr
                key={alert.id}
                style={{
                  borderTop: '1px solid var(--theme-elevation-150)',
                }}
              >
                <td style={{ padding: '0.75rem 1rem', color: 'var(--theme-elevation-800)' }}>
                  {typeof alert.product === 'object' ? alert.product?.name : alert.product}
                </td>
                <td style={{ padding: '0.75rem 1rem', color: 'var(--theme-elevation-600)' }}>
                  {typeof alert.branch === 'object' ? alert.branch?.name : alert.branch}
                </td>
                <td
                  style={{
                    padding: '0.75rem 1rem',
                    color: 'var(--theme-error-500)',
                    fontWeight: 700,
                  }}
                >
                  {alert.stockQuantity}
                </td>
                <td style={{ padding: '0.75rem 1rem', color: 'var(--theme-elevation-400)' }}>
                  {alert.lowStockThreshold}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default StockAlerts
