import React from 'react'
import Row from './Row'
import { Character } from '../api'
import Tabbed from './controls/Tabbed'

function Attributes({player}: {player: Character}) {
  return <div>
    <Row label={'Strength'}>{player.attributes.Strength}</Row>
    <Row label={'Dexterity'} alt={true}>{player.attributes.Dexterity}</Row>
    <Row label={'Constitution'}>{player.attributes.Constitution}</Row>
    <Row label={'Inteligence'} alt={true}>{player.attributes.Intelligence}</Row>
    <Row label={'Wisdom'}>{player.attributes.Wisdom}</Row>
    <Row label={'Charisma'} alt={true}>{player.attributes.Charisma}</Row>
  </div>
}

function Skills({player}: {player: Character}) {
  return <div>
    {Object.keys(player.skill_modifiers).map((skill, index) => 
      <Row key={index} label={skill} alt={Boolean(index % 2)}>{`+${player.skill_modifiers[skill]}`}</Row>
    )}
  </div>
}

function Inventory({player}: {player: Character}) {
  return <div>
    {player.inventory.map((item, index) => 
      <Row key={index} label={item} alt={Boolean(index % 2)}>{}</Row>
    )}
  </div>
}

function Backstory({player}: {player: Character}) {
  return <div className={'px-2'}>{player.backstory}</div>
}

export default function Player({player}: {player: Character}) {
  return <div className={'w-full p-2 rounded-lg'}>
    <Row label={player.name}>{}</Row>
    <Row label={'Level'} alt={true} heading={true}>{1}</Row>
    <Row label={'XP'}>{player.experience_points}</Row>
    <Row label={'HP'} alt={true}>{`${player.hitpoints}/${player.max_hitpoints}`}</Row>
    <Row label={'Age'}>{player.age}</Row>
    <Row label={'Gender'} alt={true}>{player.gender}</Row>
    <Row label={'Alignment'}>{player.alignment}</Row>
    <Row label={'Race'} alt={true}>{player.race}</Row>
    <Row label={'Class'}>{player.character_class}</Row>
    <Row label={''} ></Row>

    <Row label={<Tabbed 
      className={'w-full '} 
      tabClassName={'px-2 hover:text-red-500'} 
      activeTabClassName={'px-2 text-red-500'}
      tabs={[
      {label: 'Attributes', content: <Attributes player={player} />},
      {label: 'Skills', content: <Skills player={player} />},
      {label: 'Inventory', content: <Inventory player={player} />},
      {label: 'Backstory', content: <Backstory player={player} />}
    ]} />} alt={true} heading={true}></Row>


  </div>
}