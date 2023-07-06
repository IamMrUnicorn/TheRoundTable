import { pool } from '../config/pool';
import { Request, Response } from 'express';

export const getCharacters = async (req: Request, res: Response) => {
  const username = req.params.username;
  try {
    const query = `SELECT * 
            FROM users 
            JOIN characters ON users.id = characters.user_id
            JOIN character_stats ON characters.id = character_stats.character_id
            JOIN character_proficiency ON characters.id = character_proficiency.character_id
            JOIN character_inventory ON characters.id = character_inventory.character_id
            WHERE users.username = $1;`;

    const { rows } = await pool.query(query, [username]);

    res.json(rows);
  } catch (error) {
    console.error('Failed to fetch data from the database:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const importCharacters = async (req: Request, res: Response) => {
  const characterData = req.body;
  try {
    // TODO: implement the character import logic here

    res.json('got your character, working on adding to database');
  } catch (error) {
    console.error('Failed to import character:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
