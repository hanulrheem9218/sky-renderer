<script setup lang="ts">
import { onMounted, ref} from 'vue'
import Renderer from '../utils/renderer.ts';
import * as Three from 'three';
import { MODEL } from '../utils/modelPath';
import { IMAGE } from '../utils/imagePath';
import type { Water } from 'three/examples/jsm/Addons.js';


defineProps<{ msg: string }>()

const rendererEngine = new Renderer(window,document);
var sceneLoading = ref(true);
var loadingText= ref("Loading");
var loadingValue = ref(0);
//override renderer engien
rendererEngine.checkAllAssetsLoaded = ()=>{
  const allLoaded = rendererEngine.loadObjects.every((obj) => !obj.isLoading);
  if(allLoaded){
    sceneLoading.value = false;
    loadingText.value = "Complete";
    const scene = document.querySelector(".renderer") as HTMLDivElement;
    scene.style.opacity = "1";
  }
}

onMounted(()=>{
  rendererEngine.registerRenderer();
  rendererEngine.registerPostProcessing();
  rendererEngine.addParticleSystem({
    numberOfParticles: 1000,
    particlePosition: new Three.Vector3(0,0,0),
    range: {
      min: 500,
      max: 500
    },
    minHeight: 150,
    texture: IMAGE.SNOWPARTICLE
  });
  rendererEngine.skyboxEXR(IMAGE.CLOUDYSKY);
  var water = rendererEngine.waterObject(IMAGE.WATER);  
 // var gameObject:Promise<Three.Object3D<Three.Object3DEventMap>> = renderer.gltfObject(objectPath.href);
  var bridge = rendererEngine.gltfObject(MODEL.BRIDGE);
  var rock = rendererEngine.gltfObject(MODEL.GROUND);
  var television = rendererEngine.gltfObject(MODEL.TELEVISION);
  var metalCan = rendererEngine.gltfObject(MODEL.METALCAN);
  var plantBox = rendererEngine.gltfObject(MODEL.PLANTBOX);
  var radio = rendererEngine.gltfObject(MODEL.RADIO);
  var marvelFace = rendererEngine.gltfObject(MODEL.MARVELFACE);
  var lateral = rendererEngine.gltfObject(MODEL.LATERAL);
  var lateral1 = rendererEngine.gltfObject(MODEL.LATERAL);
  var tower = rendererEngine.gltfObject(MODEL.TOWER);
  var tower1 = rendererEngine.gltfObject(MODEL.TOWER);
  var tower2 = rendererEngine.gltfObject(MODEL.TOWER);
  var mountain = rendererEngine.gltfObject(MODEL.SNOWMOUNTAIN);
  var boat = rendererEngine.gltfObject(MODEL.BOAT);
  var fishingBoat = rendererEngine.gltfObject(MODEL.FISHINGBOAT);

  //var lantern = rendererEngine.gltfObject(MODEL.LANTERN);
  var lantern1 = rendererEngine.gltfObject(MODEL.LANTERN);
  const lanternLight1 = new Three.PointLight(0xFFAA00,1,25);
  rendererEngine.init(()=>{
    //   gameObject.then((model)=>{model.position.set(0,10,0);})
      rendererEngine.directionalLight();
      const ambientLight = new Three.AmbientLight(0x404040, 0.1); // Dim ambient light (low intensity)
      rendererEngine.scene.add(ambientLight);

      rendererEngine.perspectiveCamera.position.set(0,10,120);
      //setting up the gltf objects
      rock.then((model)=> {
        model.position.set(0,-3,110);
        model.scale.set(1,1,1);
        model.rotation.y = 130 *(Math.PI /180);
      })
      bridge.then((model)=>{
        model.position.set(0,-6,70);
        model.scale.set(4,4,4);
        model.rotation.y = -180 * (Math.PI/ 180);
      })
      television.then((model)=> {
        model.position.set(-1,4.5,70);
        model.scale.set(6,6,6);
        model.rotation.y = 0 * (Math.PI/ 180);
      })
      metalCan.then((model)=>{
        model.position.set(10,4.4,90);
        model.scale.set(6,6,6);
        model.rotation.y = 90 * (Math.PI/ 180);
        model.rotation.x = 20 * (Math.PI/ 180);
      });
      plantBox.then((model)=>{
        model.position.set(-20,-3,80);
        model.scale.set(5,5,5);
        model.rotation.y = 30 * (Math.PI/ 180);
        model.rotation.x = 20 * (Math.PI/ 180);
      })
      radio.then((model)=>{
        model.position.set(3,4.5,70);
        model.scale.set(6,6,6);
        model.rotation.y = -45 * (Math.PI/ 180);
      })
      marvelFace.then((model)=> {
        model.position.set(-1,7,70);
        model.scale.set(6,6,6);
        model.rotation.y = 0 * (Math.PI/ 180);
      })
      lateral.then((model)=>{
        model.position.set(-20, -2,70);
        model.scale.set(1,1,1);
        model.rotation.y = 40 * (Math.PI / 180);
      })

      tower.then((model)=>{
        model.position.set(50, -2,-60);
        model.scale.set(35,35,35);
        model.rotation.y = 40 * (Math.PI / 180);
        model.rotation.x = 20 * (Math.PI /180);
      })

      tower1.then((model)=>{
        model.position.set(80, -2,-100);
        model.scale.set(35,35,35);
        model.rotation.y = 60 * (Math.PI / 180);
        model.rotation.x = 50 * (Math.PI /180);
      })
      tower2.then((model)=>{
        model.position.set(90, -9,10);
        model.scale.set(35,35,35);
        model.rotation.y = 20 * (Math.PI / 180);
        model.rotation.x = -50 * (Math.PI /180);
        model.rotation.z = 10 * (Math.PI /180);
      })

      boat.then((model) => {
        model.position.set(50, 1.5,10);
        model.scale.set(10,10,10);
        model.rotation.y = -40 * (Math.PI / 180);
        //model.rotation.x = -50 * (Math.PI /180);
        //model.rotation.z = 10 * (Math.PI /180);
      })

      fishingBoat.then((model)=>{
        model.position.set(-70,-2.2,-50);
        model.scale.set(0.07,0.07,0.07);
        model.rotation.y = 55 * (Math.PI / 180);
      })

      mountain.then((model)=>{
        model.position.set(0,-10,-1400);
        model.rotation.y = -90 * (Math.PI / 180);
        model.scale.set(1,1,1);
      })
      //lantern.then((model)=> {
      //  const lanternPos = new Three.Vector3(-3,5,100);
      //  lanternLight.position.set(lanternPos.x,lanternPos.y,lanternPos.z);
      //  lanternLight.castShadow = true;
      //  model.position.set(lanternPos.x,lanternPos.y -0.5, lanternPos.z);
      //  model.scale.set(4,4,4);
      //  model.rotation.y = 30 * (Math.PI/ 180);
      //  rendererEngine.scene.add(lanternLight);
      //  
      //})
      lantern1.then((model)=> {
        const lanternPos = new Three.Vector3(3,5,90);
        lanternLight1.position.set(lanternPos.x,lanternPos.y,lanternPos.z);
        lanternLight1.castShadow = true;
        model.position.set(lanternPos.x,lanternPos.y -0.5, lanternPos.z);
        model.scale.set(4,4,4);
        model.rotation.y = 60 * (Math.PI/ 180);
        rendererEngine.scene.add(lanternLight1);
        
      })
     // cassette.then((model) => {
     //   const cassettePosition = new Three.Vector3(0,5,140);
     //   model.position.set(cassettePosition.x,cassettePosition.y,cassettePosition.z);
     //   model.scale.set(3,3,3);
     //   model.rotation.x = 0 * (Math.PI/180);
     //   model.rotation.y = 0* (Math.PI/180);
     //   model.rotation.z = 60 * (Math.PI/180);
     // })
  });


  rendererEngine.update((deltaTime:number)=>{
    if(loadingValue.value != 1){
      loadingValue.value = rendererEngine.loadingAmount;
    }
   // lanternLight.intensity =  deltaTime / 5000 * Math.random() * 0.8 + 1;
    lanternLight1.intensity =  deltaTime / 5000 * Math.random() * 0.3 + 1;
    rendererEngine.updateParticleSystem();
    water.material.uniforms['time'].value = (deltaTime  /1000)* 0.5;
    metalCan.then((model)=>{
      model.position.x = Math.sin(deltaTime / 1000) * 0.3 + 10;
      model.position.y = Math.sin(deltaTime / 1000) * 0.3 - 2.4;
      model.position.z = Math.cos(deltaTime / 1000) * 0.3 + 90;
      
      model.rotation.x = Math.sin(deltaTime/1000) * 5 * (Math.PI/180);
    })

    plantBox.then((model)=>{
      model.position.x = Math.sin(deltaTime / 1000) * 0.8 - 20;
      model.position.y = Math.cos(deltaTime / 1000) * 0.3 - 3;
      model.position.z = Math.cos(deltaTime / 1000) * 0.8 + 80;
      
      model.rotation.x = Math.cos(deltaTime/3000) * 10 * (Math.PI/180);
      })

    lateral1.then((model)=>{
    model.position.x = Math.sin(deltaTime / 1000) * 1.2 - 70;
    model.position.y = Math.cos(deltaTime / 4000) * 0.3 - 2.5;
    model.position.z = Math.cos(deltaTime / 1000) * 1.2 -10;
    model.rotation.x = Math.cos(deltaTime/ 1000) * 5 * (Math.PI/180);
    })
    lateral.then((model)=>{
    model.position.x = Math.sin(deltaTime / 1000) * 1.2 - 40;
    model.position.y = Math.cos(deltaTime / 4000) * 0.3 - 2.5;
    model.position.z = Math.cos(deltaTime / 1000) * 1.2 - 70;
    model.rotation.x = Math.cos(deltaTime/ 1000) * 5 * (Math.PI/180);
    })

    boat.then((model) => {
        model.rotation.x =  Math.cos(deltaTime/1000) * 5 * (Math.PI/180);
        model.rotation.z =  Math.cos(deltaTime/1000) * 5 * (Math.PI/180);
        model.rotation.y =  Math.cos(deltaTime/1000) * 2 * (Math.PI/180);
        model.position.y = Math.cos(deltaTime /1000) * 0.2 +1.5;
    })

    fishingBoat.then((model)=>{
      model.rotation.x = Math.cos(deltaTime /3000) * 2 * (Math.PI/180);
      model.position.y = Math.sin(deltaTime / 1000) * 0.5 -2.2;
      model.rotation.z = Math.cos(deltaTime /3000) * 2 * (Math.PI/180);
      })
  });
})


</script>

<template>

  <div v-if="sceneLoading" class="scene-loader">
    <p class="loading-text">{{ (loadingValue * 100).toFixed(2)  }}%</p>
    <div v-if="sceneLoading" class="loading-bar-container"> 
     <div class="loading-bar">
     </div>
    </div> 
  </div>
  <div class="renderer"></div>
</template>

<style scoped>
.scene-loader{
  position: fixed; 
  top: 0;
  left: 0;
  width: 100vw; 
  height: 100vh; 
  background-color: black;
  z-index: 9999; 
  display: flex;
  align-items: center; 
  justify-content: center; 
  flex-direction: column;
}
.renderer{
  margin: 0px;
  width:100%;
  height:100%;
  opacity: 0;
  transition: 1.5s;
}
.loading-text{
  user-select: none;
  font-family: "Inter", serif;
  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;
  font-size:12px;
}
.loading-bar-container {
    display: flex;

    top: 0;
    left: 0;
    width: 100px;
    height: 2px;
    border-radius: 10px;
    background-color: rgb(112, 112, 112);
  }

  .loading-bar {
    display: flex;
    height: 95%;
    background-color: white;
    transition: width 0.2s ease;
    border-radius: 10px;
  }

</style>
