import { useEffect, useContext, useState } from "react"
import { supabaseContext } from "../supabase";
import { LoadingPage } from "./LoadingPage";



const PartyModule = ({ partyName, partyStatus }: { partyName: string, partyStatus: boolean }) => (
  <div className="flex flex-row justify-between p-5 bg-primary font-primary rounded-3xl">
    <div>
      <p className="text-3xl capitalize underline">{partyName}</p>
      <span className="p-5 font-accent capitalize"> status: {partyStatus ? 'ready' : 'not ready'}</span>
    </div>
    <div>
      <a href={`/rooms/${partyName}`} className="btn btn-secondary capitalize font-accent"> go to room</a>
    </div>
  </div>
)


export const ActiveParties = ({ user_id }: { user_id: string }) => {
  type partiesT = {
    name: string,
    setup: boolean
  }
  const supabase = useContext(supabaseContext)
  const [parties, setParties] = useState<partiesT[] | null>([])
  const [dmParties, setDmParties] = useState<partiesT[] | null>([]);

  const getRoomIds = async () => {
    let { data, error } = await supabase
      .from('characters')
      .select('party_id, name')
      .eq('clerk_user_id', user_id)

    if (error) {
      console.log(error);
      return null;
    } else {
      return data?.filter((dbEntry: { party_id: string, name: string }) => dbEntry.party_id !== null);
    }
  }

  const getPartyInfo = async (id: string) => {
    let { data, error } = await supabase
      .from('parties')
      .select('name, setup')
      .eq('id', id);
    if (error) {
      console.log(error);
      return null; // Return null or some error indication
    } else {
      return data;
    }
  };

  const getDmRooms = async () => {
    let { data, error } = await supabase
      .from('parties')
      .select('name, setup')
      .eq('DM_clerk_id', user_id);

    if (error) {
      console.log(error);
      return null;
    } else {
      return data;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      let roomsWithChar = await getRoomIds();
      if (!roomsWithChar) return; // Exit if there's no data or an error occurred

      const promises = roomsWithChar.map(async (room) => {
        return await getPartyInfo(room.party_id);
      });

      const allParties = await Promise.all(promises);
      setParties(allParties[0]);

      const dmRoomsData = await getDmRooms();
      if (dmRoomsData) {
        setDmParties(dmRoomsData);
      }
    };

    fetchData();
  }, []);

  if (!parties || !dmParties) {
    return <LoadingPage />
  }

  return (
    <div className="flex flex-row m-5 ">
      <div className="flex flex-col m-5 w-1/2 ">
        <h2 className="text-2xl mt-5 mb-3 font-accent">Rooms you play in:</h2>
        {parties.map((party, index) => (
          <PartyModule partyName={party.name} partyStatus={party.setup} key={index} />
        ))}
      </div>
      <div className="flex flex-col m-5 w-1/2 ">
        <h2 className="text-2xl mt-5 mb-3 font-accent">Rooms you DM:</h2>
        {dmParties.map((party, index) => (
          <PartyModule partyName={party.name} partyStatus={party.setup} key={index} />
        ))}
      </div>
    </div>
  );

}