import { useContext, useEffect, useState } from 'react';
import { supabaseContext } from '../Utils/supabase';
import { LoadingPage, DMSetupPage, DMPage, PlayerPage, PlayerWaitingPage } from './Index';
import { getCharacterById, getAllCharacterIdsByPartyId } from '../Utils/SupabaseFns';
import { characterDataI } from '../Components/CharacterSheet';

export interface PartyMember {
  user_id: number;
  character_id: number | null;
}

interface PartyMemberExtra {
  id: number;
  party_id: number;
  user_id: number;
  is_dm: boolean;
  character_id: number | null;
  parties: {
    name: string;
  };
}

export const GamePage = () => {
  const [userIsDM, setUserIsDM] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isUserInParty, setIsUserInParty] = useState(false);
  const [userHasCharacter, setUserHasCharacter] = useState(false);
  const [characters, setCharacters] = useState<characterDataI[]>([]);
  const [partyMembers, setPartyMembers] = useState<PartyMember[]>([]);
  const [thisUserCharacter, setThisUserCharacter] = useState<characterDataI | null>(null);

  const supabase = useContext(supabaseContext);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const partyName = getPartyNameFromURL();
      const userID = await getUserID();
      if (!userID) return;

      const partyMembers = await getAllPartyMemberInfoInRoom(partyName);

      const thisUser = partyMembers.find(member => member.user_id === userID);
      setIsUserInParty(!!thisUser);

      if (thisUser) {
        setUserIsDM(thisUser.is_dm);

        await fetchCharacters(thisUser.party_id, userID);

        await checkRoomStatus(thisUser.party_id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPartyNameFromURL = () => {
    return decodeURIComponent(window.location.pathname.slice(7));
  };

  const getUserID = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .single();
    if (error) throw error;
    return data ? data.id : null;
  };

  const getAllPartyMemberInfoInRoom = async (partyName: string) => {
    const { data, error } = await supabase
      .from('party_members')
      .select(`*, parties (name)`)
      .eq('parties.name', partyName);
    if (error) throw error;
    
    if (data && data.length === 0 || !data) throw new Error("No matching records found.");
      return data.filter(item => item.parties !== null) as PartyMemberExtra[];

  };

  const checkRoomStatus = async (partyId: number) => {
    const { data, error } = await supabase
      .from('parties')
      .select('setup')
      .eq('id', partyId)
      .single();
    if (error || !data) throw error;
    setIsWaiting(!data.setup);
  };

  const fetchCharacters = async (partyId: number, userId: number) => {
    const partyMembers = await getAllCharacterIdsByPartyId(partyId);
    if (!partyMembers) return;
    setPartyMembers(partyMembers);

    const userMember = partyMembers.find(member => member.user_id === userId);
    setUserHasCharacter(!!userMember?.character_id);

    const membersWithCharacters = partyMembers.filter(member => member.character_id !== null);
    const characterDataOrNullArray = await Promise.all(
      membersWithCharacters.map(member => getCharacterById(member.character_id as number))
    );
    
    const characterDataArray = characterDataOrNullArray.filter((character): character is characterDataI => character !== null);
    setCharacters(characterDataArray);
  
    if (userMember?.character_id !== null) {
      const userCharacter = characterDataArray.find(character => character.creator_id === userId);
      if (userCharacter) {
        setThisUserCharacter(userCharacter);
      }
    }
  };

  if (isLoading) return <LoadingPage />;

  if (userIsDM && isWaiting) return <DMSetupPage partyMembers={partyMembers} />;
  if (!userIsDM && (isWaiting || !isUserInParty || !userHasCharacter)) return <PlayerWaitingPage userInParty={isUserInParty} hasCharacter={userHasCharacter} />;
  

  return userIsDM ? <DMPage party={characters} /> : <PlayerPage party={characters} usersCharacter={thisUserCharacter} />;
};