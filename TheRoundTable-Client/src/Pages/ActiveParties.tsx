import { useEffect, useContext, useState } from "react"
import { supabaseContext } from "../supabase";



const PartyModule = ({ partyName, partyStatus }) => (
  <div className="flex flex-row justify-between p-5 bg-primary font-primary rounded-3xl">
    <div>
      <p className="text-3xl capitalize">{partyName}</p>
      <span className="p-5 capitalize">status: {partyStatus ? 'ready' : 'not ready'}</span>
    </div>
    <div>
      <a href={`/rooms/${partyName}`} className="btn btn-secondary capitalize font-accent"> go to room</a>
    </div>
  </div>
)

export const ActiveParties = ({ user_id }: { user_id: string }) => {

  const supabase = useContext(supabaseContext)
  const [parties, setParties] = useState([])

  const getRoomIds = async () => {
    let { data, error } = await supabase
      .from('characters')
      .select('party_id, name')
      .eq('clerk_user_id', user_id)

    if (error) {
      console.log(error);
      return null;
    } else {
      console.log(data)
      const filteredData = data?.filter((dbEntry: { party_id: string, name: string }) => dbEntry.party_id !== null);
      console.log(filteredData);
      return filteredData;
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
      console.log(data);
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
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col m-5">
      {parties.map((dog, index) => (
        <PartyModule partyName={dog.name} partyStatus={dog.setup} key={index} />
      ))}
    </div>
  )
}