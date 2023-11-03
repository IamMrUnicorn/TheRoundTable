import { useContext, useEffect, useState } from 'react'
import { supabaseContext } from '../utils/supabase';
import { LoadingPage } from './LoadingPage';
import DMPage from './DMPage';
import PlayerPage from './PlayerPage';


export interface Character {
  clerk_user_id: string;
  alignment: string;
  background: string;
  character_inventory: {
    character_id: number;
    spells: {
      cantrips: string[];
      lvl1: string[];
      lvl2: string[];
      lvl3: string[];
      lvl4: string[];
      lvl5: string[];
      lvl6: string[];
      lvl7: string[];
      lvl8: string[];
      lvl9: string[];
    };
    weapons: {
      heavy: string[];
      light: string[];
      reach: string[];
      range: string[];
      thrown: string[];
      loading: string[];
      finesse: string[];
      special: string[];
      versatile: string[];
      twoHanded: string[];
      magicalWeapons: string[];
    };
    inventory: {
      copper: number;
      silver: number;
      gold: number;
      platinum: number;
      inventory: string[];
    };
  };
  character_proficiency: {
    strength: boolean;
    dexterity: boolean;
    constitution: boolean;
    intelligence: boolean;
    wisdom: boolean;
    charisma: boolean;
    athletics: boolean;
    acrobatics: boolean;
    sleightOfHand: boolean;
    intimidation: boolean;
    performance: boolean;
    investigation: boolean;
    animalHandling: boolean;
    nature: boolean;
    religion: boolean;
    history: boolean;
    insight: boolean;
    medicine: boolean;
    perception: boolean;
    survival: boolean;
    deception: boolean;
    stealth: boolean;
    arcana: boolean;
    persuasion: boolean;
  };
  character_stats: {
    ac: number;
    charisma: number;
    constitution: number;
    currenthp: number;
    dexterity: number;
    feats: string[];
    initiative: number
    intelligence: number
    maxhp: number
    proficiency: number
    speed: number
    spell_dc: number
    status: string;
    strength: number;
    wisdom: number
  };
  class: string[];
  hitdice: string;
  id: number;
  image_url: string | null;
  languages: string[];
  level: number;
  name: string;
  proficiencies: string[];
  race: string[];
  subclass: string[];
}



export const GamePage = ({ user_id }: { user_id: string }) => {

  const supabase = useContext(supabaseContext)
  const [usersCharacter, setUsersCharacter] = useState<Character | null>(null)
  const [characters, setCharacters] = useState<Character[] | null>(null)
  const [userisDM, setUserisDM] = useState<boolean | null>(null);


  const isUserTheDm = async (partyName: string) => {
    let { data, error } = await supabase
      .from('parties')
      .select('DM_clerk_id')
      .eq('name', partyName)
    if (error) {
      console.log(error)
    } else {
      console.log(user_id, data![0].DM_clerk_id)
      setUserisDM(user_id === data![0].DM_clerk_id ? true : false)
    }
  }

  const getCharactersFromPartyId = async (partyId: number) => {
    try {
      let { data: Character, error } = await supabase
        .from('characters')
        .select(`
          id,
          clerk_user_id,
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
        .eq('party_id', partyId)

      if (error || !Character) throw error;
      const transformedCharacters = await Promise.all(Character.map(async (character: any): Promise<Character> => {

        character.character_stats = character.character_stats[0];
        delete character.character_stats.id;
        delete character.character_stats.character_id;
        delete character.character_proficiency.character_id;

        character.race = JSON.parse(character.race)
        character.class = JSON.parse(character.class)
        character.subclass = JSON.parse(character.subclass)
        character.languages = JSON.parse(character.languages)
        character.proficiencies = JSON.parse(character.proficiencies)
        character.character_stats.feats = JSON.parse(character.character_stats.feats);

        ['spells', 'weapons', 'inventory'].forEach(key => {
          character.character_inventory[key] = JSON.parse(character.character_inventory[key]);
        });

        return character as Character;
      }));

      setCharacters(transformedCharacters);
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const getRoomIdFromName = async (partyName: string) => {
    try {
      let { data, error } = await supabase
        .from('parties')
        .select('id')
        .eq('name', partyName)
        .single();

      if (error || !data) throw error;

      return data.id;
    } catch (error) {
      console.error(error);
      return null; // Return null or handle the error as needed
    }
  };

  const getRoomStatus = async (partyName : string) => {
    let { data, error } = await supabase
      .from('parties')
      .select('setup')
      .eq('name', partyName)
    if (error) {
      console.log(error)
    } else {
      if (data![0].setup === false) {
        window.location.href = `/waiting-room/${partyName}`
      }
    }
  }


  
  useEffect(() => {
    
    let partyNameInUrl = decodeURIComponent(window.location.pathname.slice(7));
    getRoomStatus(partyNameInUrl)
    
    isUserTheDm(partyNameInUrl)
    getRoomIdFromName(partyNameInUrl)
      .then(roomId => {
        getCharactersFromPartyId(roomId);
      })
      .catch(error => {
        console.error('An error occurred:', error);
      });

    const findUsersCharacterFromParty = (characters: Character[] | null) => {
      if (!characters) return
      const thisUsersCharacter = characters.filter((character) => (character.clerk_user_id === user_id))
      setUsersCharacter(thisUsersCharacter[0])
    }

    findUsersCharacterFromParty(characters)
  }, [])

  console.log(characters)


  if (userisDM === true) {
    return <DMPage party={characters} />
  } else if (userisDM === false) {
    return <PlayerPage party={characters} usersCharacter={usersCharacter}/>
  } else {
    return <LoadingPage />
  }
}
