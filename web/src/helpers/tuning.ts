import type { RadioStation } from "../types/radioStation";

type UserLocation = { lat: number; lng: number };

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function resolveStationByTuning(
  value: number,
  stations: RadioStation[],
  userLocation?: UserLocation | null
): RadioStation | null {
  const withFreq = stations.filter((s) => s.frequency);
  if (withFreq.length === 0) return null;

  const minDist = withFreq.reduce(
    (min, s) => Math.min(min, Math.abs(parseFloat(s.frequency!) - value)),
    Infinity
  );
  const tied = withFreq.filter(
    (s) => Math.abs(parseFloat(s.frequency!) - value) === minDist
  );

  if (tied.length === 1) return tied[0]!;

  // Tiebreaker 1: closest station to user (only when both have coords)
  if (userLocation) {
    const withCoords = tied.filter((s) => s.lat !== null && s.lng !== null);
    if (withCoords.length > 0) {
      return withCoords.reduce((best, current) => {
        const dCurrent = getDistanceKm(userLocation.lat, userLocation.lng, current.lat!, current.lng!);
        const dBest = getDistanceKm(userLocation.lat, userLocation.lng, best.lat!, best.lng!);
        return dCurrent < dBest ? current : best;
      });
    }
  }

  // Tiebreaker 2: votes, then clickcount
  return tied.reduce((best, current) => {
    const voteDiff = (current.votes ?? 0) - (best.votes ?? 0);
    if (voteDiff !== 0) return voteDiff > 0 ? current : best;
    return (current.clickcount ?? 0) > (best.clickcount ?? 0) ? current : best;
  });
}
