import { useEffect, useContext, useState } from "react";
import { supabaseContext } from "../supabase";
import { CharacterSheet, characterDataI } from "../Components/CharacterSheet";
import { CharacterPageProps } from "./CharacterImportPage";


const CharactersPage = ({ user_id }: CharacterPageProps) => {
  const supabase = useContext(supabaseContext)
  const [characters, setCharacters] = useState<characterDataI[] | null>(null)
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
        const transformedCharacters = await Promise.all(characterDataI.map(async (character: any): Promise<characterDataI> => {
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

          return character as characterDataI;
        }));

        setCharacters(transformedCharacters);
      } catch (error) {
        console.log(error);
        return null;
      }
    };
    getCharacterData(user_id)
  }, [])

  const removeCharacterById = (id: number) => {
    setCharacters(prev => prev ? prev.filter(character => character.id !== id) : null);
};


  const createNpc = async () => {
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
        name: 'joe mama',
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
      console.log(data[0])
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
          }
        }
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center ">
      <button onClick={createNpc} className="btn btn-primary btn-xl font-accent capitalize" >add a new character</button>
      {characters?.map((chracter, index) => (
        <CharacterSheet key={index} characterData={chracter} onDelete={removeCharacterById} />
      ))}
    </div>
  )
}

export default CharactersPage
