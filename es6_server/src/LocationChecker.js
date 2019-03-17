import distance from "geo-distance";

const verifyUserLocation = (data, connection) => {
  //distance
  const distanceToTarget = distance.between(
    { lat: data.lat, lon: data.lon },
    { lat: 60.388611, lon: 5.324472 }
  );

  if (distanceToTarget > distance("40 m")) {
    throw "Du er for langt unna (" +
      distanceToTarget.human_readable() +
      "), kom nærmere, og/eller bruk mobil!";
  }
  //eduroam
  if (!connection.remoteAddress.includes("129.177")) {
    throw "Du må være tilkoblet UIB-nett";
  }
  return true;
};

export default verifyUserLocation;
