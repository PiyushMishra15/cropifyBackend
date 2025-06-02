const geolib = require("geolib");

function calculateDistance(coord1, coord2) {
  const distance = geolib.getDistance(
    { latitude: coord1[1], longitude: coord1[0] },
    { latitude: coord2[1], longitude: coord2[0] }
  );
  return distance / 1000; // distance in kilometers
}
module.exports = calculateDistance;
