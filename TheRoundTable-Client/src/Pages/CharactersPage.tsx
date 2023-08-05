import { useEffect, useContext, useState } from "react";
import { supabaseContext } from "../supabase";
import { CharacterSheet } from "../Components/CharacterSheet";

interface CharacterPageProps {
  user_id: string;
}

export interface CharacterDataInterface {
  name: string;
  image_url: string | null;
  race: string;
  class: string;
  subclass: string;
  level: number;
  background: string;
  alignment: string;
  languages: string[];
  proficincies: string[];
  character_stats: {
    status: string;
    currenthp: number;
    maxhp: number;
    ac: number,
    proficiency: number,
    initiative: number,
    speed: number,
    strength: number,
    dexterity: number,
    constitution: number,
    intelligence: number,
    wisdom: number,
    charisma: number,
    spell_dc: number,
    feats: string[]; 
  };
  character_proficiency: {
    strength: boolean,
    dexterity: boolean,
    constitution: boolean,
    intelligence: boolean,
    wisdom: boolean,
    charisma: boolean,
    athletics: boolean,
    acrobatics: boolean,
    sleightofhand: boolean,
    stealth: boolean,
    arcana: boolean,
    history: boolean,
    investigation: boolean,
    nature: boolean,
    religion: boolean,
    animalhandling: boolean,
    insight: boolean,
    medicine: boolean,
    perception: boolean,
    survival: boolean,
    deception: boolean,
    intimidation: boolean,
    performance: boolean,
    persuasion: boolean
  };
  character_inventory: {
    spells: { 
      cantrips: string[], 
      lvl1: string[], 
      lvl2: string[], 
      lvl3: string[], 
      lvl4: string[], 
      lvl5: string[], 
      lvl6: string[], 
      lvl7: string[], 
      lvl8: string[], 
      lvl9: string[] 
    },
    weapons: {
      heavy: string[],
      light: string[],
      reach: string[],
      range: string[],
      thrown: string[],
      loading: string[],
      finesse: string[],
      special: string[],
      versatile: string[],
      twoHanded: string[],
      magicalWeapons: string[]
    },
    inventory: { 
      copper: 0, 
      silver: 0, 
      gold: 0, 
      platinum: 0, 
      inventory: string[] 
    }
  };
}



const CharactersPage = ({user_id}:CharacterPageProps) => {
  const supabase = useContext(supabaseContext)
  const [characters, setCharacters] = useState<CharacterDataInterface[] | null>(null) 
  useEffect(() => {
    const getCharacterData = async (clerk: string) => {
      try {
        const { data: CharacterDataInterface, error } = await supabase
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
    
        if (error || !CharacterDataInterface) throw error;
        const transformedCharacters = await Promise.all(CharacterDataInterface.map(async (character: any): Promise<CharacterDataInterface> => {
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
          delete character.character_proficiency.character_id;

          ['spells', 'weapons', 'inventory'].forEach(key => {
            character.character_inventory[key] = JSON.parse(character.character_inventory[key]);
          });

          return character as CharacterDataInterface;
        }));

        setCharacters(transformedCharacters);
      } catch (error) {
        console.log(error);
        return null;
      }
    };
    getCharacterData(user_id)
  }, [])

  console.log(characters)

  return (
    <div className="flex flex-col items-center justify-center "> 
      {characters?.map((chracter, index) => (
        <CharacterSheet key={index} characterData={chracter}/>
      ))}
    </div>
  )
}

export default CharactersPage
