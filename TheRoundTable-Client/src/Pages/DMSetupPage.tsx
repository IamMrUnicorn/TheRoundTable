import { CharacterPageProps } from "./CharacterImportPage"


export const DMSetupPage = ({user_id}:CharacterPageProps) => {

//       {/* setup DM screen, provide info blocks that DM can rearrange at will */}
//       {/* include section for player stats */}

  return (
    <div className="grid grid-cols-10 grid-rows-6 gap-x-1 gap-y-1 ">
      <div className="col-span-6 row-span-2 bg-red-200 flex items-center justify-center border">1</div>
      <div className="col-span-4 row-span-2 bg-blue-200 flex items-center justify-center border">2</div>
      <div className="col-span-2 row-span-2 bg-green-200 flex items-center justify-center border">3</div>
      <div className="col-span-2 row-span-2 bg-yellow-200 flex items-center justify-center border">4</div>
      <div className="col-span-2 row-span-2 bg-purple-200 flex items-center justify-center border">5</div>
      <div className="col-span-2 row-span-2 bg-indigo-200 flex items-center justify-center border">6</div>
      <div className="col-span-2 row-span-2 bg-pink-200 flex items-center justify-center border">7</div>
      <div className="col-span-10 row-span-1 bg-gray-200 flex items-center justify-center border">8</div>
      <div className="col-span-10 row-span-1 bg-gray-300 flex items-center justify-center border">9</div>
    </div>
  );
}

// random npc name generator, (race, count)
// include an option in the output to save a name as an npc, click on name -> popup to include details of the moment
// details like name and race will be auto filled in but user can edit / tweak the name if needed and then they can include details like their alignment or a backstory as to how the players met this npc, 

// areas 3-7 can be used to have a quick view of a character or npc or monster's stats

// 