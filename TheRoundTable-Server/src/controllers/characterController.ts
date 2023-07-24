import { pool } from '../config/pool';
import { Request, Response } from 'express';

export const getCharacters = async (req: Request, res: Response) => {
  const username = req.params.username;
  try {
    const query = `
      SELECT * 
      FROM users 
      JOIN characters ON users.id = characters.user_id
      JOIN character_stats ON characters.id = character_stats.character_id
      JOIN character_proficiency ON characters.id = character_proficiency.character_id
      JOIN character_inventory ON characters.id = character_inventory.character_id
      WHERE users.username = $1;
    `;

    const { rows } = await pool.query(query, [username]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No characters found for this user. Please create one.' });
    }

    res.json(rows);
  } catch (error) {
    console.error('Failed to fetch data from the database:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


export const importCharacters = async (req: Request, res: Response) => {
  const data = req.body;
  // {
  //   'character': [user_id, null, formData.name, formData.race, formData.class, formData.subclass, formData.level],
  //   'stats': ['healthy', formData.maxHP, formData.maxHP, formData.AC, formData.proficiency, formData.initiative, formData.speed, formData.strength, formData.dexterity, formData.constitution, formData.intelligence, formData.wisdom, formData.charisma, formData.spellDC, JSON.stringify(formData.feats)],
  //   'proficiency': [formData.strengthProficient, formData.dexterityProficient, formData.constitutionProficient, formData.intelligenceProficient, formData.wisdomProficient, formData.charismaProficient, formData.athleticsProficient, formData.acrobaticsProficient, formData.sleightOfHandProficient, formData.stealthProficient, formData.arcanaProficient, formData.historyProficient, formData.investigationProficient, formData.natureProficient, formData.religionProficient, formData.animalHandlingProficient, formData.insightProficient, formData.medicineProficient, formData.perceptionProficient, formData.survivalProficient, formData.deceptionProficient, formData.intimidationProficient, formData.performanceProficient, formData.persuasionProficient],
  //   'inventory': [spells, weapons, inventory],
  // } 
  try {
    // Insert into characters table and get the id of the inserted row
    const res = await pool.query(
      'INSERT INTO characters (user_id, party_id, name, race, class, subclass, level) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      data.character
    );

    const character_id = res.rows[0].id;

    // Insert into character_stats table
    await pool.query(
      'INSERT INTO character_stats (character_id, status, currentHP, maxHP, AC, proficiency, initiative, speed, strength, dexterity, constitution, intelligence, wisdom, charisma, spell_DC) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)',
      [character_id, ...data.stats]
      );

    // Insert into character_proficiency table
    await pool.query(
      'INSERT INTO character_proficiency (character_id, strength, dexterity, constitution, intelligence, wisdom, charisma, athletics, acrobatics, sleightOfHand, stealth, arcana, history, investigation, nature, religion, animalHandling, insight, medicine, perception, survival, deception, intimidation, performance, persuasion) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)',
      [character_id, ...data.proficiency]
      );

    // Insert into character_inventory table
    await pool.query(
      'INSERT INTO character_inventory (character_id, spells, weapons, inventory) VALUES ($1, $2, $3, $4)',
      [character_id, ...data.inventory]
    );

    console.log('Data successfully inserted!');
  } catch (error) {
    console.error('Failed to import character:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } 
}