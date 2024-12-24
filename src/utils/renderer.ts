import * as Three from 'three';
import { GLTFLoader, OrbitControls, Water, type GLTF } from 'three/examples/jsm/Addons.js';
import { EXRLoader } from 'three/examples/jsm/Addons.js';
import { IMAGE } from './imagePath';
//post processing
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { VignetteShader } from '../shaders/vignetteShader.js';
import { Flickering } from '../shaders/screenFlickeringShader.js';
import RendererGUI from './rendererGUI.js';
import type { RendererObject, WaterProps } from './rendererObject.js';

type DirectionalProps ={
    directionalColor:Three.ColorRepresentation;
    isHelper?:boolean;
}
type flickeringProps ={
    position: Three.Vector3;
}
type ModelInfo ={
    isLoading:boolean;
    status:string;
    initialLoad:number;
    totalLoad:number;
}

type ParticleSystem = {
    numberOfParticles:number;
    particlePosition: Three.Vector3;
    range: {
        min:number;
        max:number;
    }
    minHeight:number;
    texture: IMAGE;
}

class Renderer implements RendererObject{
    renderer:Three.WebGLRenderer;
    rendererGUI: RendererGUI;
    scene:Three.Scene;
    perspectiveCamera: Three.PerspectiveCamera;
    orbitControl:OrbitControls;
    deltaTime:number;
    window:Window;
    document:Document;
    exrLoader:EXRLoader;
    gltfLoader:GLTFLoader;
    textureLoader:Three.TextureLoader;
    //post processing,
    composer:EffectComposer;
    loadObjects:Array<ModelInfo>;
    numOfParticles:number;
    particleGeometry:Three.BufferGeometry;
    particleMaterial:Three.PointsMaterial;
    particles:Three.Points;
    maxRange:number;
    minRange :number;
    minHeight:number;
    
    //loading stauts
    sceneLoading:boolean;
    loadingAmount:number;
    maxLoadingAmount:number;
    loadingBarDomElement:HTMLDivElement;
    orbit:boolean;

    overrideUpdate:((deltaTime:number)=> void) | null = null;
    overrideInit: (()=>void) | null = null;
    constructor(window:Window, document:Document){
        this.sceneLoading = true;
        this.loadObjects = [];
        this.window = window;
        this.document = document;
        this.renderer = new Three.WebGLRenderer({antialias:true});
        this.scene = new Three.Scene();
        this.perspectiveCamera = new Three.PerspectiveCamera();
        this.orbitControl = new OrbitControls(this.perspectiveCamera,this.renderer.domElement);
        this.orbit = false;
        this.deltaTime = 0;
        this.renderer.setClearColor(0xFFFFFF);
        //register perspective camera
        this.perspectiveCamera.fov = 45;
        this.perspectiveCamera.aspect = this.window.innerWidth / this.window.innerHeight;
        this.perspectiveCamera.near = 0.1;
        this.perspectiveCamera.far = 2000;
        this.perspectiveCamera.position.set(0, 0, 5);
        //loaders
        this.exrLoader = new EXRLoader();
        this.gltfLoader = new GLTFLoader();
        this.textureLoader = new Three.TextureLoader();
        this.numOfParticles = 0;
        this.particleGeometry = new Three.BufferGeometry();
        this.particleMaterial = new Three.PointsMaterial();
        this.particles = new Three.Points(this.particleGeometry, this.particleMaterial);
        this.maxRange = 0;
        this.minRange = 0;
        this.minHeight = 0;
        this.loadingAmount = 0;
        this.maxLoadingAmount = 0;
        this.loadingBarDomElement = this.document.querySelector(".loading-bar") as HTMLDivElement;
        //postprocessing effects
        this.composer = new EffectComposer(this.renderer);
        this.animate = this.animate.bind(this);
        this.rendererResize = this.rendererResize.bind(this);
        this.updateSceneLoading = this.updateSceneLoading.bind(this);
        this.inputController = this.inputController.bind(this);
        this.rendererGUI = new RendererGUI(window,document, this.perspectiveCamera);
    };
    registerRenderer(){
        //register renderer
        this.renderer.toneMapping = Three.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.8;
        this.renderer.setPixelRatio(this.window.devicePixelRatio * 1.5);
        this.renderer.shadowMap.enabled =true;
        this.renderer.setSize(this.window.innerWidth,this.window.innerHeight);
        this.composer.setSize(this.window.innerWidth, this.window.innerHeight);
        const rendererContainer = this.document.querySelector(".renderer");
        if(rendererContainer){
            this.rendererGUI.registerRendererGUI();
            rendererContainer.appendChild(this.renderer.domElement);
        }else{
            console.error("renderer container is missing");
        }
        this.loadingBarDomElement = this.document.querySelector(".loading-bar") as HTMLDivElement;
        this.window.addEventListener("resize", this.rendererResize);
        this.window.addEventListener("keyup",this.inputController);
        this.orbitControl.enabled = false;

        //register gui
    }
    registerPostProcessing(){
        this.composer.addPass(new RenderPass(this.scene, this.perspectiveCamera));
        const vignettePass = new ShaderPass(VignetteShader);
        vignettePass.uniforms["offset"].value = 0.6; // Adjust to control vignette strength
        vignettePass.uniforms["darkness"].value = 1.6; // Adjust to control vignette darkness
        vignettePass.uniforms["resolution"].value = new Three.Vector2(this.window.innerWidth,this.window.innerHeight);
        vignettePass.uniforms['smoothness'].value = 0.9; // Smoothness of the vignette edges
        this.composer.addPass(vignettePass);

        const bloomPass = new UnrealBloomPass(
            new Three.Vector2(this.window.innerWidth, this.window.innerWidth), // Resolution
            0.01,  // Strength (adjust to control bloom intensity)
            0.03,  // Radius (spread of the bloom)
            0.01,   // Threshold (intensity threshold for bloom application)
        );
        this.composer.addPass(bloomPass);
    }
    init(overrideInit:()=>void){
        this.overrideInit = overrideInit;
        this.overrideInit();
        this.perspectiveCamera.aspect = this.window.innerWidth / this.window.innerHeight;
        this.perspectiveCamera.updateProjectionMatrix();
        this.renderer.setSize(this.window.innerWidth,this.window.innerHeight);
        requestAnimationFrame(this.animate);
    }
    update(overrideUpdate: (deltaTime:number) => void){
        this.overrideUpdate = overrideUpdate;
    }

    rendererResize(){
        if(this.perspectiveCamera && this.window){
            this.perspectiveCamera.aspect = this.window.innerWidth / this.window.innerHeight;
            this.perspectiveCamera.updateProjectionMatrix();
            this.renderer.setSize(this.window.innerWidth,this.window.innerHeight);
            this.composer.setSize(this.window.innerWidth, this.window.innerHeight);
        }
    }
    animate(deltaTime:number){
        this.deltaTime = deltaTime;
        if(this.overrideUpdate){
            this.overrideUpdate(this.deltaTime);
            if(this.sceneLoading && this.loadObjects !== null){
                let totalLoad = 0;
                let initialLoad = 0;
                for(let i = 0; i < this.loadObjects.length; i++){
                    initialLoad += this.loadObjects[i].initialLoad;
                    totalLoad += this.loadObjects[i].totalLoad;
                }
                let currentProgress = initialLoad / totalLoad;
                if(this.maxLoadingAmount <= currentProgress){
                    this.maxLoadingAmount = currentProgress;
                    this.loadingAmount = currentProgress;
                    this.updateSceneLoading(currentProgress);
                }
            }
        }
        this.orbitControl.update(this.deltaTime);
        this.renderer.render(this.scene,this.perspectiveCamera);
        requestAnimationFrame(this.animate);
        this.composer.render();
    }
    inputController(event:KeyboardEvent){
        switch(event.key){
            case "o":{
                this.orbit = !this.orbit;
                this.orbitControl.enabled = this.orbit;
                break;
            }
            case "O":{
                this.orbit = !this.orbit;
                this.orbitControl.enabled = this.orbit;
                break;
            }
        }
    }

    updateSceneLoading(progress:number){
        if(this.loadingBarDomElement){
        this.loadingBarDomElement.style.width = `${progress * 100}%`;
        }
    }

    directionalLight(props?:DirectionalProps){
        const directional = new Three.DirectionalLight(props?.directionalColor ? props.directionalColor : 0xffffc5,1);
        directional.castShadow = true;
       directional.shadow.bias = -0.005;
       directional.shadow.mapSize.width = 524;
       directional.shadow.mapSize.height = 524;
       directional.position.set(0,30,-120);
       const shadowCamera = directional.shadow.camera as Three.OrthographicCamera;
       shadowCamera.left = -150;
       shadowCamera.right = 150;
       shadowCamera.top = 150;
       shadowCamera.bottom = -150;
       shadowCamera.near = 1;
       shadowCamera.far = 500;
       if(props?.isHelper){
        const helper = new Three.CameraHelper(directional.shadow.camera);
        this.scene.add(helper);
       }
       this.scene.add(directional);
    }
    addParticleSystem(props?:ParticleSystem){
        let positions = [];
        let velocities = [];
        this.numOfParticles = props?.numberOfParticles ? props.numberOfParticles : 15000;
        this.maxRange = props?.range.max ? props.range.max : 1000;
        this.minRange = props?.range.min ? props.range.min/2 : 1000/2;
        this.minHeight = props?.minHeight ? props.minHeight : 150;
         this.particleGeometry = new Three.BufferGeometry();

        for(let i = 0; i <  this.numOfParticles; i++){
            positions.push(
                Math.floor(Math.random()* this.maxRange - this.minRange) + (props?.particlePosition ? props?.particlePosition.x : 0),
                Math.floor(Math.random()* this.minRange + this.minHeight) + (props?.particlePosition ? props?.particlePosition.y : 0),
                Math.floor(Math.random()* this.maxRange - this.minRange) + (props?.particlePosition ? props?.particlePosition.z : 0));

            velocities.push(
               Math.floor(Math.random() * 6 -3) * 0.1,
               Math.floor(Math.random() * 5 + 0.12) * 0.18,
               Math.floor(Math.random() * 6 -3) * 0.1,
            )
        }
        this.particleGeometry.setAttribute('position', new Three.Float32BufferAttribute(positions,3));
        this.particleGeometry.setAttribute('velocity', new Three.Float32BufferAttribute(velocities,3));
        const textureURL = new URL(props?.texture ?  props.texture : "",import.meta.url);
         this.particleMaterial = new Three.PointsMaterial({
            size: 1,  
            map: this.textureLoader.load(textureURL.href),
            blending: Three.AdditiveBlending,
            depthTest: true,
            transparent: true,
            opacity: 0.7,
        });

        this.particles = new Three.Points(this.particleGeometry,this.particleMaterial);
        this.scene.add(this.particles);

    }
    updateParticleSystem(){
        for(let i = 0; i < this.numOfParticles *3; i +=3){
            this.particles.geometry.attributes.position.array[i] -= this.particles.geometry.attributes.velocity.array[i];
            this.particles.geometry.attributes.position.array[i+1] -= this.particles.geometry.attributes.velocity.array[i+1];
            this.particles.geometry.attributes.position.array[i+2] -= this.particles.geometry.attributes.velocity.array[i+2];

            if(this.particles.geometry.attributes.position.array[i+1] < 0){
                this.particles.geometry.attributes.position.array[i] = Math.floor(Math.random() * this.maxRange - this.minRange);
                this.particles.geometry.attributes.position.array[i+1]  = Math.floor(Math.random() * this.minRange + this.minHeight);
                this.particles.geometry.attributes.position.array[i+2] = Math.floor(Math.random() * this.maxRange - this.minRange);
            }
            this.particles.geometry.attributes.position.needsUpdate = true;
        }
    }
    //add skybox types here
    skyboxEXR(modelURL: string = ""){
        const imagePath = new URL(modelURL,import.meta.url);
        const currentScene = this.scene;
        let currentIndex:number = this.loadObjects.push({isLoading: true, status:"loading", initialLoad: 0,totalLoad: 0});
         this.exrLoader.load(imagePath.href,(texture:Three.Texture) =>{
             texture.mapping = Three.EquirectangularReflectionMapping;
             currentScene.background = texture;
             currentScene.environment = texture;
             if(this.loadObjects[currentIndex-1] !== undefined){
                this.loadObjects[currentIndex-1].isLoading = false;
                this.loadObjects[currentIndex-1].status = "finished";
              
            }
             this.checkAllAssetsLoaded();
         },(event:ProgressEvent) =>
         {
            this.loadObjects[currentIndex-1].initialLoad = event.loaded;
            this.loadObjects[currentIndex-1].totalLoad = event.total;
            //  const progress = event.loaded / event.total;
            //  this.updateSceneLoading(progress);
         });
    }
    // gltf objects
    gltfObject(modelUrl:string): Promise<Three.Object3D>{
        const loadModel:URL = new URL(modelUrl, import.meta.url);
        let currentIndex:number = this.loadObjects.push({isLoading: true, status:"loading", initialLoad: 0,totalLoad: 0});
        return new Promise((reslove, reject)=>{
            this.gltfLoader.load(loadModel.href, (data:GLTF) =>{
                    const model = data.scene;
                    const box = new Three.Box3().setFromObject(model);
                    const center = new Three.Vector3();
                    box.getCenter(center);
                    model.position.sub(center);
                    model.position.y = 0;
                    model.traverse((object: Three.Object3D)=>{
                        if((object as Three.Mesh).isMesh) {
                            const mesh = object as Three.Mesh;
                            mesh.receiveShadow = true;
                            mesh.castShadow =true;
                            if(mesh.material instanceof Three.MeshStandardMaterial && mesh.material.map){
                                mesh.material.envMap = this.scene.environment;
                                mesh.material.needsUpdate = true;
                            }
                        }
                    });
                    this.scene.add(model);
                    //checl the loading statsu
                    if(this.loadObjects[currentIndex-1] !== undefined){
                        this.loadObjects[currentIndex-1].isLoading = false;
                        this.loadObjects[currentIndex-1].status = "finished";
                      
                    }
        
                    this.checkAllAssetsLoaded();
                    reslove(model);
            },
        (event:ProgressEvent)=>{
            this.loadObjects[currentIndex-1].initialLoad = event.loaded;
            this.loadObjects[currentIndex-1].totalLoad = event.total;

           // const progress = event.loaded / event.total;
           // this.updateSceneLoading(progress);
        },
        (error)=>{
            console.error('Error loading model:', error);
            reject(error);
        })
        })
    }
    checkAllAssetsLoaded(){
        const allLoaded:boolean = this.loadObjects.every((obj) => !obj.isLoading);
        if(allLoaded){
            this.sceneLoading = false;
        }
    }
    flickeringObject(modelURL:string,props:flickeringProps ){
        const texture:URL = new URL(modelURL, import.meta.url);
        this.textureLoader.load(texture.href ,(data:Three.Texture)=>{
            const light = new Three.PointLight(0xffffff, 1, 100); // White li
            const newPosition = props.position ? props.position : new Three.Vector3(0,0,0);
            light.position.set(newPosition.x,newPosition.y, newPosition.z);
            // Create a plane geometry for the TV screen
            const geometry = new Three.PlaneGeometry(5, 3); // Aspect ratio 16:9
          // Clone the Flickering shader to avoid global mutations
            const flickeringShader = {
                uniforms: Three.UniformsUtils.clone(Flickering.uniforms),
                vertexShader: Flickering.vertexShader,
                fragmentShader: Flickering.fragmentShader,
              };
    
              // Set uniform values
              flickeringShader.uniforms['flickerStrength'].value = 0.3;
              flickeringShader.uniforms['time'].value = 0.0;
              flickeringShader.uniforms['lightPos'].value = light.position;
              flickeringShader.uniforms['texture'].value = data;
    
              // Create the ShaderMaterial with the cloned shader
              const tvMaterial = new Three.ShaderMaterial(flickeringShader);
           // const tvMaterial = new Three.ShaderMaterial(Flickering);
            const tvPlane = new Three.Mesh(geometry,tvMaterial);
            tvPlane.position.set(newPosition.x,newPosition.y,newPosition.z +1.5);
            this.scene.add(tvPlane);
            this.scene.add(light);
            return tvPlane;
        }); // Replace with your texture path

        return null;
        //light.position.set(5, 5, 5); // Position the light in the scene
       
    }
    // create 3d asset here.
    waterObject(modelURL:string, props?:WaterProps){
        const texture:URL = new URL(modelURL, import.meta.url);
        const waterGeometry = new Three.PlaneGeometry(1000,1000);
        const normalMap = this.textureLoader.load(texture.href,(data:Three.Texture)=>{
            data.wrapS = data.wrapT = Three.RepeatWrapping;
        })

        const water = new Water(waterGeometry,{
            textureWidth:524,
            textureHeight:524,
            waterNormals: normalMap,
            sunDirection: new Three.Vector3(),
            sunColor:  props?.sunColor ? props.sunColor :0xffffff,
            waterColor: props?.waterColor ? props.waterColor : 0x001e0f,
            distortionScale: props?.distortionScale ? props.distortionScale : 3.7,
            fog: this.scene.fog !== undefined
        });

        water.rotation.x = - Math.PI /2;
        water.receiveShadow = true;
        water.position.set(0,-2,0);
        this.scene.add(water);
        return water;
    }


}

export default Renderer;