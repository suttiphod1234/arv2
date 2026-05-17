import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei';

function Model() {
  // Load the GLB model from the public folder
  const { scene } = useGLTF('/Food_and_Beverage_Service_AR_Training_Restaurant.glb');
  return <primitive object={scene} scale={1} position={[0, 0, 0]} />;
}

function RestaurantScene() {
  return (
    <div className="w-full h-full bg-[#050811]">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 2, 5]} fov={50} />
        <OrbitControls enableDamping maxPolarAngle={Math.PI / 2 - 0.05} minDistance={1} maxDistance={20} />
        
        {/* Lights */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#D4AF37" />
        
        {/* Scene Objects */}
        <Suspense fallback={
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#D4AF37" wireframe />
          </mesh>
        }>
          <Model />
        </Suspense>
        
        {/* Grid helper for AR feel */}
        <gridHelper args={[20, 20, '#D4AF37', '#1E293B']} position={[0, -0.01, 0]} opacity={0.2} transparent />
      </Canvas>
    </div>
  );
}

export default RestaurantScene;
useGLTF.preload('/Food_and_Beverage_Service_AR_Training_Restaurant.glb');
