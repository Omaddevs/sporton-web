import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  Bot,
  ChevronDown,
  CodeXml,
  Globe,
  Lock,
  MousePointer2,
  Play,
  Plus,
  Quote,
  Repeat,
  Rocket,
  SkipBack,
  Smartphone,
  Sparkles,
  TrendingUp,
  Volume2,
  WandSparkles,
} from 'lucide-react'
import {
  FiAward,
  FiCalendar,
  FiCheck,
  FiClock,
  FiDollarSign,
  FiHeart,
  FiMapPin,
  FiMessageCircle,
  FiUsers,
} from 'react-icons/fi'
import { FaLinkedinIn, FaTelegram } from 'react-icons/fa6'
import {
  blogPosts,
  competitionKinds,
  competitionStatus,
  competitions,
  exploreSectionById,
  exploreSections,
  founders,
  getSectionItems,
} from '../data/explore.js'
import { reelEmbedUrl, reelUrl, reels } from '../data/reels.js'
import {
  FeaturedCard as NewsFeatured,
  LatestNews,
  NewsRow,
  NewsTicker,
} from '../components/SportNews/SportNews.jsx'
import '../components/SportNews/SportNews.css'
import './ExplorePage.css'

export default function ExplorePage() {
  const { section: sectionId, itemId } = useParams()
  const section = exploreSectionById[sectionId]

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [sectionId, itemId])

  if (!section) return <Navigate to="/" replace />
  if (!itemId) return <SectionList key={section.id} section={section} />

  if (section.id === 'yangiliklar') return <Navigate to={`/yangilik/${itemId}`} replace />

  const detail = {
    asoschilar: () => {
      const founder = founders.find((f) => f.id === itemId)
      return founder && <FounderDetail founder={founder} />
    },
    blog: () => {
      const post = blogPosts.find((p) => p.id === itemId)
      return post && <BlogDetail post={post} />
    },
    musobaqalar: () => {
      const comp = competitions.find((c) => c.id === itemId)
      return comp && <CompetitionDetail key={comp.id} comp={comp} />
    },
    reels: () => {
      const reel = reels.find((r) => r.code === itemId)
      return reel && <ReelDetail reel={reel} />
    },
  }[section.id]?.()

  return detail || <Navigate to={`/bolim/${section.id}`} replace />
}

/* ================= Ro‘yxat ================= */

function SectionList({ section }) {
  const items = useMemo(() => getSectionItems(section.id), [section.id])
  const tags = useMemo(() => ['Barchasi', ...new Set(items.map((i) => i.tag))], [items])
  const [tag, setTag] = useState('Barchasi')
  const filtered = tag === 'Barchasi' ? items : items.filter((i) => i.tag === tag)
  const [featured, ...rest] = filtered
  const isFounders = section.id === 'asoschilar'
  const isReels = section.id === 'reels'
  const isEvents = section.id === 'musobaqalar'
  const isBlog = section.id === 'blog'

  return (
    <div className="explore">
      <div className="container">
        <Crumbs items={[{ label: section.title }]} />

        <header className="explore-hero">
          <img className="explore-hero__bg" src={section.heroImage} alt="" />
          <div className="explore-hero__content">
            <span
              className="explore-hero__icon"
              style={{ background: section.iconBg, color: section.iconColor }}
            >
              <section.Icon size={22} strokeWidth={2.2} />
            </span>
            <div>
              <h1>{section.title}</h1>
              <p>
                {section.description} · {items.length} ta material
              </p>
            </div>
            {section.externalUrl && (
              <a
                className="explore-btn explore-btn--light"
                href={section.externalUrl}
                target="_blank"
                rel="noreferrer"
              >
                Instagram’da ko‘rish <ArrowUpRight size={16} />
              </a>
            )}
          </div>
        </header>

        <nav className="explore-tabs" aria-label="Bo‘limlar">
          {exploreSections.map((s) => (
            <Link
              key={s.id}
              to={`/bolim/${s.id}`}
              className={`explore-tab ${s.id === section.id ? 'is-active' : ''}`}
            >
              <s.Icon size={16} strokeWidth={2.2} />
              {s.title}
            </Link>
          ))}
        </nav>

        {!isFounders && !isEvents && tags.length > 2 && (
          <div className="explore-chips" role="tablist">
            {tags.map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={t === tag}
                className={`explore-chip ${t === tag ? 'is-active' : ''}`}
                onClick={() => setTag(t)}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {isFounders ? (
          <>
            {founders.filter((f) => f.photo).map((f, i) => (
              <FounderShowcase key={f.id} founder={f} reverse={i % 2 === 1} />
            ))}
          </>
        ) : isBlog ? (
          <BlogBoard key={tag} items={filtered} allItems={items} />
        ) : isEvents ? (
          <EventsBoard items={items} />
        ) : isReels ? (
          <div className="reel-grid">
            {filtered.map((item) => (
              <ReelCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <>
            {featured && <FeaturedCard item={featured} />}
            <div className="explore-grid">
              {rest.map((item) => (
                <ExploreCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function FeaturedCard({ item }) {
  return (
    <Link to={item.href} className="explore-featured">
      <span className="explore-featured__media">
        <img src={item.image} alt="" />
      </span>
      <span className="explore-featured__body">
        <CardTags item={item} />
        <strong className="explore-featured__title">{item.title}</strong>
        <span className="explore-featured__excerpt">{item.excerpt}</span>
        <span className="explore-featured__foot">
          <span>{item.meta}</span>
          <span className="explore-featured__cta">
            O‘qish <ArrowUpRight size={16} />
          </span>
        </span>
      </span>
    </Link>
  )
}

function ExploreCard({ item }) {
  return (
    <Link to={item.href} className="explore-card">
      <span className="explore-card__media">
        <img src={item.image} alt="" loading="lazy" />
      </span>
      <span className="explore-card__body">
        <CardTags item={item} />
        <strong className="explore-card__title">{item.title}</strong>
        <span className="explore-card__excerpt">{item.excerpt}</span>
        <span className="explore-card__meta">{item.meta}</span>
      </span>
    </Link>
  )
}

function ReelCard({ item }) {
  return (
    <Link to={item.href} className="reel-card">
      <img src={item.image} alt="" loading="lazy" />
      <span className="reel-card__shade" />
      <span className="reel-card__play" aria-hidden="true">
        <Play size={18} fill="currentColor" strokeWidth={0} />
      </span>
      <span className="reel-card__info">
        <span className="explore-tag explore-tag--light">{item.tag}</span>
        <strong>{item.title}</strong>
        <span>{item.excerpt}</span>
      </span>
    </Link>
  )
}

function CardTags({ item }) {
  return (
    <span className="explore-tags">
      <span className="explore-tag">{item.tag}</span>
      {item.status && <StatusBadge status={item.status} />}
    </span>
  )
}

function StatusBadge({ status }) {
  return <span className={`explore-status explore-status--${status.tone}`}>{status.label}</span>
}

function Crumbs({ items }) {
  return (
    <nav className="explore-crumbs" aria-label="Breadcrumb">
      <Link to="/">Bosh sahifa</Link>
      {items.map((c) => (
        <span key={c.label} className="explore-crumbs__item">
          <span aria-hidden="true">/</span>
          {c.to ? <Link to={c.to}>{c.label}</Link> : <strong>{c.label}</strong>}
        </span>
      ))}
    </nav>
  )
}

function BackLink({ to, label }) {
  return (
    <Link to={to} className="explore-back">
      <ArrowLeft size={16} /> {label}
    </Link>
  )
}

function RelatedList({ title, items, sectionId }) {
  return (
    <aside className="explore-related">
      <div className="explore-related__head">
        <h3>{title}</h3>
        <Link to={`/bolim/${sectionId}`}>Barchasi</Link>
      </div>
      {items.map((item) => (
        <Link key={item.id} to={item.href} className="explore-related__item">
          <span className="explore-related__media">
            {item.avatar ? (
              <span className="founder-avatar founder-avatar--sm" style={{ background: item.avatar.gradient }}>
                {item.avatar.photo ? <img src={item.avatar.photo} alt="" /> : item.avatar.initials}
              </span>
            ) : (
              <img src={item.image} alt="" loading="lazy" />
            )}
          </span>
          <span className="explore-related__text">
            <span className="explore-tag">{item.tag}</span>
            <strong>{item.title}</strong>
            <span>{item.meta}</span>
          </span>
        </Link>
      ))}
    </aside>
  )
}

const related = (sectionId, excludeId, limit = 3) =>
  getSectionItems(sectionId)
    .filter((i) => i.id !== excludeId)
    .slice(0, limit)

/* ================= Asoschi ================= */

const SERVICE_ICONS = {
  mobile: Smartphone,
  web: Globe,
  bot: Bot,
  founder: Rocket,
  investor: TrendingUp,
  brand: BadgeCheck,
}
const TIMELINE_TICKS = ['0', '5s', '10s', '15s', '20s', '25s', '30s', '35s', '40s']

/** Rasmli asoschi uchun video-muharrir uslubidagi taqdimot bloki */
function FounderShowcase({ founder, isDetail = false, reverse = false }) {
  const [active, setActive] = useState(founder.services[0].id)
  const current = founder.services.find((s) => s.id === active)
  const tools = [
    { id: 'code', Icon: CodeXml },
    ...founder.services.map((s) => ({ id: s.id, Icon: SERVICE_ICONS[s.id] })),
    { id: 'magic', Icon: WandSparkles },
  ]

  return (
    <section
      className={`fshow ${isDetail ? 'fshow--detail' : ''} ${reverse ? 'fshow--reverse' : ''}`}
      style={{ '--photo-pos': founder.photoPosition }}
    >
      <div className="fshow__text">
        <span className="fshow__eyebrow">
          <Sparkles size={14} /> {founder.showcase.eyebrow}
        </span>
        {isDetail ? <h1 className="fshow__name">{founder.name}</h1> : <h2 className="fshow__name">{founder.name}</h2>}
        <p className="fshow__role">{founder.showcase.role}</p>
        <p className="fshow__lead">{founder.showcase.lead}</p>

        <div className="fshow__services" role="tablist" aria-label="Xizmatlar">
          {founder.services.map((s) => {
            const Icon = SERVICE_ICONS[s.id]
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={s.id === active}
                className={`fshow__service ${s.id === active ? 'is-active' : ''}`}
                onClick={() => setActive(s.id)}
              >
                <Icon size={16} strokeWidth={2.2} />
                {s.label}
              </button>
            )
          })}
        </div>

        <ul className="fshow__stack" aria-label={`${current.label} texnologiyalari`}>
          {current.stack.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>

        {!isDetail && (
          <div className="fshow__stats">
            {founder.stats.map((s) => (
              <div key={s.label}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="fshow__actions">
          <a className="fshow__btn fshow__btn--primary" href={founder.socials.telegram} target="_blank" rel="noreferrer">
            <FaTelegram /> {founder.showcase.cta}
          </a>
          {isDetail ? (
            <a className="fshow__btn" href={founder.socials.linkedin} target="_blank" rel="noreferrer">
              <FaLinkedinIn /> LinkedIn
            </a>
          ) : (
            <Link className="fshow__btn" to={`/bolim/asoschilar/${founder.id}`}>
              Batafsil <ArrowUpRight size={16} />
            </Link>
          )}
        </div>
      </div>

      <div className="fshow__stage" role="img" aria-label={`${founder.name} portreti`}>
        <span className="fshow__backdrop" />
        <span className="fshow__glow" />

        <div className="fshow__toolbar">
          {tools.map(({ id, Icon }) => (
            <span key={id} className={`fshow__tool ${id === active ? 'is-active' : ''}`}>
              <Icon size={17} strokeWidth={2} />
              {id === active && <MousePointer2 className="fshow__cursor fshow__cursor--tool" size={22} />}
            </span>
          ))}
        </div>

        <div className="fshow__frame">
          <img src={founder.photo} alt="" />
          <span className="fshow__grid">
            <i /><i /><i /><i />
          </span>
          <span className="fshow__corner fshow__corner--tl" />
          <span className="fshow__corner fshow__corner--tr" />
          <span className="fshow__corner fshow__corner--bl" />
          <span className="fshow__corner fshow__corner--br" />
          <span className="fshow__handle fshow__handle--t" />
          <span className="fshow__handle fshow__handle--b" />
          <span className="fshow__handle fshow__handle--l" />
          <span className="fshow__handle fshow__handle--r" />
          <span className="fshow__spark">
            <Sparkles size={20} fill="currentColor" />
            <MousePointer2 className="fshow__cursor" size={24} />
          </span>
        </div>

        <div className="fshow__chip">
          <span className="fshow__chip-thumbs">
            <img src={founder.photo} alt="" />
            <img src={founder.photo} alt="" />
          </span>
          <span className="fshow__chip-body">
            <Sparkles size={16} fill="currentColor" /> {current.label}
          </span>
          <MousePointer2 className="fshow__cursor fshow__cursor--chip" size={24} />
        </div>

        <div className="fshow__hi">
          <img src={founder.photo} alt="" />
          Salom! ✌️
        </div>

        <div className="fshow__controls">
          <span className="fshow__time">
            00:34:587 <ChevronDown size={13} />
          </span>
          <SkipBack size={16} />
          <Play size={17} fill="currentColor" />
          <Repeat size={16} />
          <span className="fshow__rec">
            <i /> {founder.showcase.cta}
          </span>
        </div>

        <div className="fshow__timeline">
          <div className="fshow__ruler">
            {TIMELINE_TICKS.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <span className="fshow__playhead" />

          {founder.services.map((s) => {
            const Icon = SERVICE_ICONS[s.id]
            return (
              <div key={s.id} className={`fshow__track ${s.id === active ? 'is-active' : ''}`}>
                <span className="fshow__track-head">
                  <ChevronDown size={13} />
                  <Icon size={14} />
                  <b>{s.label}</b>
                  <Volume2 size={13} />
                  <Lock size={12} />
                </span>
                <span className="fshow__track-clips">
                  {s.stack.map((t) => (
                    <em key={t}>{t}</em>
                  ))}
                </span>
              </div>
            )
          })}

          <div className="fshow__keys">
            <span><i /> Dizayn <b /><i /></span>
            <span className="is-dim"><i /> Deploy <b /><i /></span>
          </div>
        </div>

        <span className="fshow__file">
          <CodeXml size={30} strokeWidth={2.4} />
          <MousePointer2 className="fshow__cursor fshow__cursor--file" size={24} />
          <Plus className="fshow__plus" size={20} strokeWidth={3} />
        </span>
      </div>
    </section>
  )
}

function FounderDetail({ founder }) {
  return (
    <div className="explore">
      <div className="container">
        <Crumbs items={[{ label: 'Asoschilar', to: '/bolim/asoschilar' }, { label: founder.name }]} />

        {founder.photo ? (
          <FounderShowcase founder={founder} isDetail />
        ) : (
        <section className="founder-hero">
          <img className="founder-hero__bg" src={founder.image} alt="" />
          <div className="founder-hero__inner">
            <span className="founder-avatar founder-avatar--lg" style={{ background: founder.gradient }}>
              {founder.initials}
            </span>
            <div className="founder-hero__info">
              <h1>{founder.name}</h1>
              <p>{founder.role}</p>
              <ul className="explore-meta">
                <li><FiMapPin /> {founder.location}</li>
                <li><FiCalendar /> SportON’da {founder.since}-yildan</li>
              </ul>
            </div>
            <div className="founder-hero__socials">
              <a href={founder.socials.telegram} target="_blank" rel="noreferrer" aria-label="Telegram">
                <FaTelegram />
              </a>
              <a href={founder.socials.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <FaLinkedinIn />
              </a>
            </div>
          </div>
        </section>
        )}

        <div className="explore-layout">
          <article className="explore-main">
            <blockquote className="founder-quote">
              <Quote size={28} />
              <p>{founder.quote}</p>
            </blockquote>

            <div className="explore-stats">
              {founder.stats.map((s) => (
                <div key={s.label} className="explore-stat">
                  <strong>{s.value}</strong>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>

            <section className="explore-block">
              <h2>Biografiya</h2>
              {founder.bio.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </section>

            <section className="explore-block">
              <h2>Yutuqlar</h2>
              <ul className="explore-checklist">
                {founder.achievements.map((a) => (
                  <li key={a}>
                    <span><FiAward /></span>
                    {a}
                  </li>
                ))}
              </ul>
            </section>

            <BackLink to="/bolim/asoschilar" label="Barcha asoschilar" />
          </article>

          <RelatedList
            title="Jamoadagi boshqalar"
            items={related('asoschilar', founder.id)}
            sectionId="asoschilar"
          />
        </div>
      </div>
    </div>
  )
}

/* ================= Blog ================= */

function BlogDetail({ post }) {
  return (
    <div className="explore">
      <div className="container">
        <Crumbs items={[{ label: 'Blog', to: '/bolim/blog' }, { label: post.tag }]} />

        <div className="explore-layout">
          <article className="explore-main">
            <header className="blog-head">
              <span className="explore-tag">{post.tag}</span>
              <h1>{post.title}</h1>
              <p className="blog-head__lead">{post.excerpt}</p>
              <div className="blog-head__meta">
                <span className="blog-author">
                  <span className="founder-avatar founder-avatar--sm">
                    {post.author.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                  </span>
                  <span>
                    <strong>{post.author}</strong>
                    <small>{post.authorRole}</small>
                  </span>
                </span>
                <ul className="explore-meta">
                  <li><FiCalendar /> {post.date}</li>
                  <li><FiClock /> {post.readTime} daqiqa o‘qish</li>
                </ul>
              </div>
            </header>

            <figure className="explore-cover">
              <img src={post.image} alt={post.title} />
            </figure>

            <div className="blog-body">
              {post.content.map((block, i) => (
                <section key={block.heading} className="explore-block">
                  <h2>
                    <span className="blog-step">{String(i + 1).padStart(2, '0')}</span>
                    {block.heading}
                  </h2>
                  <p>{block.body}</p>
                </section>
              ))}
            </div>

            <BackLink to="/bolim/blog" label="Barcha maqolalar" />
          </article>

          <RelatedList title="Boshqa maqolalar" items={related('blog', post.id)} sectionId="blog" />
        </div>
      </div>
    </div>
  )
}

/* ================= Blog (ro‘yxat) ================= */

const BLOG_PAGE = 9

function BlogBoard({ items, allItems }) {
  const [visible, setVisible] = useState(BLOG_PAGE)
  const [lead, ...others] = items
  const side = others.slice(0, 2)
  const rest = others.slice(2)

  const byTag = (t) => allItems.filter((i) => i.tag === t).slice(0, 3)
  const groups = [
    { title: 'Tanlangan', items: allItems.filter((i) => i.featured).slice(0, 3) },
    { title: 'Qo‘llanmalar', items: byTag('Qo‘llanma') },
    { title: 'Sog‘lom turmush', items: byTag('Sog‘lom turmush') },
  ].filter((g) => g.items.length)

  if (!lead) return <p className="mag-empty">Hozircha bu bo‘limda maqolalar yo‘q.</p>

  return (
    <div className="mag">
      <div className="mag-top">
        <Link to={lead.href} className="mag-card mag-card--lead">
          <span className="mag-card__media">
            <img src={lead.image} alt="" />
            <span className="mag-card__label">{lead.tag}</span>
          </span>
          <strong className="mag-card__title">{lead.title}</strong>
          <span className="mag-card__excerpt">{lead.excerpt}</span>
          <span className="mag-card__foot">
            <span><FiCalendar /> {lead.date}</span>
            <span><FiClock /> {lead.readTime} daqiqa o‘qish</span>
          </span>
        </Link>

        {side.length > 0 && (
          <div className="mag-top__side" style={{ gridTemplateRows: `repeat(${side.length}, minmax(0, 1fr))` }}>
            {side.map((item) => (
              <Link key={item.id} to={item.href} className="mag-card mag-card--side">
                <span className="mag-card__media">
                  <img src={item.image} alt="" loading="lazy" />
                </span>
                <strong className="mag-card__title">{item.title}</strong>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mag-body">
        <div>
          <div className="mag-grid">
            {rest.slice(0, visible).map((item) => (
              <Link key={item.id} to={item.href} className="mag-card">
                <span className="mag-card__media">
                  <img src={item.image} alt="" loading="lazy" />
                </span>
                <strong className="mag-card__title">{item.title}</strong>
                <span className="mag-card__row">
                  <span className="mag-card__excerpt">{item.excerpt}</span>
                  <span className="mag-card__date">{item.date}</span>
                </span>
              </Link>
            ))}
          </div>

          {visible < rest.length && (
            <button type="button" className="mag-more" onClick={() => setVisible((v) => v + BLOG_PAGE)}>
              Yana ko‘rsatish
            </button>
          )}
        </div>

        {groups.length > 0 && (
          <aside className="mag-side">
            {groups.map((g) => (
              <section key={g.title} className="mag-group">
                <h3>{g.title}</h3>
                {g.items.map((item) => (
                  <Link key={item.id} to={item.href} className="mag-group__item">
                    <span className="mag-group__date">{item.date}</span>
                    <strong>{item.title}</strong>
                    <span>{item.excerpt}</span>
                  </Link>
                ))}
              </section>
            ))}
          </aside>
        )}
      </div>
    </div>
  )
}

/* ================= Musobaqalar va tadbirlar (ro‘yxat) ================= */

const EVENT_FILTERS = [
  { id: 'all', label: 'Barchasi' },
  { id: 'musobaqa', label: 'Musobaqalar' },
  { id: 'tadbir', label: 'Tadbirlar' },
]
/** Avval yaqinlashayotganlar (eng yaqini birinchi), keyin yakunlanganlar (eng yangisi birinchi) */
const byRelevance = (a, b) => {
  const aDone = a.statusKey === 'finished'
  const bDone = b.statusKey === 'finished'
  if (aDone !== bDone) return aDone ? 1 : -1
  return aDone ? b.startsAt.localeCompare(a.startsAt) : a.startsAt.localeCompare(b.startsAt)
}

/** Yangiliklar blokidagi kartochkalar kutadigan ko‘rinishga keltiradi */
const toNewsCard = (item) => ({
  id: item.id,
  href: item.href,
  title: item.title,
  excerpt: item.excerpt,
  image: item.image,
  category: item.tag,
  date: item.date,
  badge: `${item.kindLabel} · ${item.status.label}`,
})

function EventsBoard({ items }) {
  const [kind, setKind] = useState('all')
  const sorted = useMemo(() => [...items].sort(byRelevance), [items])
  const cards = (kind === 'all' ? sorted : sorted.filter((i) => i.kind === kind)).map((i) => ({
    ...toNewsCard(i),
    finished: i.statusKey === 'finished',
  }))
  const [lead, ...others] = cards
  const side = others.slice(0, 3)
  const rest = others.slice(3)
  const upcoming = rest.filter((c) => !c.finished)
  const finished = rest.filter((c) => c.finished)
  const ticker = sorted.filter((i) => i.statusKey !== 'finished').map((i) => `${i.date} — ${i.title}`)

  return (
    <div className="sport-news events">
      <div className="explore-chips" role="tablist">
        {EVENT_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={f.id === kind}
            className={`explore-chip ${f.id === kind ? 'is-active' : ''}`}
            onClick={() => setKind(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {lead ? (
        <div className={`sport-news__top ${side.length === 0 ? 'events__top--single' : ''}`}>
          <NewsFeatured news={lead} />
          {side.length > 0 && (
            <div className="sport-news__side" style={{ gridTemplateRows: `repeat(${side.length}, 1fr)` }}>
              {side.map((card) => (
                <NewsRow key={card.id} news={card} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="events-empty">Hozircha bu bo‘limda materiallar yo‘q.</p>
      )}

      {ticker.length > 1 && <NewsTicker items={ticker} label="Yaqin kunlarda" />}
      {upcoming.length > 0 && <LatestNews items={upcoming} title="Yaqinlashayotganlar" />}
      {finished.length > 0 && <LatestNews items={finished} title="Yakunlanganlar" />}
    </div>
  )
}

/* ================= Musobaqa ================= */

function CompetitionDetail({ comp }) {
  const status = competitionStatus[comp.status]
  const [registered, setRegistered] = useState(false)
  const taken = comp.participants + (registered ? 1 : 0)
  const fill = Math.min(100, Math.round((taken / comp.slots) * 100))
  const canRegister = comp.status === 'open'
  const kindLabel = competitionKinds[comp.kind]

  return (
    <div className="explore">
      <div className="container">
        <Crumbs items={[{ label: 'Musobaqalar', to: '/bolim/musobaqalar' }, { label: comp.title }]} />

        <section className="comp-hero">
          <img src={comp.image} alt="" />
          <div className="comp-hero__shade" />
          <div className="comp-hero__content">
            <span className="explore-tags">
              <span className="explore-tag explore-tag--light">{kindLabel}</span>
              <span className="explore-tag explore-tag--light">{comp.sport}</span>
              <StatusBadge status={status} />
            </span>
            <h1>{comp.title}</h1>
            <p>{comp.excerpt}</p>
          </div>
        </section>

        <div className="explore-layout">
          <article className="explore-main">
            <div className="comp-facts">
              <Fact icon={<FiCalendar />} label="Sana" value={comp.date} />
              <Fact icon={<FiMapPin />} label="Manzil" value={comp.location} />
              {comp.prize && <Fact icon={<FiAward />} label="Sovrin jamg‘armasi" value={comp.prize} />}
              <Fact icon={<FiDollarSign />} label="Ishtirok to‘lovi" value={comp.fee} />
            </div>

            <section className="explore-block">
              <h2>{kindLabel} haqida</h2>
              <p>{comp.description}</p>
            </section>

            <section className="explore-block">
              <h2>Dastur</h2>
              <ol className="comp-timeline">
                {comp.schedule.map((s) => (
                  <li key={s.time + s.label}>
                    <span className="comp-timeline__time">{s.time}</span>
                    <span className="comp-timeline__label">{s.label}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="explore-block">
              <h2>Shartlar</h2>
              <ul className="explore-checklist">
                {comp.rules.map((r) => (
                  <li key={r}>
                    <span><FiCheck /></span>
                    {r}
                  </li>
                ))}
              </ul>
            </section>

            <BackLink to="/bolim/musobaqalar" label="Barcha musobaqa va tadbirlar" />
          </article>

          <div className="explore-side">
            <div className="comp-register">
              <div className="comp-register__head">
                <FiUsers />
                <span>
                  <strong>{taken.toLocaleString('ru-RU')}</strong> / {comp.slots.toLocaleString('ru-RU')} ishtirokchi
                </span>
              </div>
              <div className="comp-progress" aria-label={`${fill}% to‘lgan`}>
                <span style={{ width: `${fill}%` }} />
              </div>
              <p className="comp-register__note">
                {canRegister
                  ? `${(comp.slots - taken).toLocaleString('ru-RU')} ta joy qoldi`
                  : comp.status === 'soon'
                    ? 'Ro‘yxatdan o‘tish tez orada ochiladi'
                    : `${kindLabel} yakunlangan`}
              </p>
              <button
                type="button"
                className={`explore-btn explore-btn--block ${registered ? 'is-done' : ''}`}
                disabled={!canRegister}
                onClick={() => setRegistered((v) => !v)}
              >
                {registered ? (
                  <>
                    <FiCheck /> Ro‘yxatdan o‘tdingiz
                  </>
                ) : canRegister ? (
                  'Ro‘yxatdan o‘tish'
                ) : (
                  status.label
                )}
              </button>
            </div>

            <RelatedList
              title="Boshqa musobaqa va tadbirlar"
              items={related('musobaqalar', comp.id)}
              sectionId="musobaqalar"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function Fact({ icon, label, value }) {
  return (
    <div className="comp-fact">
      <span className="comp-fact__icon">{icon}</span>
      <span>
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
    </div>
  )
}

/* ================= Reels ================= */

function ReelDetail({ reel }) {
  return (
    <div className="explore">
      <div className="container">
        <Crumbs items={[{ label: 'Reels', to: '/bolim/reels' }, { label: reel.tag }]} />

        <div className="reel-detail">
          <div className="reel-player">
            <iframe
              src={reelEmbedUrl(reel.code)}
              title={reel.title}
              loading="lazy"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className="reel-info">
            <span className="explore-tag">{reel.tag}</span>
            <h1>{reel.title}</h1>
            <ul className="explore-meta">
              <li><FiCalendar /> {reel.date}</li>
              <li><FiHeart /> {reel.likes}</li>
              <li><FiMessageCircle /> {reel.comments}</li>
            </ul>
            <a className="explore-btn" href={reelUrl(reel.code)} target="_blank" rel="noreferrer">
              Instagram’da ochish <ArrowUpRight size={16} />
            </a>

            <h3 className="reel-info__more">Boshqa videolar</h3>
            <div className="reel-grid reel-grid--compact">
              {related('reels', reel.code, 4).map((item) => (
                <ReelCard key={item.id} item={item} />
              ))}
            </div>
            <BackLink to="/bolim/reels" label="Barcha videolar" />
          </div>
        </div>
      </div>
    </div>
  )
}
