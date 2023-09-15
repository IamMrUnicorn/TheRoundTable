
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
const LocationInfo = ({ sessionDetails }: LocationProps) => {
  // 4 address lines
  return (
    <div className="text-neutral bg-secondary LocationInfo flex flex-row justify-center p-1">
      <div className='flex flex-col'>

        <div className='flex flex-row capitalize font-accent'>

          <div className="flex flex-col items-start px-2 ">
            <p className="LocationInfo-location"><i className="fa-solid fa-house" /> {sessionDetails.location1}</p>
            <p className="LocationInfo-location"><i className="fa-solid fa-map-location-dot" /> {sessionDetails.location2}</p>
            <p className="LocationInfo-location"><i className="fa-solid fa-earth-americas" /> {sessionDetails.location3}</p>
            <p className="LocationInfo-location"><i className="fa-solid fa-globe" /> {sessionDetails.location4}</p>
          </div>
          <div className="flex flex-col items-start px-2 ">

            <p className="LocationInfo-time"><i className="fa-solid fa-clock" /> {sessionDetails.time}</p>

            <p className="LocationInfo-weather"><i className="fa-solid fa-cloud-bolt" /> {sessionDetails.weather}</p>
          </div>
        </div>
        <div className='flex flex-row justify-center my-2'>
          spotify goes here
        </div>
      </div>
    </div>
  )
}

export default LocationInfo