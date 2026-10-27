'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Building2, CalendarCheck, ExternalLink, Gauge, LogOut, Menu, MessageSquare, X } from 'lucide-react'
import { ownerLogout } from '@/app/kabinet/login/actions'

type Owned = { id: string; name: string }

/** Majmua egasi kabineti menyusi (admin paneli uslubida) */
export default function OwnerSidebar({ me, owned, pending, siteUrl }: { me: string; owned: Owned[]; pending: number; siteUrl: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  useEffect(() => setOpen(false), [pathname])

  const link = (href: string, label: string, Icon: typeof Gauge, opts: { exact?: boolean; count?: number } = {}) => {
    const active = opts.exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)
    return (
      <Link key={href} href={href} aria-current={active ? 'page' : undefined}>
        <Icon aria-hidden="true" />
        {label}
        {opts.count ? <span className="adm-count">{opts.count > 99 ? '99+' : opts.count}</span> : null}
      </Link>
    )
  }

  const nav = (
    <aside className={`adm-side ${open ? 'is-open' : ''}`} aria-label="Kabinet menyusi">
      <Link href="/kabinet" className="adm-brand">
        <img src="/icon.svg" alt="" />
        <div>
          SportON
          <small>Majmua kabineti</small>
        </div>
      </Link>
      <nav className="adm-nav">
        <div className="adm-nav-label">Asosiy</div>
        {link('/kabinet', 'Bosh sahifa', Gauge, { exact: true })}
        {link('/kabinet/bronlar', 'Bronlar', CalendarCheck, { count: pending })}
        {link('/kabinet/sharhlar', 'Sharhlar', MessageSquare)}
      </nav>
      <nav className="adm-nav">
        <div className="adm-nav-label">Majmualarim</div>
        {owned.map((c) => link(`/kabinet/majmua/${c.id}`, c.name, Building2))}
      </nav>
      <nav className="adm-nav">
        <a href={siteUrl || '/'} target="_blank" rel="noreferrer">
          <ExternalLink aria-hidden="true" /> Saytga o‘tish
        </a>
      </nav>
      <div className="adm-side-foot">
        <div className="adm-me">
          <span className="avatar">{me.slice(0, 1).toUpperCase()}</span>
          <div>
            <b>{me}</b>
            <span>Majmua egasi</span>
          </div>
        </div>
        <form action={ownerLogout}>
          <button className="btn btn--block btn--sm">
            <LogOut aria-hidden="true" /> Chiqish
          </button>
        </form>
      </div>
    </aside>
  )

  return (
    <>
      <div className="adm-topbar">
        <Link href="/kabinet" className="adm-brand" style={{ padding: 0 }}>
          <img src="/icon.svg" alt="" /> Kabinet
        </Link>
        <button className="btn btn--sm" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Menyu">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && <button className="adm-scrim" aria-label="Yopish" onClick={() => setOpen(false)} />}
      {nav}
    </>
  )
}
