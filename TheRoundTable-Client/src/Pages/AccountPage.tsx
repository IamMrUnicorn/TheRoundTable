import { FC } from "react";
import { UserProfile } from '@clerk/clerk-react'



const AccountPage:FC = ({}) => {

  return (
    <div>
      Account page
      <UserProfile/>
    </div>
  )
}

export default AccountPage

//display users clerk profile and other account settings
//if you're a dm then display running sesssions?