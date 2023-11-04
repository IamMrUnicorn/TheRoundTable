import { useState, useEffect, useContext } from "react"
import { supabaseContext } from "../utils/supabase"

export const ProfilePage = () => {
  const supabase = useContext(supabaseContext)
  const [profileData, setProfileData] = useState({})
  const [isEditing, setIsEditing] = useState(false)

  const getProfileData = async() => {
    const { data: { user } } = await supabase.auth.getUser()
    console.log(user)
    setProfileData(user)
  }

  useEffect(()=>{
    getProfileData()
  }, [])

  return (
    <div className='bg-white'>
      <label>
        Name
        {isEditing ? <input type='text'/> : <p>{profileData.name}</p>}
      </label>
      <label>
        Email
        <p>{profileData.email}</p>
      </label>
      <label>
        Picture
        {isEditing ? <img src={profileData.user_metadata.picture}/> :  <img src={profileData.picture}/>}
      </label>
    </div>
  )
}