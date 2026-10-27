import { Component } from 'react'
import { reportError } from '../../services/errorReporter.js'
import './ErrorBoundary.css'
import { tr } from '../../i18n/index.js'

/**
 * Sahifa chizishda xato bo‘lsa — oq ekran o‘rniga tushunarli xabar; xato adminlarga yuboriladi.
 * resetKey o‘zgarganda (boshqa sahifaga o‘tish) holat tiklanadi.
 */
export default class ErrorBoundary extends Component {
  state = { error: null, key: this.props.resetKey }

  static getDerivedStateFromError(error) {
    return { error }
  }

  static getDerivedStateFromProps(props, state) {
    return props.resetKey !== state.key ? { error: null, key: props.resetKey } : null
  }

  componentDidCatch(error, info) {
    reportError(error, { componentStack: info?.componentStack })
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="error-boundary container" role="alert">
        <h1>{tr('Nimadir noto‘g‘ri ketdi')}</h1>
        <p>{tr('Sahifani ko‘rsatib bo‘lmadi. Xato haqida jamoamizga xabar berildi — sahifani yangilab ko‘ring.')}</p>
        <div className="error-boundary__actions">
          <button type="button" className="error-boundary__btn" onClick={() => window.location.reload()}>
            {tr('Sahifani yangilash')}
          </button>
          <a className="error-boundary__link" href="/">
            {tr('Bosh sahifaga')}
          </a>
        </div>
      </div>
    )
  }
}
