import { useState } from 'react'
import ComplexCard from './ComplexCard.jsx'
import { complexes } from '../../data/complexes.js'
import './SportComplexes.css'
import { tr } from '../../i18n/index.js'

const PAGE_SIZE = 8

export default function SportComplexes({ id = 'majmualar' }) {
  const [visible, setVisible] = useState(PAGE_SIZE)
  const shown = complexes.slice(0, visible)

  return (
    <section className="sport-complexes container" id={id}>
      <h2 className="sport-complexes__title">{tr('Sport majmualari')}</h2>

      <ul className="sport-complexes__grid">
        {shown.map((complex) => (
          <li key={complex.id}>
            <ComplexCard complex={complex} />
          </li>
        ))}
      </ul>

      {visible < complexes.length && (
        <button
          type="button"
          className="sport-complexes__more"
          onClick={() => setVisible((value) => value + PAGE_SIZE)}
        >
          Ko&apos;proq
        </button>
      )}
    </section>
  )
}
