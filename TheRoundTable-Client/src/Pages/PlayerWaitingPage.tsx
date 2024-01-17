import React from 'react';
import { Link } from 'react-router-dom'; // Assuming you're using react-router for navigation

export interface PlayerWaitingPageProps {
  userInParty: boolean;
  hasCharacter: boolean;
  onCharacterSelect?: () => void; // Optional callback for character selection
}

export const PlayerWaitingPage: React.FC<PlayerWaitingPageProps> = ({ userInParty, hasCharacter, onCharacterSelect }) => {
  
  const renderContent = () => {
    if (userInParty && hasCharacter) {
      // User has a character and is waiting for the DM
      return (
        <div className="bg-neutral m-2 rounded-2xl h-1/2 w-1/2 mx-auto">
          <p className='font-accent'>Waiting for the DM to finish setup. Please be patient.</p>
        </div>
      );
    } else if (userInParty) {
      // User is in the party but needs to select or create a character
      return (
        <div>
          <p>You're part of the party but don't have a character yet.</p>
          <button onClick={onCharacterSelect} className="btn">Select a Character</button>
          <p>or</p>
          <Link to="/characters" className="btn">Create a New Character</Link>
        </div>
      );
    } else {
      // User is not in the party and is waiting for approval
      return (
        <div>
          <p>You are waiting for the DM's approval to join the party.</p>
          <p>Please wait or contact the DM for more information.</p>
        </div>
      );
    }
  };

  return (
    <div className='h-[94vh]'>
      {renderContent()}
    </div>
  );
};
