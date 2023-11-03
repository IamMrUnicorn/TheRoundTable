import { useEffect, useContext, useState, useRef } from "react";
import { supabaseContext } from "../utils/supabase";
import { CharacterSheet, characterDataI } from "../Components/CharacterSheet";
import { CharacterPageProps } from "./CharacterImportPage";


const CharactersPage = ({ user_id }: CharacterPageProps) => {
  const supabase = useContext(supabaseContext)
  const [isButtonDisabled, setButtonDisabled] = useState(false);
  const [counter, setCounter] = useState(0)
  const [characters, setCharacters] = useState<characterDataI[] | null>(null)
  const topCharacterRef = useRef(null);
  const newCharacterRef = useRef(null);

  const numToFunny = (n: number) => {


    const suffixes = ['th', 'st', 'nd', 'rd'];
    let suffix = suffixes[0]; // default to 'th'

    if (n % 100 < 11 || n % 100 > 13) {
      switch (n % 10) {
        case 1:
          suffix = suffixes[1];
          break;
        case 2:
          suffix = suffixes[2];
          break;
        case 3:
          suffix = suffixes[3];
          break;
      }
    }

    return `the ${n}${suffix}`;
  }


  useEffect(() => {
    const getCharacterData = async (clerk: string) => {
      try {
        const { data: characterDataI, error } = await supabase
          .from('characters')
          .select(`
            id,
            party_id,
            name,
            image_url,
            race,
            class,
            subclass,
            background,
            alignment,
            level,
            hitdice,
            languages,
            proficiencies,
            character_stats:character_stats (
              *
            ),
            character_proficiency:character_proficiency (
              *
            ),
            character_inventory:character_inventory (
              *
            )
          `)
          .eq('clerk_user_id', clerk)

        if (error || !characterDataI) throw error;
        const transformedCharacters: characterDataI[] = await Promise.all(characterDataI.map(async (character: any): Promise<characterDataI> => {
          if (character.party_id) {
            const { data: party } = await supabase
              .from('parties')
              .select('name')
              .eq('id', character.party_id)
              .single();
            character.party_id = party ? party.name : null;
          }

          character.character_stats = character.character_stats[0];
          delete character.character_stats.id;
          delete character.character_stats.character_id;
          character.race = JSON.parse(character.race)
          character.class = JSON.parse(character.class)
          character.subclass = JSON.parse(character.subclass)
          character.languages = JSON.parse(character.languages)
          character.proficiencies = JSON.parse(character.proficiencies)
          character.character_stats.feats = JSON.parse(character.character_stats.feats);
          character.character_stats.class_abilities = JSON.parse(character.character_stats.class_abilities);
          delete character.character_proficiency.character_id;

          ['spells', 'weapons', 'inventory'].forEach(key => {
            character.character_inventory[key] = JSON.parse(character.character_inventory[key]);
          });

          return character as characterDataI;
        }));

        setCharacters(transformedCharacters);
      } catch (error) {
        console.log(error);
        return null;
      }
    };
    getCharacterData(user_id)
  }, [counter])

  useEffect(() => {
    if (newCharacterRef.current) {
      newCharacterRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [characters]);

  const removeCharacterById = (id: number) => {
    setCharacters(prev => prev ? prev.filter(character => character.id !== id) : null);
  };


  const createNpc = async () => {
    setButtonDisabled(true);
    const inventory = JSON.stringify({
      copper: 0,
      silver: 0,
      gold: 0,
      platinum: 0,
      inventory: []
    })
    const spells = JSON.stringify({
      cantrips: ['light', 'mending'],
      lvl1: ['healing word'],
      lvl2: [],
      lvl3: [],
      lvl4: [],
      lvl5: [],
      lvl6: [],
      lvl7: [],
      lvl8: [],
      lvl9: [],
    })
    const weapons = JSON.stringify({
      heavy: ['hammer'],
      light: ['cardboard sword'],
      reach: [],
      range: [],
      thrown: [],
      loading: [],
      finesse: [],
      special: [],
      versatile: [],
      twoHanded: [],
      magicalWeapons: []
    })

    const DBsubmission = {
      'character': {
        clerk_user_id: user_id,
        party_id: null,
        name: `Joeseph Joema The ${numToFunny(counter)}`,
        image_url: null,
        race: ['npc'],
        class: ['npc'],
        subclass: ['npc'],
        background: 'npc',
        alignment: 'neutral neutral',
        level: 1,
        hitdice: '1 d4',
        languages: ['common'],
        proficiencies: []
      },
      'stats': {
        character_id: '',
        status: 'healthy',
        currenthp: 25,
        maxhp: 25,
        ac: 5,
        proficiency: 1,
        initiative: 1,
        speed: 25,
        strength: 5,
        dexterity: 5,
        constitution: 5,
        intelligence: 5,
        wisdom: 5,
        charisma: 5,
        spell_dc: 5,
        feats: [],
      },
      'proficiency': {
        character_id: '',
        strength: false,
        dexterity: false,
        constitution: false,
        intelligence: true,
        wisdom: true,
        charisma: true,
        athletics: false,
        acrobatics: false,
        sleightofhand: false,
        stealth: false,
        arcana: false,
        history: false,
        investigation: false,
        nature: false,
        religion: true,
        animalhandling: true,
        insight: false,
        medicine: false,
        perception: false,
        survival: false,
        deception: false,
        intimidation: false,
        performance: true,
        persuasion: false,
      },
      'inventory': {
        character_id: '',
        spells: spells,
        weapons: weapons,
        inventory: inventory
      },
    }


    const { data, error } = await supabase
      .from('characters')
      .insert(DBsubmission.character)
      .select();
    if (error) {
      console.log(error)
    } else {
      const characterId = data[0].id;
      DBsubmission.stats.character_id = characterId;
      DBsubmission.proficiency.character_id = characterId;
      DBsubmission.inventory.character_id = characterId;
      const { error } = await supabase
        .from('character_stats')
        .insert(DBsubmission.stats);
      if (error) {
        console.log(error)
      } else {
        const { error } = await supabase
          .from('character_proficiency')
          .insert(DBsubmission.proficiency);
        if (error) {
          console.log(error)
        } else {
          const { error } = await supabase
            .from('character_inventory')
            .insert(DBsubmission.inventory)
          if (error) {
            console.log(error)
          } else {
            setTimeout(() => {
              setButtonDisabled(false);
            }, 5000);
            setCounter((prev) => prev += 1)
          }
        }
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center ">
      <button onClick={createNpc} disabled={isButtonDisabled} className="btn btn-primary btn-xl font-accent capitalize m-5" >add a new character</button>
      <div>
        {characters?.map((chracter, index) => (
          <CharacterSheet key={chracter.id} ref={index === 0 ? topCharacterRef : (index === characters.length - 1 ? newCharacterRef : null)} characterData={chracter} onDelete={removeCharacterById} />
        ))}
        <button className='fixed right-0 bottom-0  btn btn-primary btn-circle m-5 p-2' onClick={() => topCharacterRef.current?.scrollIntoView({ behavior: 'smooth' })}> Scroll to Top </button>
      </div>

    </div>
  )
}

export default CharactersPage
