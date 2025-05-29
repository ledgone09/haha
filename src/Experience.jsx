// import { Perf } from "r3f-perf";
import { Environment, Text } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { useEffect } from 'react';
import { Character } from './Character';
import { Sea } from './Sea';
import { World } from './World';
import { Npc } from './Npc';
import { Arcade } from './Arcade';
import { MultiplayerCharacter } from './MultiplayerCharacter';
import useMultiplayer from './stores/useMultiplayer';
import { useMultiplayerEvents } from './hooks/useMultiplayerEvents';

export default function Experience() {
  const { 
    connect, 
    otherPlayers, 
    isConnected, 
    getOtherPlayersArray 
  } = useMultiplayer();

  // Initialize multiplayer events
  useMultiplayerEvents();

  // Initialize multiplayer connection
  useEffect(() => {
    connect();
  }, [connect]);

  const otherPlayersArray = getOtherPlayersArray();

  return (
    <>
      <color args={['#40dbf7']} attach="background" />
      {/* <Perf position="bottom-left" /> */}
      <Environment preset="apartment" />
      <Physics timeStep={'vary'} debug={false}>
        <Character />
        
        {/* Render other players */}
        {otherPlayersArray.map((player) => (
          <MultiplayerCharacter 
            key={player.id} 
            player={player} 
          />
        ))}
        
        <RigidBody
          colliders="trimesh"
          type="fixed"
          restitution={0.2}
          friction={1}
        >
          <World />
        </RigidBody>
        <Sea />
        <Npc
          position={[-32.5, -1, -45]}
          color={{
            r: 0.06, // Pump.fun green
            g: 1.0,
            b: 0.65,
          }}
        />
        <Arcade position={[-7.1, -2.4, -85.6]} />
      </Physics>
      <Text
        color="#06FFA5"
        anchorX="center"
        anchorY="middle"
        position={[-2.75, 1.3, -13.5]}
        rotation-y={0.28}
        fontSize={0.35}
        font="./fonts/nickname.otf"
        maxWidth={4}
        textAlign="center"
      >
        PUMP.FUN{'\n'}WORLD! 🚀
        {isConnected && `\n${otherPlayersArray.length + 1} Players Online`}
      </Text>
    </>
  );
}
