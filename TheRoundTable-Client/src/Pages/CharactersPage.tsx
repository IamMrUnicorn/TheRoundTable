import { useEffect, useContext, useState, useRef } from "react";
import { supabaseContext } from "../Utils/supabase";
import { CharacterSheet, characterDataI } from "../Components/CharacterSheet";
import { LoadingPage } from "./Index";
import { getAllCharacterIdsByUser, getCharacterById, insertIntoSupabase } from '../Utils/SupabaseFns'

const CharactersPage = () => {
  const supabase = useContext(supabaseContext)
  const [isButtonDisabled, setButtonDisabled] = useState(false);
  const [isLoading, setIsloading] = useState(false)
  const [counter, setCounter] = useState(0)
  const [userId, setuserId] = useState<number | null>(null)
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

  const getUserId = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .single()
      if (error) throw error
      setuserId(data.id)
    } catch (error) {
      console.log(error)
    }
  }


  useEffect(() => {
    const fetchAllCharacters = async () => {
      setIsloading(true)
      await getUserId()
      const characterIds = await getAllCharacterIdsByUser(userId);
      setIsloading(false)
      if (characterIds) {

        const characterDetailsPromises = characterIds.map((id) => getCharacterById(id));
        const characterDetails = await Promise.all(characterDetailsPromises);

        setCharacters(characterDetails.filter((character): character is characterDataI => character !== null));
      }
    };

    fetchAllCharacters();
  }, [counter, userId]);

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

    const DBsubmission = {
      'character': {
        creator_id: userId,
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
        locked: false,
        proficiencies: [],
        class_abilities: []
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
        cantrips: [],
        lvl1: [],
        lvl2: [],
        lvl3: [],
        lvl4: [],
        lvl5: [],
        lvl6: [],
        lvl7: [],
        lvl8: [],
        lvl9: [],
        heavyW: [],
        lightW: [],
        reachW: [],
        rangedW: [],
        thrownW: [],
        loadingW: [],
        finesseW: [],
        specialW: [],
        versatileW: [],
        twohandedW: [],
        magicalW: [],
        copper: 0,
        silver: 0,
        gold: 0,
        platinum: 0,
        stash: []
      },
    }

    try {
      const insertCharacter = await insertIntoSupabase('characters', DBsubmission.character);
      const characterId = insertCharacter.data[0].id;

      DBsubmission.stats.character_id = characterId;
      DBsubmission.proficiency.character_id = characterId;
      DBsubmission.inventory.character_id = characterId;

      await insertIntoSupabase('character_stats', DBsubmission.stats);
      await insertIntoSupabase('character_proficiency', DBsubmission.proficiency);
      await insertIntoSupabase('character_inventory', DBsubmission.inventory);

      setCounter(prev => prev + 1);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => {
        setButtonDisabled(false);
      }, 5000);
    }
  };

  const updateCharacter = (id: number, newCharData: characterDataI) => {
    console.log(id, characters);
    setCharacters(prev => {
      return prev.map(character => {
        if (character.id === id) {
          return newCharData;
        }
        return character;
      });
    });
  };


  if (isLoading) {
    return <LoadingPage />
  }

  return (
    <div className="flex flex-col items-center justify-center ">
      <button 
        className="btn btn-primary btn-xl font-accent capitalize m-5" 
        onClick={createNpc} 
        disabled={isButtonDisabled} 
      >
        add a new character
      </button>
      <div>
        {characters?.map((chracter, index) => (
          <CharacterSheet
            key={chracter.id}
            ref={index === 0 ? topCharacterRef : (index === characters.length - 1 ? newCharacterRef : null)}
            characterData={chracter}
            characterIndex={index}
            onDelete={removeCharacterById}
            onChange={updateCharacter}
          />
        ))}

        <button
          className='fixed right-0 bottom-0  btn btn-primary btn-circle m-5 p-2'
          onClick={() => topCharacterRef.current?.scrollIntoView({ behavior: 'smooth' })}
        >
          Scroll to Top
        </button>
      </div>

    </div>
  )
}

export default CharactersPage
