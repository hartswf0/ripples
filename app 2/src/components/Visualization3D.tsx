// RIPPLES: 3D Visualization - Three.js rendering of the ecology
// Real-time rendering of entity movements and connections

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import type { Entity, VectorType, Ripple } from '@/types';

interface Visualization3DProps {
  entities: Entity[];
  selectedEntity: Entity | null;
  lastRipple: Ripple | null;
  showConnections: boolean;
  showMemory: boolean;
  onEntityClick: (entity: Entity) => void;
}

// Entity node in 3D space
function EntityNode({ 
  entity, 
  isSelected, 
  isAffected, 
  lastVector,
  onClick 
}: { 
  entity: Entity; 
  isSelected: boolean;
  isAffected: boolean;
  lastVector: VectorType | null;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  // Color based on entity type
  const color = useMemo(() => {
    switch (entity.type) {
      case 'animate': return '#4ade80'; // entity-green
      case 'inanimate': return '#a1a1aa'; // muted
      case 'abstract': return '#c084fc'; // purple
      case 'weather': return '#60a5fa'; // blue
      case 'geological': return '#92400e'; // brown
      case 'temporal': return '#f472b6'; // pink
      default: return '#a1a1aa';
    }
  }, [entity.type]);
  
  // Glow color based on last vector
  const glowColor = useMemo(() => {
    if (!lastVector) return 'transparent';
    switch (lastVector) {
      case 'GOAL': return '#fbbf24'; // goal-gold
      case 'OBSTACLE': return '#f87171'; // obstacle-red
      case 'SHIFT': return '#22d3ee'; // shift-cyan
      default: return 'transparent';
    }
  }, [lastVector]);
  
  // Animation
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = entity.position.y / 10 + Math.sin(state.clock.elapsedTime + entity.position.x) * 0.1;
      
      // Pulse if selected
      if (isSelected) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
        meshRef.current.scale.setScalar(scale);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
    
    if (glowRef.current && glowColor !== 'transparent') {
      glowRef.current.scale.setScalar(1.5 + Math.sin(state.clock.elapsedTime * 5) * 0.2);
    }
  });
  
  // Size based on energy
  const size = 0.3 + (entity.energy / 100) * 0.4;
  
  return (
    <group position={[entity.position.x / 10 - 5, entity.position.y / 10 - 5, entity.position.z ? entity.position.z / 10 : 0]}>
      {/* Glow effect */}
      {(isSelected || isAffected) && (
        <mesh ref={glowRef}>
          <sphereGeometry args={[size * 1.5, 16, 16]} />
          <meshBasicMaterial color={glowColor} transparent opacity={0.3} />
        </mesh>
      )}
      
      {/* Main sphere */}
      <mesh 
        ref={meshRef}
        onClick={onClick}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'default'; }}
      >
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial 
          color={color} 
          emissive={isSelected ? color : '#000000'}
          emissiveIntensity={isSelected ? 0.5 : 0}
        />
      </mesh>
      
      {/* Entity label */}
      <Text
        position={[0, size + 0.3, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="bottom"
      >
        {entity.name}
      </Text>
      
      {/* State label */}
      <Text
        position={[0, size + 0.1, 0]}
        fontSize={0.12}
        color="#888888"
        anchorX="center"
        anchorY="bottom"
      >
        {entity.state}
      </Text>
      
      {/* Energy indicator */}
      <mesh position={[0, -size - 0.2, 0]}>
        <boxGeometry args={[size * 2, 0.05, 0.05]} />
        <meshBasicMaterial color="#333333" />
      </mesh>
      <mesh position={[-size + (size * entity.energy / 100), -size - 0.2, 0]}>
        <boxGeometry args={[size * 2 * (entity.energy / 100), 0.05, 0.05]} />
        <meshBasicMaterial color={entity.energy > 70 ? '#4ade80' : entity.energy > 30 ? '#fbbf24' : '#f87171'} />
      </mesh>
      
      {/* Memory indicators */}
      {entity.memory.length > 0 && (
        <group position={[size + 0.2, 0, 0]}>
          {entity.memory.slice(-3).map((mem, i) => (
            <mesh key={i} position={[0, i * 0.15, 0]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial 
                color={mem.vector === 'GOAL' ? '#fbbf24' : mem.vector === 'OBSTACLE' ? '#f87171' : '#22d3ee'} 
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

// Connection line between entities
function ConnectionLine({ 
  from, 
  to, 
  isActive 
}: { 
  from: Entity; 
  to: Entity; 
  isActive: boolean;
}) {
  const points = useMemo(() => {
    return [
      [from.position.x / 10 - 5, from.position.y / 10 - 5, from.position.z ? from.position.z / 10 : 0],
      [to.position.x / 10 - 5, to.position.y / 10 - 5, to.position.z ? to.position.z / 10 : 0]
    ];
  }, [from, to]);
  
  return (
    <Line
      points={points as [number, number, number][]}
      color={isActive ? '#4ade80' : '#333333'}
      lineWidth={isActive ? 2 : 1}
      transparent
      opacity={isActive ? 0.8 : 0.3}
    />
  );
}

// Ripple effect visualization
function RippleEffect({ ripple }: { ripple: Ripple | null }) {
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (ringRef.current && ripple) {
      const age = (Date.now() - ripple.timestamp) / 1000;
      const scale = 1 + age * 2;
      const opacity = Math.max(0, 1 - age);
      
      ringRef.current.scale.setScalar(scale);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = opacity * 0.5;
    }
  });
  
  if (!ripple) return null;
  
  const color = ripple.vector === 'GOAL' ? '#fbbf24' : 
                ripple.vector === 'OBSTACLE' ? '#f87171' : '#22d3ee';
  
  return (
    <mesh 
      ref={ringRef}
      position={[
        ripple.sourceEntity.position.x / 10 - 5,
        ripple.sourceEntity.position.y / 10 - 5,
        ripple.sourceEntity.position.z ? ripple.sourceEntity.position.z / 10 : 0
      ]}
    >
      <ringGeometry args={[0.5, 0.6, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
    </mesh>
  );
}

// Scene component
function Scene({ 
  entities, 
  selectedEntity, 
  lastRipple, 
  showConnections,
  onEntityClick 
}: Omit<Visualization3DProps, 'showMemory'>) {
  // Calculate connections
  const connections = useMemo(() => {
    if (!showConnections) return [];
    
    const conns: { from: Entity; to: Entity }[] = [];
    entities.forEach(entity => {
      entity.adjacency.forEach(adjId => {
        const adjEntity = entities.find(e => e.id === adjId);
        if (adjEntity && entity.id < adjEntity.id) { // Avoid duplicates
          conns.push({ from: entity, to: adjEntity });
        }
      });
    });
    return conns;
  }, [entities, showConnections]);
  
  // Get last vector for each entity
  const entityLastVectors = useMemo(() => {
    const vectors: Record<string, VectorType> = {};
    entities.forEach(entity => {
      if (entity.memory.length > 0) {
        vectors[entity.id] = entity.memory[entity.memory.length - 1].vector;
      }
    });
    return vectors;
  }, [entities]);
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#4ade80" />
      
      {/* Grid */}
      <gridHelper args={[20, 20, '#333333', '#222222']} position={[0, -6, 0]} />
      
      {/* Connections */}
      {connections.map((conn, i) => (
        <ConnectionLine
          key={i}
          from={conn.from}
          to={conn.to}
          isActive={selectedEntity?.id === conn.from.id || selectedEntity?.id === conn.to.id}
        />
      ))}
      
      {/* Entities */}
      {entities.map(entity => (
        <EntityNode
          key={entity.id}
          entity={entity}
          isSelected={selectedEntity?.id === entity.id}
          isAffected={lastRipple?.targetEntities.some(e => e.id === entity.id) || false}
          lastVector={entityLastVectors[entity.id] || null}
          onClick={() => onEntityClick(entity)}
        />
      ))}
      
      {/* Ripple effect */}
      <RippleEffect ripple={lastRipple} />
      
      {/* Controls */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={20}
      />
    </>
  );
}

export function Visualization3D({
  entities,
  selectedEntity,
  lastRipple,
  showConnections,
  onEntityClick
}: Visualization3DProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 5, 10], fov: 60 }}
        style={{ background: '#050505' }}
      >
        <Scene
          entities={entities}
          selectedEntity={selectedEntity}
          lastRipple={lastRipple}
          showConnections={showConnections}
          onEntityClick={onEntityClick}
        />
      </Canvas>
    </div>
  );
}
