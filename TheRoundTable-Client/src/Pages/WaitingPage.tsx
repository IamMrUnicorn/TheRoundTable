import { useContext, useEffect, useState } from 'react'
import { supabaseContext } from '../utils/supabase';
import { DMSetupPage } from "./DMSetupPage";
import { PlayerWaitingPage } from './PlayerWaitingPage';
import { LoadingPage } from './LoadingPage';

// !make sure players are rerouted to the gamepage when room is set to ready
export const WaitingPage = ({user_id}: {user_id: string}) => {

  const supabase = useContext(supabaseContext)

  console.log()
  const [userisDM, setUserisDM] = useState<boolean | null>(null);
  const [partyName, setPartyName] = useState('')

  const isUserTheDm = async (partyName: string) => {
    let { data, error } = await supabase
      .from('parties')
      .select('DM_clerk_id')
      .eq('name', partyName)
    if (error) {
      console.log(error)
    } else {
      setUserisDM(user_id === data[0].DM_clerk_id ? true : false)
    }
  }
  
  const setPartyNameFromURL = () => {
    const nameFromUrl = window.location.pathname.slice(14)
    const name = decodeURIComponent(nameFromUrl)
    setPartyName(name)
  }

  useEffect(() =>{
    setPartyNameFromURL()
    isUserTheDm(partyName)
  }, [partyName])

  if (userisDM === true) {
    return <DMSetupPage user_id={user_id} />
  } else if (userisDM === false) {
    return <PlayerWaitingPage user_id={user_id} partyName={partyName}/>
  } else {
    return <LoadingPage/>
  }
}