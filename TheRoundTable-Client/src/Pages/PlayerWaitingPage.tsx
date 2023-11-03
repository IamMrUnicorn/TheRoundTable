import { Tldraw } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

export interface waitingPageI {
  user_id: string;
  partyName: string;
}

export const PlayerWaitingPage = ({ user_id, partyName }: waitingPageI) => {
  const [partyId, setPartyId] = useState<string | null>(null);
  const [userInParty, setUserInParty] = useState<boolean>(false);
  const [hasCharacterInParty, setHasCharacterInParty] = useState<boolean>(false);

  const getRoomsUsersArr = async (partyName: string) => {
    const { data, error } = await supabase
      .from('parties')
      .select('users')
      .eq('name', partyName);
    if (error) {
      console.log(error);
    } else {
      // Check if user_id is in the returned array
      let users:string[] = (data[0].users);
      console.log(users)
      if (users && users.includes(user_id)) {
        setUserInParty(true);
      }
    }
  };

  const getPartyIdFromName = async (partyName: string) => {
    const { data, error } = await supabase
      .from('parties')
      .select('id')
      .eq('name', partyName)
      .limit(1);
    if (error) {
      console.log(error);
    } else {
      // Use the party ID for the next function
      if (data && data.length > 0) {
        setPartyId(data[0].id);
      }
    }
  };

  const searchUsersCharactersInParty = async (user_id: string, party_id: string) => {
    const { data, error } = await supabase
      .from('characters')
      .select('id')
      .eq('party_id', party_id)
      .eq('clerk_user_id', user_id);
    if (error) {
      console.log(error);
    } else {
      if (data && data.length > 0) {
        setHasCharacterInParty(true);
      }
    }
  };

  useEffect(() => {
    (async () => {
      await getRoomsUsersArr(partyName);
      await getPartyIdFromName(partyName);
      if (partyId) {
        await searchUsersCharactersInParty(user_id, partyId);
      }
    })();
  }, [partyName, partyId]);

  return (
    <div className='h-[94vh]'>
      {userInParty && hasCharacterInParty ? (
        <div className="bg-neutral m-2 rounded-2xl h-1/2 w-1/2 mx-auto">
          <Tldraw />
          <p className='font-accent'>character locked in, waiting on DM to finish setup</p>
        </div>
      ) : userInParty ? (
        <div> Prompt for character selection and if not then invite user to create a character</div>
      ) : (
        <div> Waiting for DM's approval </div>
      )}
    </div>
  );
};
