// src/admin/components/CustomMenuItem.tsx
import Link from 'next/link' // Assuming you're using Next.js Link for navigation
import Image from 'next/image'

const DashboardNavLink = () => {
  return (
    <div style={{ minWidth: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Link href="/admin">
          <Image
            src="/assets/yummy-logo.png" // **Change this to the actual path of your logo**
            alt="yummy-logo"
            width={90}
            height={90}
            style={{ paddingBottom: '20px' }}
          />
        </Link>
      </div>
      <Link className="nav__link" id="nav-users" href="/admin">
        <span className="nav__link-label">🚀 Dashboard</span>
      </Link>
    </div>
  )
}

export default DashboardNavLink
