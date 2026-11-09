import Courtyard from './locations/Courtyard'
import Forest from './locations/Forest'
import Citadel from './locations/Citadel'
import Hall from './locations/Hall'
import NorthernGate from './locations/NorthernGate'
import { Zone } from './primitives'

/**
 * The five locations. Each lives in a <Zone>, which hides it (and skips rendering it) unless the explorer
 * is near, so only ~one location is ever drawn at a time.
 */
export default function Locations({ lite }) {
  return (
    <>
      <Zone from={-1} to={5.6}>
        <Courtyard />
      </Zone>
      <Zone from={3.4} to={10.4}>
        <Forest lite={lite} />
      </Zone>
      <Zone from={7.6} to={15.8}>
        <Citadel lite={lite} />
      </Zone>
      <Zone from={13.6} to={19.9}>
        <Hall lite={lite} />
      </Zone>
      <Zone from={17.6} to={22}>
        <NorthernGate lite={lite} />
      </Zone>
    </>
  )
}
