'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  CalendarCheck,
  ClipboardList,
  FileText,
  Gauge,
  BellRing,
  History,
  LifeBuoy,
  Mail,
  Menu,
  MessageSquare,
  Building2,
  Trophy,
  CalendarDays,
  Megaphone,
  Handshake,
  Clapperboard,
  Bug,
  Users,
  X,
  LogOut,
} from 'lucide-react'
import { adminLogout } from '@/app/admin/login/actions'
import ThemeToggle from './ThemeToggle'

type Counts = { bookings: number; submissions: number; tickets: number }
type Me = { name: string; role: string; isAdmin: boolean }

const GROUPS = [
  {
    label: 'Asosiy',
    items: [
      { href: '/admin', label: 'Boshqaruv paneli', Icon: Gauge, exact: true },
      { href: '/admin/bookings', label: 'Bronlar', Icon: CalendarCheck, count: 'bookings' as const },
      { href: '/admin/submissions', label: 'Arizalar', Icon: ClipboardList, count: 'submissions' as const },
      { href: '/admin/ads', label: 'Reklama', Icon: Megaphone },
    ],
  },
  {
    label: 'Katalog',
    items: [
      { href: '/admin/complexes', label: 'Majmualar', Icon: Building2 },
      { href: '/admin/sports', label: 'Sport turlari', Icon: Trophy },
      { href: '/admin/partners', label: 'Hamkorlar', Icon: Handshake },
    ],
  },
  {
    label: 'Kontent',
    items: [
      { href: '/admin/news', label: 'Yangiliklar', Icon: FileText },
      { href: '/admin/events', label: 'Sport tadbirlari', Icon: CalendarDays },
      { href: '/admin/reviews', label: 'Sharh va izohlar', Icon: MessageSquare },
      { href: '/admin/reels', label: 'Reels', Icon: Clapperboard },
    ],
  },
  {
    label: 'Foydalanuvchilar',
    items: [
      { href: '/admin/users', label: 'Foydalanuvchilar', Icon: Users },
      { href: '/admin/notifications', label: 'Bildirishnomalar', Icon: BellRing },
      { href: '/admin/tickets', label: 'Murojaatlar', Icon: LifeBuoy, count: 'tickets' as const },
      { href: '/admin/subscribers', label: 'Obunachilar', Icon: Mail },
      { href: '/admin/audit', label: 'Amallar jurnali', Icon: History, adminOnly: true },
      { href: '/admin/errors', label: 'Xatolar', Icon: Bug, adminOnly: true },
    ],
  },
]

const ROLE_LABEL: Record<string, string> = { admin: 'Administrator', moderator: 'Moderator', user: 'Foydalanuvchi' }

export default function Sidebar({ counts, me }: { counts: Counts; me: Me }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => setOpen(false), [pathname])

  const nav = (
    <aside className={`adm-side ${open ? 'is-open' : ''}`} aria-label="Admin menyu">
      <Link href="/admin" className="adm-brand">
        <img src="/icon.svg" alt="" />
        <div>
          SportON
          <small>Boshqaruv paneli</small>
        </div>
      </Link>
      {GROUPS.map((group) => (
        <nav key={group.label} className="adm-nav">
          <div className="adm-nav-label">{group.label}</div>
          {group.items
            .filter((item) => !('adminOnly' in item && item.adminOnly) || me.isAdmin)
            .map(({ href, label, Icon, ...rest }) => {
              const exact = 'exact' in rest && rest.exact
              const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)
              const count = 'count' in rest && rest.count ? counts[rest.count] : 0
              return (
                <Link key={href} href={href} aria-current={active ? 'page' : undefined}>
                  <Icon aria-hidden="true" />
                  {label}
                  {count > 0 && <span className="adm-count">{count > 99 ? '99+' : count}</span>}
                </Link>
              )
            })}
        </nav>
      ))}
      <div className="adm-side-foot">
        <div className="adm-me">
          <span className="avatar">{me.name.slice(0, 1).toUpperCase()}</span>
          <div>
            <b>{me.name}</b>
            <span>{ROLE_LABEL[me.role] ?? me.role}</span>
          </div>
        </div>
        <ThemeToggle />
        <form action={adminLogout}>
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
        <Link href="/admin" className="adm-brand" style={{ padding: 0 }}>
          <img src="/icon.svg" alt="" /> SportON
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
