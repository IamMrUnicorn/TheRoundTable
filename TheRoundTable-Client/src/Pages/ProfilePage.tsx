import { useState, useEffect, useContext } from "react"
import { supabaseContext } from "../Utils/supabase"
import { LoadingPage } from "./LoadingPage"

export const ProfilePage = () => {
  const supabase = useContext(supabaseContext)
  const [profileData, setProfileData] = useState({})
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsloading] = useState(false)

  const getProfileData = async() => {
    const { data: { user } } = await supabase.auth.getUser()
    console.log(user)
    setProfileData(user)
  }

  const handleSignOut =async () => {
    let { error } = await supabase.auth.signOut()
  }

  useEffect(()=>{
    getProfileData()
  }, [])

  if (isLoading) return <LoadingPage/>                 
  return (
    <div className='bg-white'>
      <label>
        Name
        {isEditing ? <input type='text'/> : <p>{profileData.user_metadata ? profileData.user_metadata.full_name : 'none'}</p>}
      </label>
      <label>
        Email
        <p>{profileData.email}</p>
      </label>
      <label>
        Picture
        {isEditing ? <img src={profileData.user_metadata ? profileData.user_metadata.picture : null}/> :  <img src={profileData.user_metadata ? profileData.user_metadata.picture : null}/>}
      </label>
      <button className="btn btn-primary capitalize font-accent" onClick={handleSignOut}>Sign out</button>
    </div>
  )
}