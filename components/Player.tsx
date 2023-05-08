import React from 'react'
import Row from './Row'
import Tabbed from './controls/Tabbed'
import { useGm } from '../hooks/useGameMaster'
import { Character } from '@/hooks/useApi'

function Attributes({player}: {player: Character}) {
  return <div>
    <Row label={'Strength'} alt={true} heading={true}>{player.attributes.strength}</Row>
    <Row label={'Dexterity'}>{player.attributes.dexterity}</Row>
    <Row label={'Constitution'} alt={true}>{player.attributes.constitution}</Row>
    <Row label={'Inteligence'}>{player.attributes.intelligence}</Row>
    <Row label={'Wisdom'} alt={true}>{player.attributes.wisdom}</Row>
    <Row label={'Charisma'}>{player.attributes.charisma}</Row>
  </div>
}

function Skills({player}: {player: Character}) {
  return <div>
    {player.skills.map((skill, index) => 
      <Row key={index} label={skill.name} alt={!Boolean(index % 2)} heading={!index}>{`${skill.modifier > 0 ? '+' : ''}${skill.modifier}`}</Row>
    )}
  </div>
}

function Inventory({player}: {player: Character}) {
  return <div>
    {player.inventory.map((item, index) => 
      <Row key={index} label={item.item} alt={!Boolean(index % 2)} heading={!index}>{item.count}</Row>
    )}
  </div>
}

function Backstory({player}: {player: Character}) {
  return <div className={'px-2'}>{player.backstory}</div>
}

export default function Player({player}: {player: Character}) {
  const {sync} = useGm()

  return <div className={'w-full p-2 rounded-lg'}>
    <Row label={player.name}>{
      <div className={`w-[6px] h-[6px] rounded-full ${sync ? 'bg-red-400 animate-pulse' : ''}`} title={sync ? 'Updating character sheet' : ''} />
    }</Row>
    <Row label={'Level'} alt={true} heading={true}>{1}</Row>
    <Row label={'XP'}>{player.experience_points}</Row>
    <Row label={'HP'} alt={true}>{`${player.hitpoints}/${player.max_hitpoints}`}</Row>
    <Row label={'Age'}>{player.age}</Row>
    <Row label={'Gender'} alt={true}>{player.gender}</Row>
    <Row label={'Alignment'}>{player.alignment}</Row>
    <Row label={'Race'} alt={true}>{player.race}</Row>
    <Row label={'Class'}>{player.character_class}</Row>
    <Row label={''} ></Row>

    <Tabbed 
      className={'w-full'} 
      tabClassName={'pr-3 hover:text-red-500'} 
      activeTabClassName={'pr-3 text-red-500 underline'}
      tabs={[
      {label: 'Attributes', content: <Attributes player={player} />},
      {label: 'Skills', content: <Skills player={player} />},
      {label: 'Inventory', content: <Inventory player={player} />},
      {label: 'Backstory', content: <Backstory player={player} />}
    ]} />

  </div>
}