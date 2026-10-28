import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { useRef, useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, ScrollView } from 'react-native';
import Joystick from './components/Joystick';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BLOCKS = [
  { id: 'grass', color: 0x6aa84f, name: 'GRASS' },
  { id: 'dirt', color: 0x8b5a2b, name: 'DIRT' },
  { id: 'stone', color: 0x9e9e9e, name: 'STONE' },
  { id: 'wood', color: 0x5d4037, name: 'WOOD' },
  { id: 'sand', color: 0xe6d5a7, name: 'SAND' },
];

export default function App() {
  const [move, setMove] = useState({ x: 0, y: 0 });
  const [health, setHealth] = useState(10);
  const [hunger, setHunger] = useState(10);
  const [selected, setSelected] = useState(0);
  const [zombiesKilled, setZombiesKilled] = useState(0);
  const [playersOnline, setPlayersOnline] = useState(1);
  
  const cameraRef = useRef();
  const sceneRef = useRef();
  const blocksRef = useRef([]);
  const zombiesRef = useRef([]);
  const rendererRef = useRef();
  const timeRef = useRef(0);
  const isNightRef = useRef(false);

  const onContextCreate = async (gl) => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.FogExp2(0x87CEEB, 0.01);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 1000);
    camera.position.set(0, 3, 8);
    cameraRef.current = camera;

    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    rendererRef.current = renderer;

    const sun = new THREE.DirectionalLight(0xfff4e5, 1.5);
    sun.castShadow = true; sun.shadow.mapSize.set(2048,2048);
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    // GROUND
    const ground = new THREE.Mesh(new THREE.BoxGeometry(500,2,500), new THREE.MeshStandardMaterial({ color: 0x4a7c3a, roughness: 0.9 }));
    ground.position.y=-1; ground.receiveShadow=true; scene.add(ground);

    // WORLD + TREES
    for(let i=0;i<120;i++){
      const type = BLOCKS[Math.floor(Math.random()*4)];
      const b = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshStandardMaterial({ color: type.color }));
      b.position.set((Math.random()-0.5)*80, Math.floor(Math.random()*4), (Math.random()-0.5)*80);
      b.castShadow=true; scene.add(b); blocksRef.current.push(b);
    }
    for(let i=0;i<25;i++){
      const trunk = new THREE.Mesh(new THREE.BoxGeometry(0.8,5,0.8), new THREE.MeshStandardMaterial({ color: 0x4e342e }));
      const x=(Math.random()-0.5)*70, z=(Math.random()-0.5)*70;
      trunk.position.set(x,1.5,z); trunk.castShadow=true; scene.add(trunk); blocksRef.current.push(trunk);
      const leaves = new THREE.Mesh(new THREE.BoxGeometry(3,3,3), new THREE.MeshStandardMaterial({ color: 0x2e7d32 }));
      leaves.position.set(x,5,z); scene.add(leaves); blocksRef.current.push(leaves);
    }

    // ZOMBIES SPAWNER
    const spawnZombie = () => {
      const z = new THREE.Mesh(new THREE.BoxGeometry(0.8,1.8,0.8), new THREE.MeshStandardMaterial({ color: 0x3a5f0b }));
      z.position.set((Math.random()-0.5)*40, 0.9, (Math.random()-0.5)*40);
      z.castShadow=true; z.userData = { health: 3, type: 'zombie' };
      scene.add(z); zombiesRef.current.push(z);
    };
    for(let i=0;i<5;i++) spawnZombie();

    let last = Date.now();
    const animate = () => {
      requestAnimationFrame(animate);
      const delta = (Date.now()-last)/1000; last=Date.now();
      timeRef.current += delta*0.08;
      const isNight = Math.cos(timeRef.current) < 0;
      isNightRef.current = isNight;

      sun.position.x = Math.sin(timeRef.current)*100;
      sun.position.y = Math.cos(timeRef.current)*100;
      sun.intensity = isNight?0.15:1.5;
      scene.background = new THREE.Color(isNight?0x0a0a23:0x87CEEB);

      // PLAYER MOVE
      if(cameraRef.current){
        const fwd=new THREE.Vector3(); cameraRef.current.getWorldDirection(fwd); fwd.y=0; fwd.normalize();
        const right=new THREE.Vector3().crossVectors(fwd,new THREE.Vector3(0,1,0)).negate();
        cameraRef.current.position.addScaledVector(fwd,-move.y*delta*6);
        cameraRef.current.position.addScaledVector(right,move.x*delta*6);
        if(cameraRef.current.position.y<2) cameraRef.current.position.y=2;
      }

      // ZOMBIES AI - Chase player
      zombiesRef.current.forEach(zombie=>{
        if(!cameraRef.current) return;
        const dir = new THREE.Vector3().subVectors(cameraRef.current.position, zombie.position);
        const dist = dir.length();
        dir.normalize();
        if(dist<15){ // Chase if close
          zombie.position.addScaledVector(dir, delta*1.2);
          zombie.lookAt(cameraRef.current.position);
          if(dist<1.5 && Math.random()<0.02){ // Attack
            setHealth(h=>Math.max(0,h-0.5));
          }
        }
      });

      // Hunger drain
      if(Math.random()<0.002) setHunger(h=>Math.max(0,h-0.1));

      renderer.render(scene,camera);
      gl.endFrameEXP();
    };
    animate();

    // MULTIPLAYER MOCK - Replace with real server later
    setInterval(()=>{ if(Math.random()<0.3) setPlayersOnline(p=>Math.min(10,p+Math.floor(Math.random()*2))) }, 5000);
  };

  const attack = () => {
    const ray = new THREE.Raycaster();
    ray.set(cameraRef.current.position, new THREE.Vector3(0,0,-1).applyQuaternion(cameraRef.current.quaternion));
    const hits = ray.intersectObjects([...blocksRef.current, ...zombiesRef.current]);
    if(hits[0]){
      if(hits[0].object.userData.type==='zombie'){
        hits[0].object.userData.health--;
        hits[0].object.material.color.set(0xff0000);
        setTimeout(()=>hits[0].object.material.color.set(0x3a5f0b),100);
        if(hits[0].object.userData.health<=0){
          sceneRef.current.remove(hits[0].object);
          zombiesRef.current = zombiesRef.current.filter(z=>z!==hits[0].object);
          setZombiesKilled(k=>k+1);
        }
      } else {
        sceneRef.current.remove(hits[0].object);
        blocksRef.current = blocksRef.current.filter(b=>b!==hits[0].object);
      }
    }
  };

  const placeBlock = () => {
    const type = BLOCKS[selected];
    const b = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshStandardMaterial({ color: type.color }));
    const dir = new THREE.Vector3(0,0,-4).applyQuaternion(cameraRef.current.quaternion);
    b.position.copy(cameraRef.current.position).add(dir);
    b.position.set(Math.round(b.position.x), Math.round(b.position.y), Math.round(b.position.z));
    b.castShadow=true; sceneRef.current.add(b); blocksRef.current.push(b);
  };

  if(health<=0) return <View style={{ flex:1, backgroundColor:'black', justifyContent:'center', alignItems:'center' }}><Text style={{ color:'red', fontSize:30, fontWeight:'bold' }}>YOU DIED</Text><Text style={{ color:'white', marginTop:10 }}>Killed {zombiesKilled} zombies</Text><TouchableOpacity onPress={()=>{ setHealth(10); setHunger(10); }} style={{ marginTop:20, backgroundColor:'white', padding:15, borderRadius:10 }}><Text>RESPAWN</Text></TouchableOpacity></View>;

  return (
    <View style={{ flex: 1 }}>
      <GLView style={{ flex: 1 }} onContextCreate={onContextCreate} />
      <Joystick onMove={setMove} />
      
      {/* SURVIVAL HUD */}
      <View style={{ position:'absolute', top:45, left:15, right:15, flexDirection:'row', justifyContent:'space-between' }}>
        <View style={{ backgroundColor:'rgba(0,0,0,0.7)', padding:10, borderRadius:10 }}>
          <Text style={{ color:'white' }}>❤️ {health.toFixed(1)}/10  🍗 {hunger.toFixed(0)}/10</Text>
          <Text style={{ color:'#aaa', fontSize:11 }}>🧟 Killed: {zombiesKilled} | {isNightRef.current?'🌙 NIGHT - ZOMBIES!':'☀️ DAY'}</Text>
        </View>
        <View style={{ backgroundColor:'rgba(0,0,0,0.7)', padding:10, borderRadius:10 }}>
          <Text style={{ color:'#00ff00', fontWeight:'bold' }}>● {playersOnline} ONLINE</Text>
          <Text style={{ color:'#aaa', fontSize:10 }}>MULTIPLAYER</Text>
        </View>
      </View>

      <ScrollView horizontal style={{ position: 'absolute', bottom: 10, left: 10, right: 140 }} contentContainerStyle={{ flexDirection: 'row', gap: 8 }}>
        {BLOCKS.map((b,i)=>(
          <TouchableOpacity key={b.id} onPress={()=>setSelected(i)} style={{ width: 50, height: 50, backgroundColor: selected===i?'#fff':'rgba(0,0,0,0.6)', borderRadius: 8, borderWidth: selected===i?3:1, borderColor: selected===i?'#00ff00':'#555', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: 26, height: 26, backgroundColor: `#${b.color.toString(16).padStart(6,'0')}`, borderRadius: 4 }} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity onPress={attack} style={{ position: 'absolute', right: 15, bottom: 130, backgroundColor: '#ff3b30', padding: 18, borderRadius: 50, width: 70, height: 70, justifyContent:'center', alignItems:'center' }}>
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 20 }}>⚔️</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={placeBlock} style={{ position: 'absolute', right: 15, bottom: 50, backgroundColor: '#4caf50', padding: 16, borderRadius: 12 }}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>PLACE</Text>
      </TouchableOpacity>
    </View>
  );
}