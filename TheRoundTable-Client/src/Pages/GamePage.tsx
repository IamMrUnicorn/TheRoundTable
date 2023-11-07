import { useContext, useEffect, useState } from 'react'
import { supabaseContext } from '../Utils/supabase';
import {LoadingPage, DMSetupPage, DMPage, PlayerPage, PlayerWaitingPage} from './Index'
import {getCharacterById, getAllCharacterIdsByPartyId} from '../Utils/SupabaseFns'
import { characterDataI } from '../Components/CharacterSheet';


export const GamePage = () => {

  const [userisDM, setUserisDM] = useState<boolean | null>(null);
  const [characterId, setCharacterId] = useState()
  const [partyId, setPartyId] = useState<number>()
  const [isWaiting, setIsWaiting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [characters, setCharacters] = useState <characterDataI[]>()
  const [thisUserCharacter, setThisUserCharacter] = useState <characterDataI>()

  const supabase = useContext(supabaseContext)

  interface PartyMember {
    id: number;
    party_id: number;
    user_id: number;
    is_dm: boolean;
    character_id: number | null;
    parties: {
      name: string;
    };
  }

  const getAllPartyMemberInfoInRoom = async (partyName: string) => {
    try {
      let { data, error } = await supabase
        .from('party_members')
        .select(`
          *,
          parties (
            name
          )
        `)
        .eq('parties.name', partyName);

      if (error) throw error;
      if (data && data.length === 0 || !data) throw new Error("No matching records found.");
      console.log(data.filter(item => item.parties !== null))
      return data.filter(item => item.parties !== null);

    } catch (error) {
      console.error(error);
    }
  }

  const getPartyNameFromURL = () => {
    return decodeURIComponent(window.location.pathname.slice(7))
  }

  const getRoomStatus = async (partyId: number) => {
    try {
      let { data, error } = await supabase
        .from('parties')
        .select('setup')
        .eq('id', partyId)
        .single()
      if (error || !data) throw error
      setIsWaiting(!data.setup)
    } catch (error) {
      console.log(error)
    }
  }

  const getUserID = async () => {
    try {
      let {data, error} = await supabase
      .from('users')
      .select('id')
      .single()
      if (!data) return null
      if (error) throw error
      return data as {id: number}
    } catch (error) {
      console.log(error)
    }
  }


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        const userID = await getUserID()

        const partyMembersInfo = await getAllPartyMemberInfoInRoom(getPartyNameFromURL()) as PartyMember[];

        if (!userID) return null

        const thisUser: PartyMember = partyMembersInfo?.filter((data)=>data.user_id === userID.id)[0]  
        
        if (thisUser) {
          setPartyId(thisUser.party_id);
          setUserisDM(thisUser.is_dm);

          // Fetch all character IDs for the party
          const characterIds = await getAllCharacterIdsByPartyId(thisUser.party_id);

          if (characterIds) {
            // Fetch the data for all characters
            const characterDataArray: (characterDataI | null)[] = await Promise.all(
              characterIds.map((id) => getCharacterById(id))
            );

            // Filter out any nulls if a character wasn't found
            const charactersData = characterDataArray.filter((character): character is characterDataI => character !== null);
            setCharacters(charactersData)
            const thisCharacter = charactersData.filter((character)=> character.creator_id === userID.id)[0]
            setThisUserCharacter(thisCharacter)
          }

          // Get the room status for the party
          await getRoomStatus(thisUser.party_id);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);


  // figure out realtime data subscription
  const parties = supabase.channel('custom-filter-channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'parties',
        filter: 'name=eq.someValue'
      },
      (payload) => {
        console.log('Change received!', payload)
      }
    )
    .subscribe()


  if (isLoading) return <LoadingPage />

  if (isWaiting) {
    if (userisDM === true) {
      return <DMSetupPage />
    } else if (userisDM === false) {
      return <PlayerWaitingPage character_id={characterId}/>
    }

  }

  if (userisDM === true) {
    return <DMPage party={characters}/>
  } else if (userisDM === false) {
    return <PlayerPage party={characters} usersCharacter={thisUserCharacter}/>
  } else {

  }
}
