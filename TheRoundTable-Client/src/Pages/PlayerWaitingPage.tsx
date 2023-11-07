import { Tldraw } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import { useEffect, useState } from 'react';

export interface waitingPageI {
  user_id: string;
  partyName: string;
}

export const PlayerWaitingPage = ({character_id}: {character_id:number | undefined}) => {
  const [userInParty, setUserInParty] = useState<boolean>(false);
  const [hasCharacterInParty, setHasCharacterInParty] = useState<boolean>(false);

  useEffect(()=>{
    if (character_id) {
      setHasCharacterInParty(true)
      setUserInParty(true)
    } 
  })
  return (
    <div className='h-[94vh]'>
      {userInParty && hasCharacterInParty ? (
        <div className="bg-neutral m-2 rounded-2xl h-1/2 w-1/2 mx-auto">
          <Tldraw />
          <p className='font-accent'>waiting on DM to finish setup</p>
        </div>
      ) : userInParty ? (
        <div> Prompt for character selection and if not then invite user to create a character</div>
      ) : (
        <div> Waiting for DM's approval </div>
      )}
    </div>
  );
};
