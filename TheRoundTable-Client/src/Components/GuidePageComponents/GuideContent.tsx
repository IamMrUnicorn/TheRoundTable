import React from 'react';

const GuideContent = () => {
  return (
    <div className="ml-64 p-8 prose max-w-none  text-white">
      <p className='font-accent'>
        *this guide is meant to be an introduction to Dungeons & Dragons in the most basic sense, there are plenty of official guide books for various different editions of D&D or even other Table Top Role Playing Games (TTRPG) such as pathfinder or warhammer
      </p>
      <section id="welcome" className="mb-8">
        <h2 className="text-3xl font-normal font-primary mb-4">Welcome to the World of Dungeons & Dragons</h2>
        <div className="text-lg font-accent space-y-4">
          <p>
            Dungeons & Dragons (D&D) is more than just a game; it's a gateway to a realm of limitless adventure and imagination. In this fantasy world, as a player, you step into the shoes of a character of your own creation, each with unique backgrounds, abilities, and aspirations. Here, you will embark on epic quests, battle fearsome monsters, solve intricate puzzles, and navigate a landscape rich with diverse characters and cultures.
          </p>
          <img alt='children around a round table playing an exciting table top role playing game' src='/kidsPlayingDND.png' />
          <p>
            The heart of D&D lies in its storytelling. Every player contributes to a shared narrative, weaving their character's actions, decisions, and personal stories into a larger, collaborative tapestry. The Dungeon Master (DM) serves as the chief narrator and referee, setting the stage for this collective story. They present challenges, craft intricate plots, and breathe life into the world's inhabitants, from noble kings to malevolent sorcerers.
          </p>
          <p>
            As the game unfolds, your journey is shaped by a unique blend of strategic planning, creative problem-solving, and the unpredictable nature of the dice rolls. These dice rolls, governed by the rules of the game, introduce an element of chance that can turn the tides of an encounter or alter the course of a storyline, adding a thrilling layer of uncertainty to each session.
          </p>
          <p>
            The beauty of D&D is that it's a game of endless possibilities. No two adventures are the same, and the world evolves with each choice you make. It's a space where friendships are forged in the fires of shared trials and triumphs, and memories are created that transcend the boundaries of the game.
          </p>
          <p>
            Whether you're venturing into ancient ruins, negotiating with wily dragons, or unraveling mystical enigmas, D&D offers a unique opportunity to explore new horizons, both within the game and within yourself. It's a celebration of creativity, collaboration, and the magic of storytelling, inviting players to not just witness a story but to live it.
          </p>
        </div>
      </section>


      <section id="essence" className="mb-8">
        <h2 className="text-3xl font-normal font-primary mb-4">The Essence of D&D: Role-Playing and Storytelling</h2>
        <div className='font-accent text-lg space-y-4'>
          <p>At its heart, Dungeons & Dragons is about storytelling. You and your fellow players collaborate to weave a narrative, with each person contributing through their character's actions and decisions. The Dungeon Master (DM) sets the stage, but the plot evolves dynamically through your choices and the often unpredictable outcomes of dice rolls.</p>

          <p>One of the most important aspects of D&D is the shared enjoyment and creativity of the group. While the rules provide a framework, they are not meant to constrict your imagination or limit the fun. It’s essential to remember that D&D is a game, and the ultimate goal is for everyone to have a great time. If bending a rule leads to a memorable and enjoyable moment, it's often worth considering.</p>

          <p>At The Round Table, we believe in the power of open-ended gameplay to create incredible moments. Your DM and team should feel empowered to interpret the rules in a way that enhances the story and enjoyment for everyone involved. If the rulebook says one thing, but your group agrees that an alternative approach would be more fun or lead to more interesting storytelling, then why not explore that path? The magic of D&D lies in its flexibility and the unique experiences each gaming group brings to the table.</p>
        </div>
        <img alt='children around a round table playing an exciting table top role playing game' src='/kidsPlayingDND2.png' />
      </section>


      <section id="dice" className="mb-8  ">
        <h2 className="text-3xl font-normal font-primary mb-4">Understanding the Dice: The Tools of Fate</h2>
        <p className='font-accent text-lg'>D&D uses a set of multi-sided dice to determine the outcomes of your actions. dice are often used to make things more unpredictable, fair, or fun. Dice can be even be used as an unbiased decision making tool, like flipping a coin but for when you have more than 2 options. You can even combine dice to get a more intricate decision for example if you were starting a session and wanted to determine the time of day you could use a D12 to get the hour and then flip a coin to determine if that time is AM or PM.</p>
        <ul className='font-accent'>
          <li>The D4 is typically used for small weapon damage and some weak spell effects.</li>
          <li>The D6 is a versatile die, used for many purposes including weapon damage and various spell effects.</li>
          <li>The D8 is often rolled for weapon damage and healing spells.</li>
          <li>The D10 and D100 are often used together for percentile rolls.</li>
          <li>The D12 is used for certain weapons' damage and some character abilities.</li>
          <li>The D20 is the most frequently used die, determining the success or failure of most actions, with both 1 and 20 acting as critical failure or success</li>
        </ul>
        <img alt='a set of role playing dice' src='/dice.jpg' />
        <p className='font-accent text-lg'>pictured above is the D4, D6, D8, D10, D100, D12, and the glorious D20 <i className='fa fa-dice-d20' /></p>
      </section>

      <section id="character-creation" className="mb-8">
        <h2 className="text-3xl font-normal font-primary mb-4">Character Creation: Building Your Alter Ego</h2>
        <div className='font-accent text-lg space-y-4'>
          <p>Creating a character in D&D is a step into a new identity. You'll choose a race, like human, elf, or dwarf, etc., and a class, such as wizard, rogue, or fighter, etc., each providing unique abilities and shaping your role in the adventure. Races offer different physical and cultural traits, like elves having keen senses and natural proficiency in archery, while dwarves are sturdy and skilled in craftsmanship. Your class determines your skills and abilities, with fighters excelling in combat, wizards wielding magic, and clerics channeling divine powers.</p>
          <img alt='a lineup of fantastic heros' src='/dndCharacterInspiration3.png' />
          <p>When joining an established team, consider what roles might be needed to support the group. If the team lacks a healer, you might choose a class like a cleric or druid. If the group needs more frontline strength, a fighter or barbarian could be ideal. The key is to communicate with your team and find a balance that enhances the group dynamic while still playing a character you enjoy.</p>

          <p>Starting a new adventure with others? It's a great opportunity to discuss and plan your characters together. Creating a balanced team where each player has a role that complements the others can lead to a more rewarding experience. Whether it's being the healer in the back, the tank on the front lines, or the stealthy rogue scouting ahead, each role is vital to the team's success.</p>
          <img alt='a lineup of fantastic heros readying for war' src='/dndCharacterInspiration2.png' />
        </div>
      </section>


      <section id="popular-classes" className="mb-8">
        <h2 className="text-3xl font-normal font-primary mb-4">Popular Classes and Their Styles</h2>
        <div className='font-accent text-lg space-y-4'>
          <img alt='a clash of fantasy warriors' src='/dndCharacterInspiration.png' />
          <p>The Rogue class is skilled in stealth and trickery, ideal for players who enjoy cunning tactics and outsmarting opponents. Wizards are masters of arcane magic, suitable for those who like strategizing and controlling the battlefield with spells. Barbarians are known for their raw physical power and resilience, perfect for players who want to be at the forefront of combat.</p>

          <p>Remember, the way you play your class can vary greatly from the traditional roles. A cleric, for instance, doesn't have to be just a healer. With the right spells and abilities, they can be formidable warriors or skillful negotiators. Similarly, a wizard could focus on protective spells and support rather than just offensive magic.</p>

          <p>Exploring unconventional combinations of classes and races can lead to unique and fun experiences. A dwarf wizard, for example, might combine the physical resilience of their race with the intellectual prowess of their class. Or a half-orc bard could use their intimidating presence in creative ways. Don’t be afraid to think outside the box and craft a character that breaks the mold!</p>
        </div>
      </section>


      <section id="character-stats" className="mb-8">
        <h2 className="text-3xl font-normal font-primary mb-4">Character Stats: The Core of Your Character</h2>
        <div className='font-accent text-lg space-y-4'>
          <p>Character stats form the foundation of your character's abilities in D&D. Each stat not only contributes to certain types of actions but also synergizes with specific classes, and can be influenced by your character's race.</p>

          <p><strong>Strength:</strong> Vital for physical feats and melee combat. High strength is key for fighters and barbarians who engage in close-quarters combat. Races like Orcs or Goliaths, known for their brute strength, often provide bonuses to this stat.</p>

          <p><strong>Dexterity:</strong> Governs agility-based actions such as sneaking, ranged attacks, and reflexive dodging. Essential for rogues and rangers who rely on speed and precision. Races like Elves or Halflings, renowned for their agility, typically boost this stat.</p>

          <p><strong>Constitution:</strong> Determines health points and resistance to injury. Crucial for frontline fighters and anyone who finds themselves in the thick of battle. Dwarves, known for their hardiness, often have racial bonuses to constitution.</p>

          <p><strong>Intelligence:</strong> Key for wizards and characters who rely on knowledge and memory. This stat is important for spellcasting and understanding arcane lore. Races such as Gnomes, known for their intellect, can offer a boost in intelligence.</p>

          <p><strong>Wisdom:</strong> Reflects awareness and perception, crucial for clerics, druids, and characters attuned to the world around them. Races like Wood Elves or Firbolgs, closely connected to nature, often have increased wisdom scores.</p>

          <p><strong>Charisma:</strong> Influences interactions with others and is vital for leaders, persuasive characters, or spellcasters like sorcerers and bards. Races like Tieflings, who are inherently charismatic and persuasive, typically have bonuses to charisma.</p>

          <p>Beyond the raw score, each stat has a corresponding modifier, which is derived from the stat score. This modifier is added to rolls related to the stat's actions. For example, a strength score of 20 translates to a +5 modifier, greatly enhancing a character's performance in strength-based tasks. Understanding the difference between the score and the modifier is crucial for effective gameplay and character development.</p>
        </div>
      </section>


      <section id="understanding-combat" className="mb-8">
        <h2 className="text-3xl font-normal font-primary mb-4">Understanding Combat</h2>
        <div className='font-accent text-lg space-y-4'>
          <p>While much of Dungeons & Dragons is guided by the Dungeon Master's (DM's) narrative, certain situations, like provoking a character or encountering a monster, shift the game into a structured turn-based mode. This is when you'll often hear the DM say, "Roll for Initiative."</p>

          <h3 className="text-2xl font-medium mb-2">Rolling for Initiative</h3>
          <p>Initiative determines the order of turns during combat. Everyone rolls a D20 and adds their initiative score, which is typically their Dexterity modifier. Additional bonuses can come from magical items, class features, or racial traits. A higher initiative roll means you act earlier in the combat sequence.</p>

          <h3 className="text-2xl font-medium mb-2">Understanding AC and DC</h3>
          <p>AC (Armor Class) and DC (Difficulty Class) are crucial concepts in combat. AC represents how hard it is to hit a character. For example, a nimble rogue might have a high AC, such as 17 or 19. To hit them, your attack roll must meet or exceed their AC. DC works similarly but is often used for saving throws against spells or abilities. If a spell has a DC of 15, a defending character must roll a saving throw of 15 or higher to resist the spell's effects.</p>

          <h3 className="text-2xl font-medium mb-2">Actions and Bonus Actions</h3>
          <p>In your turn, you generally have one action and one bonus action. Actions encompass a wide range of activities: attacking, casting a spell, using an item, aiding a teammate, etc. Bonus actions are more limited and used for quicker tasks like reloading a crossbow, drinking a potion, or casting certain spells. The specific actions you can take may vary based on your class, abilities, and current situation. It's important to consult your DM to fully understand everything your character can do.</p>

          <h3 className="text-2xl font-medium mb-2">Movement and Positioning</h3>
          <p>Each player also has a certain amount of movement they can use on their turn, measured in feet. This allows you to position yourself strategically on the battlefield. If you're knocked prone, part of your movement is used to stand up, affecting your ability to maneuver.</p>
        </div>
      </section>



      <section id="etiquette" className="mb-8">
        <h2 className="text-3xl font-normal font-primary mb-4">D&D Etiquette: Playing Well with Others</h2>
        <p className='font-accent text-lg'>Respect and collaboration are key. Respect each other's play styles and work collaboratively to create a fun experience. Know your character's abilities and be ready to describe your actions. Be engaged, paying attention to the story and other players, as D&D is a shared experience.</p>
      </section>



      <section id="concluding-thoughts" className="mb-8">
        <h2 className="text-3xl font-normal font-primary mb-4">Concluding Thoughts: Your Journey Begins</h2>
        <p className='font-accent text-lg'>D&D is a game of imagination, strategy, and collaboration. It's a space where stories come to life and friendships are forged. As you embark on your D&D journey, remember that the most important rule is to have fun and embrace the adventure that awaits.</p>
      </section>
    </div>
  );
};

export default GuideContent;
