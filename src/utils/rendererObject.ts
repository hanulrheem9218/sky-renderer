import {  Water} from 'three/examples/jsm/Addons.js';
import * as Three from 'three';
export type WaterProps ={
    waterColor: Three.ColorRepresentation;
    sunColor: Three.ColorRepresentation;
    distortionScale: number;
}

export interface RendererObject{
    waterObject(modelURL:string, props?:WaterProps): Water;
    gltfObject(modelUrl:string): Promise<Three.Object3D>;
}

