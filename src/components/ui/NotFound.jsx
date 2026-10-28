import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import { useSeo } from '../../hooks/useSeo.js'
import { tr } from '../../i18n/index.js'
import './NotFound.css'

/** «Topilmadi» sahifasi: o‘chirilgan e’lon yoki noto‘g‘ri manzil */
export default function NotFound({
  title = tr('Sahifa topilmadi'),
  text = tr('Bu sahifa o‘chirilgan yoki manzil noto‘g‘ri.'),
  to = '/',
  cta = tr('Bosh sahifaga qaytish'),
}) {
  useSeo({ title, description: text })
  return (
    <div className="not-found container">
      <h1>{title}</h1>
      <p>{text}</p>
      <Link to={to} className="not-found__btn">
        {cta} <FiArrowRight />
      </Link>
    </div>
  )
}
