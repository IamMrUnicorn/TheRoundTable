import { supabase } from "./supabase";
import { characterDataI } from "../Components/CharacterSheet";



export const getAllCharacterIdsByUser = async (userId: number | null): Promise<number[] | null> => {
  try {
    if (userId === null) return null
    const { data: characters, error } = await supabase
      .from('characters')
      .select('id')
      .eq('creator_id', userId);

    if (error || !characters) throw error;
    return characters.map((character) => character.id);
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getAllCharacterIdsByPartyId = async (partyId:number) => {
  try {
    const {data: partyMembers, error} = await supabase
    .from('party_members')
    .select('character_id')
    .eq('party_id',partyId)
    if (error) throw error
    if (!partyMembers) return null
    return partyMembers.map((pm) => pm.character_id);
  } catch (error) {
    console.log(error)
  }
}

export const getCharacterById = async (characterID: number): Promise<characterDataI | null> => {
  try {
    const { data: characterData, error } = await supabase
      .from('characters')
      .select(`
        *,
        character_stats:character_stats (*),
        character_proficiency:character_proficiency (*),
        character_inventory:character_inventory (*)
      `)
      .eq('id', characterID)
      .single();

    if (error || !characterData) throw error;
    // console.log(characterData)
    // todo more transformations go here
    characterData.languages = JSON.parse(characterData.languages)
    characterData.race = JSON.parse(characterData.race);
    characterData.class = JSON.parse(characterData.class);
    characterData.subclass = JSON.parse(characterData.subclass);
    characterData.proficiencies = JSON.parse(characterData.proficiencies);
    characterData.character_stats.feats = JSON.parse(characterData.character_stats.feats);

    return characterData;
  } catch (error) {
    console.error(error);
    return null;
  }
};