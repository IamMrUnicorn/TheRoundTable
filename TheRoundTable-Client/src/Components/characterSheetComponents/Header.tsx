import { useState, useRef } from "react";
import { HealthBar } from "../HealthBar";
import AvatarEditor from 'react-avatar-editor';
import { useUser } from '@clerk/clerk-react';
import { Chips } from "primereact/chips";
import { customChip } from "../../Pages/CharacterImportPage";

const ImageEditor = ({ image, setImage, editorOpen, setEditorOpen, scale, setScale }) => {
  const editorRef = useRef();

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      setImage(e.target.result);
      setEditorOpen(true);
    }

    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (editorRef.current) {
      const canvas = editorRef.current.getImageScaledToCanvas();
      const imageURL = canvas.toDataURL();
      setImage(imageURL);
      setEditorOpen(false);
    }
  };

  return (
    <>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <AvatarEditor
        ref={editorRef}
        image={image}
        width={100}
        height={100}
        borderRadius={50}
        border={10}
        scale={scale}
      />
      <br />
      <input type="range" min="1" max="3" step="0.01" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} />
      <button onClick={handleSave}>Save</button>
    </>
  );
}


const InfoBlock = ({ label, content, isEditing, onInputChange, onChipChange, cnPassThrough }: { label:string, content:string, cnPassThrough?:string, isEditing:boolean, onInputChange:()=>void, onChipChange:()=>void }) => {

  return (
      <div className="flex flex-col items-center p-1">
          <div className="underline">
              {isEditing 
                  ? Array.isArray(content)
                      ? <Chips
                            value={content}
                            onChange={(e) => onChipChange(e.value || [])}
                            itemTemplate={customChip}
                        />
                      : <input value={content} onChange={onInputChange} />
                  : Array.isArray(content) 
                      ? content.map((item, index) => <p className={cnPassThrough} key={index}>{item}</p>) 
                      : <p className={cnPassThrough}>{content}</p>
              }
          </div>
          <label className="text-sm font-primary capitalize">{label}</label>
      </div>
  );
};


const CheckboxRow = ({ title }) => (
  <div className="flex flex-row gap-3 justify-center">
    <input type="checkbox" />
    <input type="checkbox" />
    <input type="checkbox" />
    <p className="place-self-center">{title}</p>
  </div>
);

export const Header = ({ characterData, isEditing, onInputChange, onChipChange }) => {
  const { user } = useUser();
  const [image, setImage] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [scale, setScale] = useState(1);

  return (
    <div className="flex flex-row justify-around pt-5 bg-yellow-100">
      <div className="flex flex-col">
        <div className="rounded-full flex flex-col justify-center border border-solid border-black bg-slate-500 text-center h-48 w-48 font-accent capitalize mr-1">
          {editorOpen && image ? <ImageEditor {...{ image, setImage, editorOpen, setEditorOpen, scale, setScale }} /> :
            !editorOpen && image && <img src={image} alt="Profile" className="rounded-full h-48 w-48" onClick={() => setEditorOpen(true)} />}
        </div>
      </div>

      <div className="flex flex-col w-1/4">
        <div className="flex flex-row justify-center font-accent capitalize text-lg">
          <InfoBlock isEditing={isEditing} onInputChange={onInputChange} onChipChange={onChipChange} label="name" content={characterData.name} cnPassThrough='text-4xl' />
          {characterData.party_id && <InfoBlock isEditing={isEditing} onInputChange={onInputChange} onChipChange={onChipChange} label="party" content={characterData.party_id} cnPassThrough='text-xl pt-5' />}
        </div>
        <div className="flex flex-row justify-center font-accent capitalize text-lg gap-1">
          <InfoBlock isEditing={isEditing} onInputChange={onInputChange} onChipChange={onChipChange} label="race" content={characterData.race} />
          <InfoBlock isEditing={isEditing} onInputChange={onInputChange} onChipChange={onChipChange} label="background" content={characterData.background} />
          <InfoBlock isEditing={isEditing} onInputChange={onInputChange} onChipChange={onChipChange} label="alignment" content={characterData.alignment} cnPassThrough="whitespace-nowrap" />
        </div>
        <div className="flex flex-row justify-center font-accent capitalize text-lg gap-1">
          <InfoBlock isEditing={isEditing} onInputChange={onInputChange} onChipChange={onChipChange} label="Class" content={characterData.class} />
          <InfoBlock isEditing={isEditing} onInputChange={onInputChange} onChipChange={onChipChange} label="Subclass" content={characterData.subclass} />
          <InfoBlock isEditing={isEditing} onInputChange={onInputChange} onChipChange={onChipChange} label="Level" content={characterData.level} />
        </div>
      </div>

      <div className="flex flex-col p-2 font-accent capitalize text-lg w-1/4">
        <HealthBar currentHealth={characterData.character_stats.currenthp} maxHealth={characterData.character_stats.maxhp} />
        <div className="flex flex-row justify-center">
          <p><span className='text-xl font-primary'>status:</span> {characterData.character_stats.status}</p>
        </div>
        <p className="place-self-center font-primary">death saves</p>
        <CheckboxRow title="success" />
        <CheckboxRow title="failures" />
      </div>
      
      <div className="flex flex-col font-accent w-1/4">
        <div className="flex flex-row h-1/2">
          <InfoBlock isEditing={isEditing} onInputChange={onInputChange} onChipChange={onChipChange} cnPassThrough="text-4xl p-4" label="AC" content={`${characterData.character_stats.ac}`} />
          <InfoBlock isEditing={isEditing} onInputChange={onInputChange} onChipChange={onChipChange} cnPassThrough="text-4xl p-4" label="speed" content={`${characterData.character_stats.speed}ft`} />
        </div>
        <div className="flex flex-row h-1/2">
          <InfoBlock isEditing={isEditing} onInputChange={onInputChange} onChipChange={onChipChange} cnPassThrough="text-4xl p-4" label="initiative" content={`+${characterData.character_stats.initiative}`} />
          <InfoBlock isEditing={isEditing} onInputChange={onInputChange} onChipChange={onChipChange} cnPassThrough="text-4xl p-4" label="proficiency bonus" content={`+${characterData.character_stats.proficiency}`} />
        </div>
      </div>
    </div>
  );
}
