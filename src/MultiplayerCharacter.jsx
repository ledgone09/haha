import React, { useEffect, useMemo, useRef } from 'react';
import { useGraph, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, Text } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';

const MultiplayerCharacterModel = ({ player, ...props }) => {
  const group = useRef();
  const { materials, animations, scene } = useGLTF('/character.glb');
  
  // Clone the scene for each player instance
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes } = useGraph(clone);
  
  const { actions } = useAnimations(animations, group);
  const animState = useRef({
    currentAnimation: '',
    targetRotation: new THREE.Quaternion(),
  });

  // Create player-specific materials
  const playerBodyMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(player.color.r, player.color.g, player.color.b),
    emissive: new THREE.Color(player.color.r * 0.3, player.color.g * 0.3, player.color.b * 0.3),
    emissiveIntensity: 0.1,
  }), [player.color]);

  const facialMaterial = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: new THREE.Color(0.8, 0.8, 0.8) 
  }), []);

  // Handle animations
  useFrame((state, delta) => {
    if (!group.current) return;

    const { currentAnimation } = animState.current;
    const animation = player.moving ? 'run' : 'idle';

    // Switch animation if needed
    if (currentAnimation !== animation) {
      actions[currentAnimation]?.fadeOut(0.2);
      actions[animation]?.reset().play().fadeIn(0.2);
      animState.current.currentAnimation = animation;
    }

    // Smooth position interpolation
    if (player.position) {
      const currentPos = group.current.parent.position;
      const targetPos = new THREE.Vector3(player.position.x, player.position.y, player.position.z);
      
      // Interpolate position for smooth movement
      currentPos.lerp(targetPos, delta * 10);
    }

    // Handle rotation based on movement
    if (player.rotation && player.moving) {
      const targetQuat = new THREE.Quaternion(
        player.rotation.x,
        player.rotation.y,
        player.rotation.z,
        player.rotation.w || 1
      );
      
      group.current.quaternion.slerp(targetQuat, delta * 5);
    }
  });

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="MultiplayerDegenArmature" rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
        <primitive object={nodes.mixamorigHips} />
        <skinnedMesh
          name="multiplayerBody"
          geometry={nodes.body.geometry}
          material={playerBodyMaterial}
          skeleton={nodes.body.skeleton}
          castShadow
        />
        <skinnedMesh
          name="multiplayerLeftEye"
          geometry={nodes.eyel.geometry}
          material={facialMaterial}
          skeleton={nodes.eyel.skeleton}
        />
        <skinnedMesh
          name="multiplayerRightEye"
          geometry={nodes.eyer.geometry}
          material={facialMaterial}
          skeleton={nodes.eyer.skeleton}
        />
        <skinnedMesh
          name="multiplayerMouth"
          geometry={nodes.mouth.geometry}
          material={facialMaterial}
          skeleton={nodes.mouth.skeleton}
        />
      </group>
      
      {/* Player username floating above */}
      <Text
        position={[0, 2.5, 0]}
        color={new THREE.Color(player.color.r, player.color.g, player.color.b)}
        anchorX="center"
        anchorY="middle"
        fontSize={0.3}
        font="./fonts/nickname.otf"
        outlineWidth={0.02}
        outlineColor="#000000"
        maxWidth={3}
        textAlign="center"
      >
        {player.username}
        {player.stats && `\nLv.${player.stats.degenLevel}`}
      </Text>
    </group>
  );
};

export const MultiplayerCharacter = ({ player }) => {
  const rigidBodyRef = useRef();
  
  // Initialize position from player data
  const initialPosition = useMemo(() => [
    player.position?.x || 0,
    player.position?.y || 0,
    player.position?.z || 0
  ], []);

  useEffect(() => {
    if (rigidBodyRef.current && player.position) {
      // Update rigid body position when player moves
      rigidBodyRef.current.setTranslation({
        x: player.position.x,
        y: player.position.y,
        z: player.position.z
      }, false);
    }
  }, [player.position]);

  return (
    <RigidBody
      ref={rigidBodyRef}
      type="kinematicPosition"
      position={initialPosition}
      colliders={false}
      userData={{ type: 'multiplayerCharacter', playerId: player.id }}
    >
      <CapsuleCollider 
        args={[0.8, 0.4]} 
        position={[0, 1.2, 0]}
      />
      <MultiplayerCharacterModel player={player} />
    </RigidBody>
  );
}; 