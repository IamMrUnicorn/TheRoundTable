import { useEffect, useContext, useState } from "react"
import { supabase, supabaseContext } from "../Utils/supabase";
import { LoadingPage } from "./LoadingPage";



const PartyModule = ({ partyId, partyName, partyStatus }: { partyId:number, partyName: string, partyStatus: boolean }) => {
  const [isLeaving, setIsLeaving] = useState(false)
  const handleLeaveRoom = async () => {
    try {
      const {data, error} = await supabase
      .from('party_members')
      .delete()
      .eq('party_id', partyId)
      if (error) throw error
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div className="flex flex-row justify-between p-5 bg-primary font-primary rounded-3xl">
      <div>
        <p className="text-3xl capitalize underline">{partyName}</p>
        <span className="p-5 font-accent capitalize"> status: {partyStatus ? 'ready' : 'not ready'}</span>
      </div>
      <div>
        <button onClick={()=>setIsLeaving(!isLeaving)} className="btn btn-secondary capitalize font-accent">{isLeaving ? 'are you sure? click to cancel' : 'leave room'}</button>
        {isLeaving && <button onClick={()=>handleLeaveRoom()} className="btn btn-secondary capitalize font-accent"> click to confirm </button>}
        <a href={`/rooms/${partyName}`} className="btn btn-secondary capitalize font-accent"> go to room</a>
      </div>
    </div>
  )
}


export const ActiveParties = () => {
  type Party = {
    id: number;
    name: string;
    setup: boolean;
  };

  const supabase = useContext(supabaseContext);
  const [loading, setLoading] = useState(true);
  const [playerParties, setPlayerParties] = useState<Party[]>([]);
  const [dmParties, setDmParties] = useState<Party[]>([]);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let { data: userData } = await supabase.auth.getUser();
        let userID = userData.user.id;

        let { data, error } = await supabase
          .from('users')
          .select(`
            id,
            party_members (
              is_dm,
              party:parties (id, name, setup)
            )
          `)
          .eq('user_id', userID)

        if (error) throw error;
        if (!data || data.length === 0) throw new Error('No data received');

        const partyMemberData = data.flatMap(u => u.party_members) ;
        const playerPartiesData: Party[] = partyMemberData
          .filter(p => !p.is_dm)
          .map(p => p.party)
          .flat();
        
          const dmPartiesData: Party[] = partyMemberData
          .filter(p => p.is_dm)
          .map(p => p.party)
          .flat(); 

        setPlayerParties(playerPartiesData);
        setDmParties(dmPartiesData);
      } catch (e) {
        setError('Failed to fetch data');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex flex-row m-5">
      <div className="flex flex-col gap-2 m-5 w-1/2">
        <h2 className="text-2xl mt-5 mb-3 font-accent">Rooms you play in:</h2>
        {playerParties.map((party) => (
          <PartyModule partyName={party.name} partyStatus={party.setup} partyId={party.id} key={party.id} />
        ))}
      </div>
      <div className="flex flex-col gap-2 m-5 w-1/2">
        <h2 className="text-2xl mt-5 mb-3 font-accent">Rooms you DM:</h2>
        {dmParties.map((party) => (
          <PartyModule partyName={party.name} partyStatus={party.setup} partyId={party.id} key={party.id} />
        ))}
      </div>
    </div>
  );
};