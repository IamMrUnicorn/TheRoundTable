import React from 'react';

const GuideSidebar = () => {
  return (
    <div className="w-64 h-screen fixed bg-secondary p-4 overflow-auto">
      <nav className="flex flex-col">
        <a className="p-1 mb-2 font-primary text-xl capitalize hover:text-primary" href="#welcome">Welcome to D&D</a>
        <a className="p-1 mb-2 font-primary text-xl capitalize hover:text-primary" href="#essence" >The Essence of D&D</a>
        <a className="p-1 mb-2 font-primary text-xl capitalize hover:text-primary" href="#dice" >Understanding the Dice</a>
        <a className="p-1 mb-2 font-primary text-xl capitalize hover:text-primary" href="#character-creation" >Character Creation</a>
        <a className="p-1 mb-2 font-primary text-xl capitalize hover:text-primary" href="#popular-classes" >Popular Classes</a>
        <a className="p-1 mb-2 font-primary text-xl capitalize hover:text-primary" href="#character-stats" >Character Stats</a>
        <a className="p-1 mb-2 font-primary text-xl capitalize hover:text-primary" href="#understanding-combat" >Understanding Combat</a>
        <a className="p-1 mb-2 font-primary text-xl capitalize hover:text-primary" href="#etiquette" >D&D Etiquette</a>
        <a className="p-1 mb-2 font-primary text-xl capitalize hover:text-primary" href="#concluding-thoughts" >Concluding Thoughts</a>
      </nav>
    </div>
  );
};

export default GuideSidebar;
