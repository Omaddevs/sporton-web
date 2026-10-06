import { useState } from 'react'
import { FiSearch } from 'react-icons/fi'
import './SearchBar.css'

export default function SearchBar({ onSearch }) {
  const [value, setValue] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    onSearch?.(value)
  }

  return (
    <form className="searchbar" onSubmit={handleSubmit} role="search">
      <FiSearch className="searchbar__icon" aria-hidden="true" />
      <input
        type="text"
        className="searchbar__input"
        placeholder="Sport turi, majmua yoki mashg‘ulotni qidiring..."
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-label="Qidiruv"
      />
      <button type="submit" className="searchbar__submit" aria-label="Qidirish">
        <FiSearch />
      </button>
    </form>
  )
}
