import {
  MdDirectionsBike,
  MdDirectionsRun,
  MdFitnessCenter,
  MdPool,
  MdSelfImprovement,
  MdSports,
  MdSportsBasketball,
  MdSportsMartialArts,
  MdSportsMma,
  MdSportsSoccer,
  MdSportsTennis,
  MdSportsVolleyball,
} from 'react-icons/md'
import { GiChessKnight, GiPingPongBat, GiTennisRacket } from 'react-icons/gi'

/**
 * react-icons ikonkalari to‘ldirilgan (fill) shaklda — lucide uslubidagi `strokeWidth`
 * ularga kontur qo‘shib yuboradi, shuning uchun faqat size/className uzatiladi.
 */
function filled(Icon) {
  function SportIcon({ size = 18, className }) {
    return <Icon size={size} className={className} aria-hidden="true" />
  }
  SportIcon.displayName = Icon.name
  return SportIcon
}

export const sportIcons = {
  futbol: filled(MdSportsSoccer),
  basketbol: filled(MdSportsBasketball),
  tennis: filled(MdSportsTennis),
  suzish: filled(MdPool),
  fitnes: filled(MdFitnessCenter),
  boks: filled(MdSportsMma),
  kurash: filled(MdSportsMartialArts),
  voleybol: filled(MdSportsVolleyball),
  yoga: filled(MdSelfImprovement),
  'stol-tennisi': filled(GiPingPongBat),
  padel: filled(GiTennisRacket),
  'yengil-atletika': filled(MdDirectionsRun),
  velosport: filled(MdDirectionsBike),
  shaxmat: filled(GiChessKnight),
  boshqa: filled(MdSports),
}
