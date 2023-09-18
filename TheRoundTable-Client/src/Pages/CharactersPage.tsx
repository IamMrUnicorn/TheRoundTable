import { useEffect, useContext, useState } from "react";
import { supabaseContext } from "../supabase";
import { CharacterSheet, characterDataI } from "../Components/CharacterSheet";
import { CharacterPageProps } from "./CharacterImportPage";


const CharactersPage = ({user_id}:CharacterPageProps) => {
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


  return (
    <div className="flex flex-col items-center justify-center "> 
      {characters?.map((chracter, index) => (
        <CharacterSheet key={index} characterData={chracter}/>
      ))}
    </div>
  )
}

export default CharactersPage
