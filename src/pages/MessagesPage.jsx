import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  FiCalendar,
  FiCheck,
  FiFileText,
  FiMapPin,
  FiMoreHorizontal,
  FiPaperclip,
  FiPhone,
  FiSearch,
  FiSend,
  FiSmile,
  FiUsers,
  FiVideo,
  FiX,
} from 'react-icons/fi'
import { Check, Edit3, Image as ImageIcon } from 'lucide-react'
import MessageIcon from '../components/icons/MessageIcon.jsx'
import { companies } from '../data/companies.js'
import { candidatesByCategory } from '../data/candidates.js'
import { jobs } from '../data/jobs.js'
import {
  buildCandidateConversation,
  buildCompanyConversation,
  initialConversations,
  messageFilters,
  unreadTotal,
} from '../data/messages.js'
import './MessagesPage.css'

const allCandidates = Object.values(candidatesByCategory).flat()

const statIcons = {
  calendar: FiCalendar,
  users: FiUsers,
  map: FiMapPin,
}

function Avatar({ name, src, color, size = 44, online }) {
  const initial = name?.charAt(0) || '?'
  return (
    <span className="msg-avatar" style={{ width: size, height: size }} data-online={online || undefined}>
      {src ? (
        <img src={src} alt="" width={size} height={size} />
      ) : (
        <span className="msg-avatar__fallback" style={{ background: color || 'var(--color-primary)' }}>
          {initial}
        </span>
      )}
      {online ? <em className="msg-avatar__dot" aria-hidden /> : null}
    </span>
  )
}

function VerifiedBadge() {
  return (
    <span className="msg-verified" title="Tasdiqlangan" aria-label="Tasdiqlangan">
      <Check size={9} strokeWidth={3.5} />
    </span>
  )
}

export default function MessagesPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [conversations, setConversations] = useState(initialConversations)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const [mobilePane, setMobilePane] = useState('list')
  const [composeOpen, setComposeOpen] = useState(false)
  const threadEndRef = useRef(null)
  const inputRef = useRef(null)

  const activeId = searchParams.get('c')

  useEffect(() => {
    const companyId = searchParams.get('company')
    const jobId = searchParams.get('job')
    const candidateId = searchParams.get('candidate')

    if (!companyId && !candidateId) return

    setConversations((prev) => {
      let next = [...prev]
      let targetId = null

      if (companyId) {
        const existing = next.find((c) => c.companyId === companyId)
        if (existing) {
          targetId = existing.id
          if (jobId) {
            const job = jobs.find((j) => String(j.id) === String(jobId))
            if (job) {
              next = next.map((c) =>
                c.id === existing.id
                  ? {
                      ...c,
                      jobContext: {
                        jobId: job.id,
                        title: job.title,
                        location: job.location,
                        typeLabel: job.typeLabel,
                        typeTone: job.typeTone,
                      },
                    }
                  : c,
              )
            }
          }
        } else {
          const company = companies.find((c) => c.id === companyId)
          if (company) {
            const job = jobId ? jobs.find((j) => String(j.id) === String(jobId)) : null
            const created = buildCompanyConversation(company, job || null)
            next = [created, ...next]
            targetId = created.id
          }
        }
      }

      if (candidateId) {
        const existing = next.find((c) => c.id === `c-cand-${candidateId}`)
        if (existing) {
          targetId = existing.id
        } else {
          const candidate = allCandidates.find((c) => c.id === candidateId)
          if (candidate) {
            const created = buildCandidateConversation(candidate)
            next = [created, ...next]
            targetId = created.id
          }
        }
      }

      if (targetId) {
        queueMicrotask(() => {
          setSearchParams({ c: targetId }, { replace: true })
          setMobilePane('chat')
        })
      }

      return next
    })
  }, [searchParams, setSearchParams])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return conversations.filter((c) => {
      if (filter !== 'all' && c.peerType !== filter) return false
      if (!q) return true
      return (
        c.name.toLowerCase().includes(q) ||
        c.preview.toLowerCase().includes(q) ||
        c.jobContext?.title?.toLowerCase().includes(q)
      )
    })
  }, [conversations, filter, query])

  const active =
    conversations.find((c) => c.id === activeId) ||
    filtered[0] ||
    conversations[0] ||
    null

  useEffect(() => {
    if (searchParams.get('company') || searchParams.get('candidate')) return
    if (!activeId && active) {
      setSearchParams({ c: active.id }, { replace: true })
    }
  }, [active, activeId, searchParams, setSearchParams])

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [active?.id, active?.messages?.length])

  const totalUnread = unreadTotal(conversations)

  function selectConversation(id) {
    setSearchParams({ c: id })
    setMobilePane('chat')
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
    )
  }

  function sendMessage(event) {
    event.preventDefault()
    const text = draft.trim()
    if (!text || !active) return

    const time = new Date().toLocaleTimeString('uz-UZ', {
      hour: '2-digit',
      minute: '2-digit',
    })

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== active.id) return c
        return {
          ...c,
          preview: text,
          timeLabel: time,
          messages: [
            ...c.messages,
            {
              id: `local-${Date.now()}`,
              from: 'me',
              text,
              time,
              status: 'sent',
            },
          ],
        }
      }),
    )
    setDraft('')
    inputRef.current?.focus()
  }

  function startWithCompany(company) {
    setComposeOpen(false)
    navigate(`/xabarlar?company=${company.id}`)
  }

  return (
    <div className="messages-page">
      <div className="container messages-page__shell">
        <aside
          className={`messages-rail ${mobilePane === 'list' ? 'is-mobile-visible' : ''}`}
          aria-label="Xabarlar ro‘yxati"
        >
          <div className="messages-rail__head">
            <div className="messages-rail__title-row">
              <h1 className="messages-rail__title">
                Xabarlar
                {totalUnread > 0 ? <span className="messages-rail__badge">{totalUnread}</span> : null}
              </h1>
              <button
                type="button"
                className="messages-rail__compose"
                aria-label="Yangi xabar"
                onClick={() => setComposeOpen(true)}
              >
                <Edit3 size={16} strokeWidth={2.2} />
              </button>
            </div>

            <label className="messages-rail__search">
              <FiSearch aria-hidden />
              <input
                type="search"
                placeholder="Qidirish..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>

            <div className="messages-rail__tabs" role="tablist" aria-label="Filtr">
              {messageFilters.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={filter === item.id}
                  className={`messages-rail__tab ${filter === item.id ? 'is-active' : ''}`}
                  onClick={() => setFilter(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <ul className="messages-rail__list">
            {filtered.map((item) => {
              const isActive = active?.id === item.id
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`msg-thread ${isActive ? 'is-active' : ''}`}
                    onClick={() => selectConversation(item.id)}
                  >
                    <Avatar
                      name={item.name}
                      src={item.avatar}
                      color={item.avatarColor}
                      online={item.online}
                      size={48}
                    />
                    <span className="msg-thread__body">
                      <span className="msg-thread__top">
                        <span className="msg-thread__name">
                          {item.name}
                          {item.verified ? <VerifiedBadge /> : null}
                        </span>
                        <time className="msg-thread__time">{item.timeLabel}</time>
                      </span>
                      <span className="msg-thread__bottom">
                        <span className="msg-thread__preview">{item.preview}</span>
                        {item.unread > 0 ? (
                          <span className="msg-thread__unread">{item.unread}</span>
                        ) : null}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
            {filtered.length === 0 ? (
              <li className="messages-rail__empty">Hech narsa topilmadi</li>
            ) : null}
          </ul>

          <div className="messages-rail__promo">
            <MessageIcon size={22} />
            <div>
              <strong>Tezkor bron</strong>
              <p>Majmua administratoriga yozing — bo‘sh vaqtni darhol aniqlang.</p>
            </div>
          </div>
        </aside>

        <section
          className={`messages-chat ${mobilePane === 'chat' ? 'is-mobile-visible' : ''}`}
          aria-label="Suhbat"
        >
          {active ? (
            <>
              <header className="messages-chat__head">
                <button
                  type="button"
                  className="messages-chat__back"
                  aria-label="Ro‘yxatga qaytish"
                  onClick={() => setMobilePane('list')}
                >
                  ←
                </button>
                <button
                  type="button"
                  className="messages-chat__peer"
                  onClick={() => setMobilePane('info')}
                >
                  <Avatar
                    name={active.name}
                    src={active.avatar}
                    color={active.avatarColor}
                    online={active.online}
                    size={44}
                  />
                  <span>
                    <span className="messages-chat__peer-name">
                      {active.name}
                      {active.verified ? <VerifiedBadge /> : null}
                    </span>
                    <span className="messages-chat__peer-meta">
                      {active.roleLabel} • {active.lastSeen}
                    </span>
                  </span>
                </button>
                <div className="messages-chat__actions">
                  <button type="button" aria-label="Qo‘ng‘iroq" className="messages-chat__icon-btn">
                    <FiPhone />
                  </button>
                  <button type="button" aria-label="Video" className="messages-chat__icon-btn">
                    <FiVideo />
                  </button>
                  <button
                    type="button"
                    aria-label="Ma’lumot"
                    className="messages-chat__icon-btn messages-chat__icon-btn--info"
                    onClick={() => setMobilePane('info')}
                  >
                    <FiMoreHorizontal />
                  </button>
                </div>
              </header>

              <div className="messages-chat__body">
                {active.jobContext ? (
                  <div className="msg-job-card">
                    <div className="msg-job-card__copy">
                      <strong>{active.jobContext.title}</strong>
                      <span>
                        <FiMapPin />
                        {active.jobContext.location}
                        <em className={`msg-job-card__tag msg-job-card__tag--${active.jobContext.typeTone}`}>
                          {active.jobContext.typeLabel}
                        </em>
                      </span>
                    </div>
                    <Link to={`/bron/${active.jobContext.jobId}`} className="msg-job-card__cta">
                      Bron qilish
                    </Link>
                  </div>
                ) : null}

                <div className="msg-day">
                  <span>Bugun</span>
                </div>

                <ul className="msg-bubbles">
                  {active.messages.map((message) => (
                    <li
                      key={message.id}
                      className={`msg-row msg-row--${message.from === 'me' ? 'out' : 'in'}`}
                    >
                      {message.from !== 'me' ? (
                        <Avatar
                          name={active.name}
                          src={active.avatar}
                          color={active.avatarColor}
                          size={32}
                        />
                      ) : null}
                      <div className="msg-bubble">
                        {message.attachment ? (
                          <div className="msg-file">
                            <span className="msg-file__icon">
                              <FiFileText />
                            </span>
                            <span className="msg-file__meta">
                              <strong>{message.attachment.name}</strong>
                              <span>
                                {message.attachment.size} · {message.attachment.ext}
                              </span>
                            </span>
                          </div>
                        ) : null}
                        {message.text ? <p>{message.text}</p> : null}
                        <footer className="msg-bubble__meta">
                          <time>{message.time}</time>
                          {message.from === 'me' ? (
                            <span className="msg-bubble__ticks" aria-label="Yuborildi">
                              <FiCheck />
                              {(message.status === 'read' || message.status === 'delivered') && (
                                <FiCheck className="msg-bubble__tick2" />
                              )}
                            </span>
                          ) : null}
                        </footer>
                      </div>
                    </li>
                  ))}
                  <li ref={threadEndRef} aria-hidden />
                </ul>
              </div>

              <form className="messages-chat__composer" onSubmit={sendMessage}>
                <button type="button" className="messages-chat__tool" aria-label="Fayl biriktirish">
                  <FiPaperclip />
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Xabar yozing..."
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  aria-label="Xabar"
                />
                <button type="button" className="messages-chat__tool" aria-label="Emoji">
                  <FiSmile />
                </button>
                <button
                  type="submit"
                  className="messages-chat__send"
                  aria-label="Yuborish"
                  disabled={!draft.trim()}
                >
                  <FiSend />
                </button>
              </form>
            </>
          ) : (
            <div className="messages-chat__empty">
              <MessageIcon size={40} />
              <h2>Suhbat tanlang</h2>
              <p>Majmua yoki murabbiy bilan yozishishni boshlang.</p>
            </div>
          )}
        </section>

        <aside
          className={`messages-info ${mobilePane === 'info' ? 'is-mobile-visible' : ''}`}
          aria-label="Profil ma’lumoti"
        >
          {active ? (
            <>
              <button
                type="button"
                className="messages-info__close"
                aria-label="Yopish"
                onClick={() => setMobilePane('chat')}
              >
                <FiX />
              </button>

              <div className="messages-info__hero">
                <Avatar
                  name={active.name}
                  src={active.avatar}
                  color={active.avatarColor}
                  size={88}
                  online={active.online}
                />
                <h2>
                  {active.name}
                  {active.verified ? <VerifiedBadge /> : null}
                </h2>
                <p>{active.roleLabel}</p>
                <button type="button" className="messages-info__follow">
                  Kuzatish
                </button>
              </div>

              <div className="messages-info__stats">
                {active.stats?.map((stat) => {
                  const Icon = statIcons[stat.icon] || FiUsers
                  return (
                    <div key={stat.id} className="messages-info__stat">
                      <Icon aria-hidden />
                      <strong>{stat.value}</strong>
                      <span>{stat.label}</span>
                    </div>
                  )
                })}
              </div>

              {active.about ? (
                <section className="messages-info__block">
                  <h3>
                    {active.peerType === 'employer' ? 'Majmua haqida' : 'Murabbiy haqida'}
                  </h3>
                  <p>{active.about}</p>
                  <button type="button" className="messages-info__more">
                    Batafsil ma&apos;lumot
                  </button>
                </section>
              ) : null}

              {active.activeJobs?.length > 0 ? (
                <section className="messages-info__block">
                  <h3>Xizmatlar</h3>
                  <ul className="messages-info__jobs">
                    {active.activeJobs.map((job) => (
                      <li key={job.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setConversations((prev) =>
                              prev.map((c) =>
                                c.id === active.id
                                  ? {
                                      ...c,
                                      jobContext: {
                                        jobId: job.id,
                                        title: job.title,
                                        location: job.location,
                                        typeLabel: job.typeLabel,
                                        typeTone: job.typeTone,
                                      },
                                    }
                                  : c,
                              ),
                            )
                            setMobilePane('chat')
                          }}
                        >
                          <strong>{job.title}</strong>
                          <span>
                            <FiMapPin /> {job.location} · {job.typeLabel}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {active.media?.length > 0 ? (
                <section className="messages-info__block">
                  <h3>
                    <ImageIcon size={15} /> Media
                  </h3>
                  <div className="messages-info__media">
                    {active.media.map((src) => (
                      <img key={src} src={src} alt="" width={72} height={72} />
                    ))}
                  </div>
                </section>
              ) : null}
            </>
          ) : null}
        </aside>
      </div>

      {composeOpen ? (
        <div className="msg-compose" role="dialog" aria-modal="true" aria-label="Yangi xabar">
          <button
            type="button"
            className="msg-compose__backdrop"
            aria-label="Yopish"
            onClick={() => setComposeOpen(false)}
          />
          <div className="msg-compose__panel">
            <header>
              <h2>Yangi xabar</h2>
              <button type="button" aria-label="Yopish" onClick={() => setComposeOpen(false)}>
                <FiX />
              </button>
            </header>
            <p className="msg-compose__hint">Sport majmuasi yoki xizmat bo&apos;yicha yozing</p>
            <ul>
              {companies.slice(0, 10).map((company) => (
                <li key={company.id}>
                  <button type="button" onClick={() => startWithCompany(company)}>
                    <Avatar
                      name={company.name}
                      src={company.logo}
                      color={company.color}
                      size={40}
                    />
                    <span>
                      <strong>
                        {company.name}
                        {company.verified ? <VerifiedBadge /> : null}
                      </strong>
                      <em>{company.adsCount} ta xizmat</em>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  )
}
