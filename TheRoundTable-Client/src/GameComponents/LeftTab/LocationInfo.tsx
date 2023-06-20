
interface LocationProps {
  sessionDetails: {
    location1: string,
    location2: string,
    location3: string,
    location4: string,
    time: string,
    weather: string,
  }
}
const LocationInfo = ({sessionDetails}:LocationProps) => {
// 4 address lines
  return (
  <div className="text-neutral bg-secondary LocationInfo flex flex-row justify-center">
    <div className="flex flex-col items-start p-2">
      <p className="LocationInfo-location"><i className="fa-solid fa-house"></i> {sessionDetails.location1}</p>
      <p className="LocationInfo-location"><i className="fa-solid fa-map-location-dot"></i> {sessionDetails.location2}</p>
      <p className="LocationInfo-location"><i className="fa-solid fa-earth-americas"></i> {sessionDetails.location3}</p>
      <p className="LocationInfo-location"><i className="fa-solid fa-globe"></i> {sessionDetails.location4}</p>
    </div>
    <div className="flex flex-col items-start p-2"> 
      
      <p className="LocationInfo-time"><i className="fa-solid fa-clock"></i> {sessionDetails.time}</p>
      
      <p className="LocationInfo-weather"><i className="fa-solid fa-cloud-bolt"></i> {sessionDetails.weather}</p>
    </div>
  </div>
  )
}

export default LocationInfo