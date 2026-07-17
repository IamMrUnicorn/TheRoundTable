import { supabase } from "./supabase";
import { characterDataI } from "../Components/CharacterSheet";
import { PartyMember } from "../Pages/GamePage";



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

export const getAllCharacterIdsByPartyId = async (partyId: number) => {
  try {
    const { data: partyMembers, error } = await supabase
      .from('party_members')
      .select('character_id, user_id')
      .eq('party_id', partyId)
      .is('is_dm', false);
    if (error) throw error
    if (!partyMembers) return []
    return partyMembers as PartyMember[];
  } catch (error) {
    console.log(error)
  }
}

export const insertIntoSupabase = async (tableName: string, data: any) => {
  const response = await supabase.from(tableName).insert(data).select();
  if (response.error) throw response.error;
  return response;
};

export const updateInSupabase = async (tableName: string, newValues: any, matchCondition: any) => {
  const { data, error } = await supabase
    .from(tableName)
    .update(newValues)
    .match(matchCondition);

  if (error) throw error;
  return data;
};

export const bulkUpdateCharacterData = async (characterId: number, characterData: any) => {
  try {
    // Update the main character table
    await updateInSupabase('characters', characterData.character, { id: characterId });

    // Update related tables
    await updateInSupabase('character_stats', characterData.stats, { character_id: characterId });
    await updateInSupabase('character_proficiency', characterData.proficiency, { character_id: characterId });
    await updateInSupabase('character_inventory', characterData.inventory, { character_id: characterId });

    console.log('All updates successful');
  } catch (error) {
    console.error('Error in bulk update:', error);
  }
}


export const getCharacterById = async (characterID: number): Promise<characterDataI | null> => {
  try {
    const { data: characterDataI, error } = await supabase
      .from('characters')
      .select(`
        *,
        character_stats:character_stats (*),
        character_proficiency:character_proficiency (*),
        character_inventory:character_inventory (*)
      `)
      .eq('id', characterID)
      .single();

    if (error || !characterDataI) throw error;
    // console.log(characterDataI)
    // todo more transformations go here
    characterDataI.languages = JSON.parse(characterDataI.languages)
    characterDataI.race = JSON.parse(characterDataI.race);
    characterDataI.class = JSON.parse(characterDataI.class);
    characterDataI.subclass = JSON.parse(characterDataI.subclass);
    characterDataI.proficiencies = JSON.parse(characterDataI.proficiencies);
    characterDataI.character_stats.feats = JSON.parse(characterDataI.character_stats.feats);

    return characterDataI;
  } catch (error) {
    console.error(error);
    return null;
  }
};