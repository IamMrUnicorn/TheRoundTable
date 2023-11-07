import { useState, useEffect, useContext, useMemo, useRef } from "react"

import { LoadingPage } from "../Pages/LoadingPage"
import { supabaseContext } from "../Utils/supabase"
import Fuse from 'fuse.js';

export const DMScreen = () => {


  const supabase = useContext(supabaseContext)


  const StatBlock = () => {
    const [characterData, setCharacterData] = useState()

    const QuickViewCharacter = ({ name, level, hp, ac, perception }) => {
      return (
        <div className="col-span-2 row-span-5 bg-purple-200">
          {name} {level} {hp} {ac} {perception}
        </div>
      )
    }
    if (characterData) (
      <QuickViewCharacter name={characterData.name} level={characterData.level} hp={characterData.hp} ac={characterData.ac} perception={characterData.perception} />
    );
    return (
      <div className="col-span-2 row-span-5 text-black bg-purple-200 flex items-center justify-center border">
        <p className="font-accent btn capitalize">select a character to watch</p>
      </div>
    )
  }

  const Conditions = () => {

    return (
      <div className="col-span-10 row-span-5 bg-gray-200 flex items-center justify-center border">8</div>
    )
  }


  const SpellInfo = () => {

    return (
      <div className="col-span-10 row-span-5 bg-green-200 flex items-center border">
        <div className="flex flex-col">
          <div className="flex flex-row items-baseline">
            <div className=" p-2">
              <img className="pt-5" src="/SpellLine.svg" />
              <p className="text-xl pt-5 font-primary capitalize text-black">line</p>
            </div>
            <div className=" p-2">
              <img src="/SpellCube.svg" />
              <p className="text-xl font-primary capitalize text-black">cube</p>
            </div>
            <div className=" p-2">
              <img src="/SpellCone.svg" />
              <p className="text-xl font-primary capitalize text-black">cone</p>
            </div>
            <div className=" p-2">
              <img src="/SpellCylinder.svg" />
              <p className="text-xl font-primary capitalize text-black">cylinder</p>
            </div>
            <div className=" p-2">
              <img src="/SpellSphere.svg" />
              <p className="text-xl font-primary capitalize text-black">sphere</p>
            </div>
          </div>
          <p className="text-xl pt-5 font-primary capitalize text-black"><i className="fa-solid fa-bahai" /> = point of origin</p>
        </div>


      </div>
    )
  }

  const NoteBlock = () => {
    const [DMNotes, setDMNotes] = useState('')

    useEffect(() => {
      let cloudNotes = localStorage.getItem('DM-notes')
      if (cloudNotes) {
        setDMNotes(cloudNotes)
      }
    }, [])
    return (
      <div className="col-span-5 row-span-5 bg-neutral text-black flex flex-col border">
        <p className="font-accent text-2xl mx-auto p-4">Notes</p>
        <textarea className="resize-none" value={DMNotes} rows={12} onChange={(e) => setDMNotes(e.target.value)} />
        <button onClick={() => localStorage.setItem('DM-notes', DMNotes)} className="btn btn-primary font-accent text-2xl m-2 capitalize">Save Notes</button>
      </div>
    )
  }

  const DClookup = () => {

    type dcItem = {
      id: number,
      ability: string,
      skill: string,
      action: string,
      difficulty: string,
      dc: number,
      description: string
    }

    const [allData, setAllData] = useState<dcItem[] | null>(null);
    const [filteredData, setFilteredData] = useState<dcItem[] | null>(null);
    const [searchPhrase, setSearchPhrase] = useState('');
    const allDataRef = useRef<dcItem[] | null>(null);

    useEffect(() => {
      if (allDataRef.current !== null) return;

      const fetchData = async () => {
        let { data, error } = await supabase.from('ability_checks').select('*');
        if (!error) {
          allDataRef.current = data;
          setAllData(data);
          setFilteredData(data);
        }
      };
      fetchData();
    }, []);

    useEffect(() => {
      filterData(searchPhrase);
    }, [searchPhrase, allData]);

    const options = {
      keys: ['ability', 'skill', 'action'],
      threshold: 0.3
    };
    const fuse = useMemo(() => {
      if (!allData) return null;
      return new Fuse(allData, options);
    }, [allData]);

    const filterData = (query: string) => {
      if (!allData || !fuse) return;
      if (query.trim() === '') {
        setFilteredData(allData);
        return;
      }
      const results = fuse.search(query).map(result => result.item);
      setFilteredData(results);
    };

    const SkillCheckItem = ({ ability, action, skill, difficulty, dc, description }: { ability: string, action: string, skill: string, difficulty: string, dc: number, description: string }) => {

      const AbilityColorMap = {
        strength: 'bg-red-300',
        dexterity: 'bg-orange-300',
        intelligence: 'bg-green-300',
        wisdom: 'bg-blue-300',
        charisma: 'bg-purple-300',
      }


      return (
        <div className={`flex flex-row ${AbilityColorMap[ability]} m-3 p-2 font-accent items-baseline justify-around rounded-3xl `}>
          <div className="flex flex-col w-1/5 p-1">
            <p className="text-sm underline font-primary mx-auto capitalize">ability check</p>
            <p className="text-2xl mx-auto capitalize">{ability}</p>
            <p className="text-sm underline mt-1 font-primary mx-auto capitalize">skill</p>
            <p className="text-xl mx-auto capitalize">{skill}</p>
          </div>
          <div className={`flex flex-col w-1/5 p-2 rounded-full`}>
            <p className="text-sm underline font-primary mx-auto capitalize">difficulty</p>
            <p className="text-2xl mx-auto capitalize">{difficulty ? difficulty : 'none'}</p>
            <p className="whitespace-nowrap mx-auto text-2xl">DC: {dc}</p>
          </div>
          <div className="flex flex-col w-1/5">
            <p className="text-sm underline mx-auto font-primary capitalize">action</p>
            <p className="text-2xl mx-auto capitalize">{action}</p>
          </div>

          <div className="flex flex-col w-2/5  p-4 rounded-full">
            <p className="text-sm underline mx-auto font-primary capitalize">decription</p>
            <p className="text-lg mx-auto">{description}</p>
          </div>
        </div>
      )
    }

    return (
      <div className="col-span-5 row-span-5 bg-neutral text-black flex flex-col border">
        <p className="font-accent text-2xl mx-auto p-4 capitalize">look up an ability/skill DC</p>
        <div className="flex flex-row justify-center m-3">
          <input className="p-1  rounded-lg" type="text" placeholder='"Sleight Of Hand"' onChange={(e) => setSearchPhrase(e.target.value)} value={searchPhrase} />
          <button className="btn btn-sm btn-primary font-accent capitalize p-1 m-1" onClick={() => filterData(searchPhrase)}>search</button>
        </div>
        <div className="max-h-72 overflow-y-scroll">
          {filteredData
            ? filteredData.map((result) => <SkillCheckItem
              key={result.id}
              ability={result.ability}
              action={result.action}
              skill={result.skill}
              difficulty={result.difficulty}
              dc={result.dc}
              description={result.description} />)
            : <LoadingPage height={32} />}
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-10 grid-rows-40  ">
      <NoteBlock />
      <DClookup />

      <StatBlock />
      <StatBlock />
      <StatBlock />
      <StatBlock />
      <StatBlock />

      <Conditions />
      <SpellInfo />
    </div>
  );
}

