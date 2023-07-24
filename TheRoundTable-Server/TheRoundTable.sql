-- Drop database if exists
DROP DATABASE IF EXISTS theroundtable;

-- Create database
CREATE DATABASE theroundtable;

-- Use the newly created database
\c theroundtable;


-- Create table users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  clerk_user_id VARCHAR(50),
  email VARCHAR(100),
  username VARCHAR(50),
  is_dungeon_master BOOLEAN
);

-- Create table parties
CREATE TABLE parties (
  id SERIAL PRIMARY KEY,
  name TEXT,
  DM_id TEXT
)

-- Create table characters
CREATE TABLE characters (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users (id),
  party_id INT REFERENCES parties (id),
  name VARCHAR(50),
  image_url VARCHAR(200),
  race VARCHAR(50),
  class VARCHAR(50),
  subclass VARCHAR(50),
  level INT
);

-- Create table character-stats
CREATE TABLE character_stats (
  id SERIAL PRIMARY KEY,
  character_id INT REFERENCES characters (id),
  status VARCHAR(50),
  currentHP INT,
  maxHP INT,
  AC INT,
  proficiency INT,
  initiative INT,
  speed INT,
  strength INT,
  dexterity INT,
  constitution INT,
  intelligence INT,
  wisdom INT,
  charisma INT,
  spell_DC INT,
  feats TEXT
);

-- Create table character-proficiency
CREATE TABLE character_proficiency (
  character_id INT REFERENCES characters (id),
  strength BOOLEAN,
  dexterity BOOLEAN,
  constitution BOOLEAN,
  intelligence BOOLEAN,
  wisdom BOOLEAN,
  charisma BOOLEAN,
  athletics BOOLEAN,
  acrobatics BOOLEAN,
  sleightOfHand BOOLEAN,
  stealth BOOLEAN,
  arcana BOOLEAN,
  history BOOLEAN,
  investigation BOOLEAN,
  nature BOOLEAN,
  religion BOOLEAN,
  animalHandling BOOLEAN,
  insight BOOLEAN,
  medicine BOOLEAN,
  perception BOOLEAN,
  survival BOOLEAN,
  deception BOOLEAN,
  intimidation BOOLEAN,
  performance BOOLEAN,
  persuasion BOOLEAN,
  PRIMARY KEY (character_id)
);

-- Create table character_inventory
CREATE TABLE character_inventory (
  character_id INT REFERENCES characters (id),
  spells TEXT,
  weapons TEXT,
  inventory TEXT,
  PRIMARY KEY (character_id)
);

-- Create indexes on the ids
CREATE INDEX users_id_index ON users (id);
CREATE INDEX characters_id_index ON characters (id);
CREATE INDEX character_stats_id_index ON character_stats (id);
CREATE INDEX character_proficiency_character_id_index ON character_proficiency (character_id);
CREATE INDEX character_inventory_character_id_index ON character_inventory (character_id);
