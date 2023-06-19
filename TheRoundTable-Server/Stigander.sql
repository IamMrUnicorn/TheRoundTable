INSERT INTO users (clerk_user_id, email, username, is_dungeon_master)
VALUES ('clerk456', 'arielortiz@gmail.com', 'th4tkooldud3', true);

INSERT INTO users (clerk_user_id, email, username, is_dungeon_master)
VALUES ('clerk123', 'xxxmrxunicornxxx@gmail.com', 'iammrunicorn', false);

INSERT INTO parties (name, DM_id)
VALUES ('minority report', 2);

INSERT INTO characters (user_id, party_id, name, image_url, race, class, subclass, level)
VALUES (1, 1, 'Stigander Boerd', 'https://howtodrawforkids.com/wp-content/uploads/2023/02/how-to-draw-a-mushroom.jpg', 'Aaracokra', 'Cleric', 'Nature Domain', 13);

INSERT INTO character_stats (character_id, status, currentHP, maxHP, AC, proficiency, initiative, speed, strength, dexterity, constitution, intelligence, wisdom, charisma, spell_DC)
VALUES (1, 'Tripping', 72, 80, 13, 5, 1, 30, 12, 14, 16, 18, 10, 8, 14);

INSERT INTO character_proficiency (character_id, strength, dexterity, constitution, intelligence, wisdom, charisma, athletics, acrobatics, sleightOfHand, stealth, arcana, history, investigation, nature, religion, animalHandling, insight, medicine, perception, survival, deception, intimidation, performance, persuasion)
VALUES (1, true, false, true, true, false, true, true, false, true, true, false, true, false, true, false, true, true, false, true, false, true, true, false, true);

INSERT INTO character_inventory (character_id, spells, weapons, inventory)
VALUES (1, 
'{"cantrips":["light","guidance","sacred flame","mending","druid craft","spare the dying"],"lvl1":["cure wounds","guiding bolt","santuary","healing word","bless","detect magic"],"lvl2":["prayer of healing","calm emotion","hold person","bark skin","spritual weapon"],"lvl3":["beacon of hope","revivify","spirit guardians","mass healing word","plant growth"],"lvl4":["death ward","divination","dominate beast","grasping vines","banishment"],"lvl5":["commune","flame strike","mass cure wounds"," geater restoration","planar binding"],"lvl6":["heal","word of recall","true seeing","blade barrier","plannar ally"],"lvl7":["conjure celestial","diving word","regenerate","plane shift","resurrection"],"lvl8":[],"lvl9":[]}',
'{"heavy":[],"light":[],"reach":[],"thrown":[],"loading":[],"range":["bow"],"finesse":[],"special":[],"versatile":[],"twoHanded":[],"magicalWeapons":["scimitar","mustang & sally"]}',
'{"everything":["mushroom pouch","bag of holding","silver dragon potion","magical cupcake","canteen of mushroom juice","a bunch of colored rocks"]}'
);



