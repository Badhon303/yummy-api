import { getPayload } from 'payload'
import config from '../payload.config'

async function DashboardWidget() {
  let stats: {
    totalOrders: number
    pendingOrders: number
    totalRevenue: number
    lowStockCount: number
    recentOrders: any[]
  } | null = null

  try {
    const payload = await getPayload({ config })

    const [ordersData, stockData] = await Promise.all([
      payload.find({
        collection: 'orders',
        limit: 5,
        sort: '-createdAt',
        depth: 1,
        overrideAccess: true,
      }),
      payload.find({
        collection: 'branch-products',
        limit: 100,
        overrideAccess: true,
      }),
    ])

    const lowStock = (stockData.docs as any[]).filter(
      (doc) => doc.stockQuantity <= doc.lowStockThreshold,
    )

    const totalRevenue = (ordersData.docs as any[]).reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0,
    )

    stats = {
      totalOrders: ordersData.totalDocs || 0,
      pendingOrders: (ordersData.docs as any[]).filter(
        (o) => o.orderStatus === 'pending' || o.orderStatus === 'confirmed',
      ).length,
      totalRevenue,
      lowStockCount: lowStock.length,
      recentOrders: ordersData.docs as any[],
    }
  } catch {
    stats = null
  }

  if (!stats) {
    return (
      <div
        style={{
          padding: '1.5rem',
          color: 'var(--theme-elevation-400)',
          fontFamily: 'var(--font-body)',
        }}
      >
        Unable to load dashboard data.
      </div>
    )
  }

  return (
    <div
      style={{
        padding: '1.5rem',
        fontFamily: 'var(--font-body)',
      }}
    >
      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          margin: '0 0 1.25rem 0',
          color: 'var(--theme-elevation-800)',
        }}
      >
        Store Overview
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <StatCard label="Total Orders" value={stats.totalOrders.toString()} />
        <StatCard label="Active Orders" value={stats.pendingOrders.toString()} />
        <StatCard label="Revenue (Recent)" value={`৳${stats.totalRevenue.toLocaleString()}`} />
        <StatCard
          label="Low Stock Items"
          value={stats.lowStockCount.toString()}
          alert={stats.lowStockCount > 0}
        />
      </div>

      <h3
        style={{
          fontSize: '1.1rem',
          fontWeight: 600,
          margin: '0 0 0.75rem 0',
          color: 'var(--theme-elevation-800)',
        }}
      >
        Recent Orders
      </h3>
      {stats.recentOrders.length === 0 ? (
        <p style={{ color: 'var(--theme-elevation-400)', margin: 0 }}>No recent orders.</p>
      ) : (
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
                <Th>Order #</Th>
                <Th>Status</Th>
                <Th>Payment</Th>
                <Th>Total</Th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order) => (
                <tr
                  key={order.id}
                  style={{
                    borderTop: '1px solid var(--theme-elevation-150)',
                  }}
                >
                  <Td>
                    <strong style={{ color: 'var(--theme-elevation-800)' }}>
                      {order.orderNumber}
                    </strong>
                  </Td>
                  <Td>
                    <StatusBadge status={order.orderStatus} />
                  </Td>
                  <Td>
                    <PaymentBadge status={order.paymentStatus} />
                  </Td>
                  <Td>
                    <span style={{ color: 'var(--theme-elevation-800)', fontWeight: 600 }}>
                      ৳{order.totalAmount}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div
      style={{
        padding: '1.25rem',
        borderRadius: 'var(--style-radius-l)',
        background: alert ? 'var(--theme-error-50)' : 'var(--theme-elevation-50)',
        border: `1px solid ${alert ? 'var(--theme-error-200)' : 'var(--theme-elevation-150)'}`,
      }}
    >
      <div
        style={{
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--theme-elevation-400)',
          marginBottom: '0.5rem',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: alert ? 'var(--theme-error-500)' : 'var(--theme-elevation-800)',
        }}
      >
        {value}
      </div>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
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
      {children}
    </th>
  )
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td
      style={{
        padding: '0.75rem 1rem',
        color: 'var(--theme-elevation-600)',
      }}
    >
      {children}
    </td>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'var(--theme-warning-100)',
    confirmed: 'var(--theme-warning-100)',
    preparing: 'var(--theme-warning-100)',
    ready: 'var(--theme-success-100)',
    delivered: 'var(--theme-success-100)',
    cancelled: 'var(--theme-error-100)',
  }

  const textColors: Record<string, string> = {
    pending: 'var(--theme-warning-700)',
    confirmed: 'var(--theme-warning-700)',
    preparing: 'var(--theme-warning-700)',
    ready: 'var(--theme-success-700)',
    delivered: 'var(--theme-success-700)',
    cancelled: 'var(--theme-error-700)',
  }

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.2rem 0.6rem',
        borderRadius: 'var(--style-radius-m)',
        fontSize: '0.75rem',
        fontWeight: 600,
        background: colors[status] || 'var(--theme-elevation-100)',
        color: textColors[status] || 'var(--theme-elevation-600)',
      }}
    >
      {status}
    </span>
  )
}

function PaymentBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    paid: 'var(--theme-success-100)',
    completed: 'var(--theme-success-100)',
    pending: 'var(--theme-warning-100)',
    failed: 'var(--theme-error-100)',
    refunded: 'var(--theme-error-100)',
  }

  const textColors: Record<string, string> = {
    paid: 'var(--theme-success-700)',
    completed: 'var(--theme-success-700)',
    pending: 'var(--theme-warning-700)',
    failed: 'var(--theme-error-700)',
    refunded: 'var(--theme-error-700)',
  }

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.2rem 0.6rem',
        borderRadius: 'var(--style-radius-m)',
        fontSize: '0.75rem',
        fontWeight: 600,
        background: colors[status] || 'var(--theme-elevation-100)',
        color: textColors[status] || 'var(--theme-elevation-600)',
      }}
    >
      {status}
    </span>
  )
}

export default DashboardWidget
