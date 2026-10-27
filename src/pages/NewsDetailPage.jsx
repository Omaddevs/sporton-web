import { tr } from '../i18n/index.js'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  FiArrowLeft,
  FiArrowRight,
  FiArrowUpRight,
  FiCalendar,
  FiCheck,
  FiClock,
  FiEye,
  FiHeart,
  FiLink,
  FiMessageCircle,
  FiSend,
  FiShare2,
  FiSmile,
} from 'react-icons/fi'
import { FaFacebookF, FaLinkedinIn, FaTelegram, FaXTwitter } from 'react-icons/fa6'
import LogoIcon from '../components/icons/LogoIcon.jsx'
import { allNews, formatRelative, getRelatedNews, latestNews } from '../data/news.js'
import { useAuthGate } from '../hooks/useAuthGate.jsx'
import { useLike } from '../hooks/useLike.js'
import { useSeo } from '../hooks/useSeo.js'
import { useAuth } from '../context/auth.js'
import { api } from '../services/apiClient.js'
import { isEmbed } from '../utils/media.js'
import { useReadingProgress } from '../hooks/useReadingProgress.js'
import { getArticleById } from '../data/articles.js'
import './NewsDetailPage.css'

const MAX_COMMENT = 2000

function initials(name) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function NewsDetailPage() {
  const { newsId } = useParams()
  // key: boshqa maqolaga o‘tganda holat (like, saqlash) yangilanadi
  if (!getArticleById(newsId)) return <NewsNotFound />
  return <NewsDetailView key={newsId} newsId={newsId} />
}

function NewsNotFound() {
  return (
    <div className="news-page">
      <div className="container news-notfound">
        <h1>{tr('Maqola topilmadi')}</h1>
        <p>{tr('Bu maqola o‘chirilgan yoki manzil noto‘g‘ri.')}</p>
        <Link to="/" className="news-notfound__btn">{tr('Bosh sahifaga qaytish')}</Link>
      </div>
    </div>
  )
}

function NewsDetailView({ newsId }) {
  const news = useMemo(() => getArticleById(newsId), [newsId])
  useSeo({ title: news.title, description: news.excerpt, image: news.image, type: 'article' })
  const related = useMemo(() => getRelatedNews(news.id, 3), [news.id])
  const sidebarNews = useMemo(
    () => latestNews.filter((n) => n.id !== news.id).slice(0, 4),
    [news.id],
  )

  // Layklar serverda: haqiqiy soni, mehmonga ro‘yxatdan o‘tish oynasi
  const { liked, count: likeCount, toggle: toggleLike } = useLike('news', news.id)
  const [commentCount, setCommentCount] = useState(null)
  const [copied, setCopied] = useState(false)
  const articleRef = useRef(null)
  const commentsRef = useRef(null)
  const progress = useReadingProgress(articleRef)

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  const pageUrl = typeof window !== 'undefined' ? window.location.href : ''

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* ignore */
    }
  }

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: news.title, url: pageUrl })
      } catch {
        /* bekor qilindi */
      }
    } else {
      copyLink()
    }
  }

  const scrollToComments = () =>
    commentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const enc = encodeURIComponent
  const shareLinks = [
    { label: tr('Telegram'), icon: <FaTelegram />, href: `https://t.me/share/url?url=${enc(pageUrl)}&text=${enc(news.title)}` },
    { label: tr('Facebook'), icon: <FaFacebookF />, href: `https://www.facebook.com/sharer/sharer.php?u=${enc(pageUrl)}` },
    { label: 'X', icon: <FaXTwitter />, href: `https://x.com/intent/tweet?url=${enc(pageUrl)}&text=${enc(news.title)}` },
    { label: tr('LinkedIn'), icon: <FaLinkedinIn />, href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(pageUrl)}` },
  ]

  return (
    <div className="news-detail">
      <div className="news-detail__progress" style={{ transform: `scaleX(${progress})` }} />

      <div className="container">
        <nav className="news-detail__crumbs" aria-label={tr('Breadcrumb')}>
          <Link to="/">{tr('Bosh sahifa')}</Link>
          <span>/</span>
          <Link to="/#yangiliklar">{tr('Yangiliklar')}</Link>
          <span>/</span>
          <strong>{news.category}</strong>
        </nav>

        <header className="news-head">
          <div className="news-head__tags">
            <span className="news-head__cat">{news.category}</span>
            {news.badge && <span className="news-head__badge">{news.badge}</span>}
          </div>
          <h1 className="news-head__title">{news.title}</h1>
          <p className="news-head__lead">{news.excerpt}</p>

          <div className="news-head__meta">
            <div className="news-head__author">
              <span className="news-head__avatar">
                <LogoIcon size={16} />
              </span>
              <div>
                <strong>{news.author.name}</strong>
                <span>{news.author.role}</span>
              </div>
            </div>
            <ul className="news-head__stats">
              <li><FiCalendar /> {news.date}</li>
              <li><FiClock /> {news.readTime} {tr('daqiqa o‘qish')}</li>
              <li><FiEye /> {news.views.toLocaleString('ru-RU')}</li>
            </ul>
          </div>
        </header>

        <figure className="news-cover">
          <img src={news.image} alt={news.title} />
          <figcaption>{news.caption}</figcaption>
        </figure>

        <div className="news-detail__grid">
          {/* ===== Chap: harakatlar paneli ===== */}
          <aside className="news-rail" aria-label={tr('Maqola amallari')}>
            <button
              type="button"
              className={`news-rail__btn ${liked ? 'is-active' : ''}`}
              onClick={toggleLike}
              aria-pressed={liked}
              aria-label={tr('Yoqdi')}
            >
              <FiHeart />
              <span>{likeCount}</span>
            </button>
            <button type="button" className="news-rail__btn" onClick={scrollToComments} aria-label={tr('Izohlar')}>
              <FiMessageCircle />
              <span>{commentCount ?? news.commentsCount ?? 0}</span>
            </button>
            <button type="button" className="news-rail__btn" onClick={share} aria-label={tr('Ulashish')}>
              {copied ? <FiCheck /> : <FiShare2 />}
            </button>
          </aside>

          {/* ===== Markaz: maqola ===== */}
          <div className="news-detail__main">
            <article className="news-article" ref={articleRef}>
              <p className="news-article__lead">{news.body.lead}</p>
              <p>{news.body.paragraphs[0]}</p>

              {news.body.quote?.text && (
                <blockquote className="news-quote">
                  <p>{news.body.quote.text}</p>
                  {news.body.quote.author && <cite>— {news.body.quote.author}</cite>}
                </blockquote>
              )}

              {news.body.paragraphs.slice(1).map((p, i) => (
                <p key={i}>{p}</p>
              ))}

              {news.gallery?.length > 0 && <ArticleGallery items={news.gallery} />}

              <div className="news-article__tags">
                <span>{tr('Mavzular')}</span>
                {news.tags.map((t) => (
                  <Link key={t} to="/#yangiliklar" className="news-tag">
                    {t}
                  </Link>
                ))}
              </div>
            </article>

            <section className="news-share">
              <div className="news-share__text">
                <h2>{tr('Maqola foydali bo‘ldimi?')}</h2>
                <p>{tr('Yoqtirganingizni bildiring yoki do‘stlaringiz bilan ulashing.')}</p>
              </div>
              <div className="news-share__actions">
                <button
                  type="button"
                  className={`news-share__like ${liked ? 'is-active' : ''}`}
                  onClick={toggleLike}
                  aria-pressed={liked}
                >
                  <FiHeart />
                  {tr('Yoqdi')}
                  <span>{likeCount}</span>
                </button>
                {shareLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="news-share__icon"
                    aria-label={`${s.label} orqali ulashish`}
                  >
                    {s.icon}
                  </a>
                ))}
                <button
                  type="button"
                  className="news-share__icon"
                  onClick={copyLink}
                  aria-label={tr('Havolani nusxalash')}
                >
                  {copied ? <FiCheck /> : <FiLink />}
                </button>
              </div>
            </section>

            <nav className="news-pager" aria-label={tr('Boshqa maqolalar')}>
              {news.prev ? (
                <Link to={`/yangilik/${news.prev.id}`} className="news-pager__item">
                  <span><FiArrowLeft /> {tr('Oldingi maqola')}</span>
                  <strong>{news.prev.title}</strong>
                </Link>
              ) : (
                <span />
              )}
              {news.next && (
                <Link to={`/yangilik/${news.next.id}`} className="news-pager__item news-pager__item--next">
                  <span>{tr('Keyingi maqola')} <FiArrowRight /></span>
                  <strong>{news.next.title}</strong>
                </Link>
              )}
            </nav>

            <Comments
              ref={commentsRef}
              newsId={news.id}
              enabled={allNews.some((n) => n.id === news.id)}
              onCount={setCommentCount}
            />
          </div>

          {/* ===== O‘ng: sidebar ===== */}
          <aside className="news-side">
            <section className="news-side__card">
              <h2 className="news-side__title">{tr('So‘nggi yangiliklar')}</h2>
              <ol className="news-side__list">
                {sidebarNews.map((item, i) => (
                  <li key={item.id}>
                    <Link to={`/yangilik/${item.id}`} className="news-side__item">
                      <span className="news-side__num">{String(i + 1).padStart(2, '0')}</span>
                      <div className="news-side__body">
                        <strong>{item.title}</strong>
                        <span>{item.category} · {item.date}</span>
                      </div>
                      <img src={item.image} alt="" loading="lazy" />
                    </Link>
                  </li>
                ))}
              </ol>
            </section>

            <section className="news-promo">
              <img src="/images/sport/banner.jpg" alt="" loading="lazy" />
              <div className="news-promo__body">
                <span className="news-promo__eyebrow">{tr('SportON · Bron')}</span>
                <h3>{tr('Sevimli maydoningizni hoziroq bron qiling')}</h3>
                <Link to="/bron" className="news-promo__btn">
                  {tr('Bron qilish')} <FiArrowUpRight />
                </Link>
              </div>
            </section>
          </aside>
        </div>

        <section className="news-related">
          <div className="news-related__head">
            <h2>{tr('O‘xshash yangiliklar')}</h2>
            <Link to="/#yangiliklar" className="news-related__all">
              {tr('Barcha yangiliklar')} <FiArrowRight />
            </Link>
          </div>
          <div className="news-related__grid">
            {related.map((item) => (
              <Link key={item.id} to={`/yangilik/${item.id}`} className="news-card">
                <div className="news-card__media">
                  <img src={item.image} alt="" loading="lazy" />
                  <span className="news-card__cat">{item.category}</span>
                </div>
                <div className="news-card__body">
                  <span className="news-card__date"><FiCalendar /> {item.date}</span>
                  <h3>{item.title}</h3>
                  <p>{item.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

const AVATAR_COLORS = ['#7c4dff', '#26a69a', '#43a047', '#1e6ff5', '#ef6c00', '#c2185b']
const avatarColor = (name = '') => AVATAR_COLORS[[...name].reduce((s, c) => s + c.charCodeAt(0), 0) % AVATAR_COLORS.length]

function Comments({ ref, newsId, enabled, onCount }) {
  const { user } = useAuth()
  const { guard, modal } = useAuthGate()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(enabled)
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!enabled) return undefined
    const controller = new AbortController()
    api(`/news/${encodeURIComponent(newsId)}/comments`, { signal: controller.signal })
      .then((data) => {
        setComments(data.comments ?? [])
        onCount?.(data.comments?.length ?? 0)
      })
      .catch(() => null)
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [newsId, enabled, onCount])

  const submit = async (e) => {
    e?.preventDefault()
    // Izohni faqat ro‘yxatdan o‘tgan foydalanuvchi yozadi
    if (!guard('comment')) return
    const value = text.trim()
    if (value.length < 2 || sending) return
    setSending(true)
    setError('')
    try {
      const { comment } = await api(`/news/${encodeURIComponent(newsId)}/comments`, {
        method: 'POST',
        body: { text: value },
      })
      setComments((prev) => {
        const next = [{ ...comment, isNew: true }, ...prev]
        onCount?.(next.length)
        return next
      })
      setText('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  const author = user ? `${user.firstName} ${user.lastName}`.trim() : ''

  return (
    <section className="news-comments" ref={ref} id="izohlar">
      <div className="news-comments__head">
        <h2>
          {tr('Izohlar')} <span>{comments.length}</span>
        </h2>
      </div>

      {enabled ? (
        <>
          <form className="news-form" onSubmit={submit}>
            <span className="news-avatar" style={{ background: avatarColor(author) }}>
              {author ? initials(author) : 'M'}
            </span>
            <div className="news-form__box">
              <textarea
                placeholder={user ? tr('Fikringizni yozing…') : tr('Izoh yozish uchun ro‘yxatdan o‘ting yoki kiring…')}
                rows={3}
                value={text}
                maxLength={MAX_COMMENT}
                readOnly={!user}
                onFocus={() => !user && guard('comment')}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit(e)
                }}
              />
              {error && (
                <p className="news-form__error" role="alert">
                  {error}
                </p>
              )}
              <div className="news-form__bar">
                <span className="news-form__count">
                  <FiSmile />
                  {MAX_COMMENT - text.length}
                </span>
                <span className="news-form__hint">{tr('Ctrl + Enter — yuborish')}</span>
                <button type="submit" disabled={Boolean(user) && (text.trim().length < 2 || sending)}>
                  {sending ? tr('Yuborilmoqda…') : tr('Yuborish')} <FiSend />
                </button>
              </div>
            </div>
          </form>
          {modal}
          <p className="news-form__rules">
            {tr('Hurmat bilan va mavzu doirasida yozing. Haqoratli yoki spam izohlar o‘chiriladi.')}
          </p>
        </>
      ) : (
        <p className="news-form__rules">{tr('Bu maqola uchun izohlar yopiq.')}</p>
      )}

      {!loading && enabled && comments.length === 0 && (
        <p className="news-comments__empty">{tr('Hali izoh yo‘q. Birinchi bo‘lib fikr bildiring!')}</p>
      )}

      <ul className="news-comments__list">
        {comments.map((c) => (
          <li key={c.id} className={`news-comment ${c.isNew ? 'is-new' : ''}`}>
            <div className="news-comment__row">
              <span className="news-avatar" style={{ background: avatarColor(c.author) }}>
                {initials(c.author)}
              </span>
              <div className="news-comment__content">
                <div className="news-comment__meta">
                  <strong>{c.author}</strong>
                  <span>{formatRelative(c.createdAt)}</span>
                </div>
                <p>{c.text}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Maqola ichidagi galereya: rasmlar (bosilsa kattalashadi) va videolar (joyida ijro etiladi) */
function ArticleGallery({ items }) {
  const images = items.filter((m) => m.type === 'image')
  const [open, setOpen] = useState(null)

  useEffect(() => {
    if (open === null) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') setOpen((i) => (i + 1) % images.length)
      if (e.key === 'ArrowLeft') setOpen((i) => (i - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, images.length])

  return (
    <div className={`news-gallery ${items.length === 1 ? 'news-gallery--single' : ''}`}>
      {items.map((item) =>
        item.type === 'image' ? (
          <button
            key={item.url}
            type="button"
            className="news-gallery__item"
            onClick={() => setOpen(images.indexOf(item))}
            aria-label={tr('Rasmni kattalashtirish')}
          >
            <img src={item.url} alt="" loading="lazy" />
          </button>
        ) : isEmbed(item) ? (
          <div key={item.url} className={`news-gallery__item news-gallery__embed${item.provider === 'instagram' ? ' is-portrait' : ''}`}>
            <iframe src={item.url} title={tr('Video')} loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
          </div>
        ) : (
          <div key={item.url} className="news-gallery__item news-gallery__video">
            <video src={item.url} controls playsInline preload="metadata" />
          </div>
        ),
      )}

      {open !== null && images[open] && (
        <div className="news-lightbox" role="dialog" aria-modal="true" aria-label={tr('Rasm')} onClick={() => setOpen(null)}>
          <img src={images[open].url} alt="" onClick={(e) => e.stopPropagation()} />
          <button type="button" className="news-lightbox__close" aria-label={tr('Yopish')} onClick={() => setOpen(null)}>
            ×
          </button>
          {images.length > 1 && <span className="news-lightbox__count">{open + 1} / {images.length}</span>}
        </div>
      )}
    </div>
  )
}
