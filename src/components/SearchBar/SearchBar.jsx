import { useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { FiSearch } from 'react-icons/fi'
import './SearchBar.css'
import { tr } from '../../i18n/index.js'

export default function SearchBar({ onSearch }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  // Qidiruv sahifasida so‘rov maydonda qoladi
  const [value, setValue] = useState(() => (pathname === '/qidiruv' ? (params.get('q') ?? '') : ''))

  const handleSubmit = (event) => {
    event.preventDefault()
    const query = value.trim()
    if (onSearch) return onSearch(query)
    if (query) navigate(`/qidiruv?q=${encodeURIComponent(query)}`)
  }

  return (
    <form className="searchbar" onSubmit={handleSubmit} role="search">
      <FiSearch className="searchbar__icon" aria-hidden="true" />
      <input
        type="text"
        className="searchbar__input"
        placeholder={tr('Sport turi, majmua yoki mashg‘ulotni qidiring...')}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-label={tr('Qidiruv')}
      />
      <button type="submit" className="searchbar__submit" aria-label={tr('Qidirish')}>
        <FiSearch />
      </button>
    </form>
  )
}
