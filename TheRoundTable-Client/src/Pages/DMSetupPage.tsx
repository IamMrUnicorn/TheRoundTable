import { PartyMember } from "./GamePage";
import { DMScreen } from "../Components/DMScreen";


export const DMSetupPage = ({partyMembers}: {partyMembers: PartyMember[]}) => {

  return (
    <div className="m-10">
      <div>
        {partyMembers.map((partyMember) => {
          return <h1>{partyMember.user_id} : {partyMember.character_id === null ? 'No Character' : partyMember.character_id}</h1>;
        })}
        
        <h1 className="text-xl font-primary">
          edit your dm screen if youd like or get your notes ready, once you're all set click the button
        </h1>
        <button className="btn btn-primary capitalize font-accent text-2xl" >Ready to play</button>
      </div>
      <DMScreen />
    </div>
  );
};
