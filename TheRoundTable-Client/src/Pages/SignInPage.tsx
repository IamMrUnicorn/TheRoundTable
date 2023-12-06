import { FC, useState, useContext } from "react";
import { supabaseContext } from '../Utils/supabase';



const SignInPage: FC = () => {
  const [openModal, setOpenModal] = useState(false);
  const [openInput, setOpenInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [tempEmail, setTempEmail] = useState('');
  const [error, setError] = useState('');
  const supabase = useContext(supabaseContext);

  const handleEmailChange = (e: any) => {
    setTempEmail(e.target.value)
    const value = e.target.value;
    // Simple regex for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(value)) {
      // If the input value matches the regex, update the state
      setEmail(value);
    } else {
      setError('Please Enter A Valid Email')
      // Optionally handle the case where it's not matching
      // You could provide user feedback or just not update the state
    }
  };

  const handleLogInWithProvider = async (provider: string) => {
    setLoading(true);
    setError('');

    try {

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider
      });

      if (error) {
        throw error
      }

    } catch (error) {
      setError(error.message || 'unexpected error occured');
    }
    finally {
      setLoading(false);
    }


  };

  const handleLogInWithOTP = async () => {
    setLoading(true);
    setError('');

    let { data, error } = await supabase.auth.signInWithOtp({
      email: email
    })

    if (error) {
      setError(error.message);
    } else {
      console.log(data)
      setError('email sent, check your inbox for the magic link')
    }

    setLoading(false);
  };




  return (
    <div className="p-10 overflow-x-hidden hiddenScroll flex flex-col text-white items-center gap-20 bg-black ">
      {openModal
        ? (<div className='bg-secondary overflow-clip flex flex-row items-center justify-center absolute bg-opacity-60 h-screen w-screen z-30 '>
          <div className='flex flex-col bg-accent relative rounded-3xl p-4 justify-center  items-center w-1/3'>
            <button className='absolute top-0 left-0 bg-black rounded-lg h-8 w-8 hover:bg-red-600' onClick={() => setOpenModal(false)}>X</button>
            <div className='flex flex-col p-1 gap-3'>
              <p className='font-primary text-xl pt-4 p-2'>Continue with a magic link sent to your email</p>
              <div className='p-2 flex flex-row justify-center gap-2'>
                <input value={email} className="text-black rounded-lg p-2 font-accent" onChange={(e) => { console.log(e.target.value); setEmail(e.target.value) }} />
                <button className='btn capitalize font-accent hover:bg-yellow-400 hover:text-black' onClick={handleLogInWithOTP}>magic link</button>
              </div>
              <div className='font-primary self-center flex flex-row text-xl'> <span className='bg-black h-1 grow' /> <p>Or</p> <span className='bg-black h-1 grow' /></div>
              <div className='flex flex-col p-2 justify-center gap-2'>
                <button className='btn font-accent capitalize hover:text-black hover:bg-white ' onClick={() => handleLogInWithProvider('google')}> continue with <i className="fa-brands fa-google" /></button>
                <button className='btn font-accent capitalize hover:text-white hover:bg-green-400 ' onClick={() => handleLogInWithProvider('azure')}> continue with <i className="fa-brands fa-microsoft" /></button>
              </div>
            </div>
          </div>
        </div>)
        : null}

      <button className='absolute top-10 right-10 btn btn-primary font-accent' onClick={() => setOpenModal(true)} >Sign In</button>

      <h1 className="title font-neutral pt-32">
        THE ROUND TABLE
        <div className="aurora">
          <div className="aurora__item"></div>
          <div className="aurora__item"></div>
          <div className="aurora__item"></div>
          <div className="aurora__item"></div>
        </div>
      </h1>

      {
        <div>
          <InfoBlock
            title='Embark on Epic Adventures with The Round Table'
            text='Welcome to The Round Table, the digital nexus for Dungeons & Dragons enthusiasts. Our platform replicates the excitement and camaraderie of in-person D&D sessions, enhanced with powerful digital tools. Designed for both Dungeon Masters (DMs) and players, The Round Table transforms your adventures into immersive, streamlined, and unforgettable experiences.'
            image="/Aethoria.jpeg"
            bulletPoints={[
              {
                title: 'Character Sheet Upload & Automation',
                content: 'Easily upload your character sheets and let our system handle the updates. As your journey evolves, your character sheet reflects changes in real-time, from skill advancements to inventory updates.'
              },
              {
                title: 'Game Dashboard',
                content: 'Our intuitive dashboard is your command center for tracking and logging every aspect of your campaign. Monitor quests, manage NPCs, and keep your adventure organized and fluid.'
              },
              {
                title: 'DM Control Screen',
                content: 'Plan and execute encounters seamlessly with our dynamic encounter planner. Design challenging battles, set up ambushes, and manage combat scenarios with ease, ensuring a thrilling experience for your players.'
              },
              {
                title: 'Dynamic Encounter Planner',
                content: 'Plan and execute encounters seamlessly with our dynamic encounter planner. Design challenging battles, set up ambushes, and manage combat scenarios with ease, ensuring a thrilling experience for your players'
              },
            ]}
            footer='At The Round Table, we blend tradition with technology, providing tools that enhance storytelling, engagement, and the overall D&D experience. Prepare to delve into dungeons, battle dragons, and embark on quests that will be remembered for a lifetime!'
            flipped={false}
          />

          <InfoBlock
            title='Master Your Realm: The Ultimate DM Toolkit'
            text="As a Dungeon Master, immerse yourself in the art of storytelling with The Round Table's advanced DM Toolkit. Designed to streamline campaign management and enhance player engagement, our platform offers an array of tools that transform the way you run your Dungeons & Dragons sessions."
            image="/Aethoria.jpeg"
            bulletPoints={[
              {
                title: 'Real-Time Party Management',
                content: "Effortlessly track your party's journey, from character progression to inventory changes, with our real-time management system."
              },
              {
                title: 'ChatGPT NPC Generator & Roleplayer',
                content: 'Bring your NPCs to life with our ChatGPT-powered NPC generator. Create unique characters with their own backstories, personalities, and dialogues, making each interaction memorable and engaging.'
              },
              {
                title: 'Event Triggering System',
                content: 'Introduce unexpected twists and turns with our easy-to-use event triggering system. From sudden encounters to major plot revelations, keep your players on their toes.'
              },
              {
                title: 'Sound and Effect Library',
                content: "Enhance the atmosphere of your campaigns with a rich library of sounds and effects. Whether it's the roar of a dragon or the whisper of the wind, set the perfect tone for every scene."
              },
              {
                title: 'Cannon Events & Player Journals',
                content: "Ensure every crucial lore moment is captured with our Cannon Events feature. Whenever a significant event unfolds, like a dragon attacking the town, create a detailed journal entry for your players. This not only immortalizes key moments but also deepens the players' connection to the story, ensuring that these pivotal events are experienced and remembered by everyone."
              }
            ]}
            footer= "The Round Table's DM Toolkit empowers you to create a world that's not just played, but truly lived. Elevate your Dungeons & Dragons experience to new heights, where every session is a journey into the heart of adventure."
            flipped={true}
          />

          <InfoBlock 
            title='Elevate Your Gameplay: Enhanced Player Experience'
            text="These features are designed to keep you immersed in the rich world of D&D, providing a seamless interface that complements and enhances your role-playing experience. With The Round Table, every session is an opportunity to delve deeper into the realms of fantasy, equipped with tools that bring your character and their journey to life."
            image="/Aethoria.jpeg"
            bulletPoints={[
              {
                title: 'Data Automation',
                content: 'Say goodbye to the tediousness of manual updates. Once you input your character data, our system automates everything from HP tracking to spell slot management. Enjoy a streamlined play where your focus stays on the adventure.'
              },
              {
                title: 'Quick Turn Actions',
                content: 'Confused about your options during a turn? Our Quick Turn Action feature provides a clear, intuitive interface showing all available actions based on your current situation. It dynamically updates, showing only the options you have left as your turn progresses.'
              },
              {
                title: 'Player Books - Three Pillars of Knowledge',
                content: "Monster Log: Your personal encyclopedia of creatures. This log keeps a running record of every monster you encounter, cataloging their traits, vulnerabilities, and behaviors. Spell Book: A dynamic repository of your magical arsenal. For spellcasters, this book displays all known and accessible spells, adapting as you learn or discover new magic. Journal: Chronicle your journey with a detailed journal. It's not just a log; it's a narrative of your exploits, capturing significant lore and story elements."
              },
              {
                title: 'Public and Private Whiteboards',
                content: "Collaborate with your party and DM on a shared whiteboard, perfect for strategizing and sharing ideas. Additionally, each player has access to a private whiteboard, acting as a personal notebook or a reflection of your character's memory."
              }
            ]}
            footer="These features are designed to keep you immersed in the rich world of D&D, providing a seamless interface that complements and enhances your role-playing experience. With The Round Table, every session is an opportunity to delve deeper into the realms of fantasy, equipped with tools that bring your character and their journey to life."
            flipped={false}
          />

          <InfoBlock 
            title='Your Character, Digitally Enhanced: Intuitive Character Management'
            text="At The Round Table, we understand that every character is a unique story unfolding. Our character management system is designed to honor and elevate this individuality, ensuring that your focus remains on the adventure and the role you play within it."
            image="/Aethoria.jpeg"
            bulletPoints={[
              {
                title: 'Easy Character Data Upload',
                content: 'Transitioning your character from paper to digital is a breeze. Upload your existing character sheet, and our platform will seamlessly integrate your data, maintaining the essence of your character while enhancing the details.'
              },
              {
                title: 'Automated Detail Calculation',
                content: 'Say goodbye to manual calculations. Our system automatically determines crucial details like ability modifiers from your ability scores, ensuring accuracy and saving you time.'
              },
              {
                title: 'Dynamic Spell Management',
                content: 'Spellcasting becomes more manageable with our automated spell sheet. It adjusts your spell information based on your class and subclass, keeping track of spells prepared, spell slots remaining, and more, tailored specifically to your character\'s magical capabilities.'
              },
              {
                title: 'Class-Specific Modules',
                content: 'Each class is unique, and our platform celebrates this diversity. Access specialized modules that cater to your class\'s specific features. Whether it\'s managing sorcery points for Sorcerers, tracking Ki points for Monks, or keeping an eye on Artificers\' infused items, our system provides a tailored experience that resonates with your character\'s identity and abilities.'
              }
            ]}
            footer="At The Round Table, we understand that every character is a unique story unfolding. Our character management system is designed to honor and elevate this individuality, ensuring that your focus remains on the adventure and the role you play within it."
            flipped={true}
          />

          <InfoBlock 
            title='Beyond the Game: Enhancing Your D&D Experience'
            text="These additional features are designed to streamline the logistical side of your D&D experience, letting you focus more on the adventure and less on the planning. Whether you're looking to join a new campaign or organize your current one, The Round Table is here to enhance every aspect of your D&D journey."
            image="/Aethoria.jpeg"
            bulletPoints={[
              {
                title: 'Adventurer Finder',
                content: 'Our LFG (Looking For Group) board is a haven for both DMs in search of players and adventurers looking for a party. Connect with like-minded individuals, plan your next campaign, and start new journeys with players from around the world.'
              },
              {
                title: 'Calendar Module',
                content: 'Scheduling conflicts are a thing of the past. Our shared calendar module allows party members to mark their availability, helping to find the best times for everyone. Set up one-time sessions or recurring adventures with ease.'
              },
              {
                title: 'Potential Discord Integration',
                content: 'While still in the conceptual phase, we envision a future where our platform integrates seamlessly with Discord. Imagine planning events, receiving session reminders, or even updating your campaign status directly in your Discord server. This feature aims to bridge the gap between The Round Table and your existing social channels, making coordination and communication smoother than ever.'
              }
            ]}
            footer="These additional features are designed to streamline the logistical side of your D&D experience, letting you focus more on the adventure and less on the planning. Whether you're looking to join a new campaign or organize your current one, The Round Table is here to enhance every aspect of your D&D journey."
            flipped={false}
          />
        </div>
      }

<p>so what do you say adventurer, are you ready to take a seat at the round table?</p>

      {/* <SignUpButton /> */}
      <div className='flex flex-col justify-center'>
        <h3 className='text-4xl font-primary'>Get started by creating an account </h3>
        <div className='flex flex-row justify-center'>
          <label className='flex flex-row gap-2 capitalize font-accent m-1' >
            <button className='btn btn-primary font-accent' onClick={() => setOpenInput((prev) => !prev)}>{openInput ? 'cancel' : 'Sign Up'}</button>
            {openInput && <div className='flex flex-row gap-2'> <input className='text-black p-2 rounded-md' type='email' placeholder='enter your email' value={tempEmail} onChange={handleEmailChange} /> <button className='btn btn-primary' onClick={handleLogInWithOTP} disabled={loading} > send link </button></div>}
          </label>
        </div>
      </div>

      {/* <SignInButton />
      <div className='flex flex-col justify-center'>
        <h3 className='text-4xl font-primary'>Or just sign into your account</h3>
        <div className='flex flex-row justify-center'>
          <label className=' capitalize font-accent m-1' >
            <button className='btn btn-primary font-accent' onClick={() => setOpenModal(true)} >Sign In</button>
          </label>
        </div>
      </div> */}

    </div>
  )
}

export default SignInPage

type bulletPoints = {
  title: string
  content: string
}
const InfoBlock = ({ title, text, image, bulletPoints, footer, flipped }: { title: string, text: string, image?: string, bulletPoints: bulletPoints[], footer: string, flipped: boolean }) => {

  return (
    <div className={`flex ${flipped ? 'flex-row' : 'flex-row-reverse'} items-center gap-6 mb-12`}>
      {image && (
        <div className="w-1/2">
          <img className="w-full h-auto object-cover rounded-lg" src={image} alt={title} />
        </div>
      )}
      <div className="w-1/2">
        <h2 className="font-primary underline text-3xl mb-4">{title}</h2>
        <p className="font-accent indent-5 text-xl">{text}</p>
        <ul>
          {bulletPoints.map((bp) => (
            <li>
              <p>* {bp.title}</p>
              <p className="pl-8">{bp.content}</p>
            </li>
          ))}
        </ul>
        <p>{footer}</p>
      </div>
    </div>
  );
}