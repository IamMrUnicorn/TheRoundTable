import {useState, useEffect} from "react";

const SpotifyMusicPlayer = () => {
  // const [volume, setVolume] = useState(50)

  return (
    <div className="bg-secondary Spotify-MetaData-Card flex flex-row lg:h-[30vh]">
      
      <div className="w-52 h-52 Spotify-album-image">
        <img src='https://i.scdn.co/image/ab67616d0000b273a9b9a9b870c117c9cfbb0f65'></img>
      </div>

      <div className="flex flex-col text-neutral pl-5">
        <div className="m-2 Spotify-song-info flex flex-col items-start">
          <p className="m-2 Spotify-song-name">song name </p>
          <p className="m-2 Spotify-song-artist">artist</p>
          <p className="m-2 Spotify-song-album">album name</p>
        </div>

        <div className="Spotify-playback-progress flex flex-row">
          <p>1:47</p>
          <input type="range" min='0' max='100'/>
          <p>2:41</p>
        </div>
      </div>

      {/* <div className="flex flex-col">
        <input className="Spotify-playback-volume " type="range" min='0' max='100' value={volume} onChange={(e) => {setVolume(e.target.value)}}/>
      </div> */}

      
    </div>
  )
}

export default SpotifyMusicPlayer