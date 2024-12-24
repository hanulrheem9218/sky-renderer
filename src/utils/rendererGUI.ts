import * as Three from 'three';
import { setWorldToScreenPosition, type ScreenSize } from "./vector";

type UIProps = {
    objectMatrix: Three.Matrix4;
    name:string;
    offsetY?:number;
    index?:number;
}
class RendererGUI {
    document:Document;
    window:Window;
    rendererPanel:HTMLDivElement | null;
    uiPositions: Array<UIProps>;
    rendererDomElement: HTMLDivElement | null;
    camera:Three.Camera;
    constructor(window:Window, document:Document, camera:Three.Camera){
        this.uiPositions = [];
        this.document = document;
        this.window = window;
        this.camera = camera;
        this.rendererPanel = null;
        this.rendererDomElement = null;
        this.onMouseEventClick.bind(this.onMouseEventClick);
        this.onMouseEventEnter.bind(this.onMouseEventEnter);
       // this.onMouseEventClick = this.bind(this.onMouseEventClick);
    }
    registerRendererGUI(){
        //init ui element
        this.uiPositions = [];
        this.rendererDomElement = this.document.querySelector(".renderer") as HTMLDivElement;
        
        // only care about mouse event okay ?
    }
    addUiElement(props:UIProps){
        const currentIndex = this.uiPositions.push({objectMatrix: props.objectMatrix, offsetY: props.offsetY,name: props.name});
        this.uiPositions[currentIndex-1].index = currentIndex -1;
        const rendererPosition:ScreenSize = {width: this.rendererDomElement?.offsetWidth!,height: this.rendererDomElement?.offsetHeight!};
        const screen = setWorldToScreenPosition(this.uiPositions[currentIndex-1].objectMatrix,rendererPosition ,this.camera, props.offsetY!); 
        const uiElement = this.document.querySelector(`#ui-element-${currentIndex -1}`) as HTMLDivElement;
        if(uiElement !== null){
            uiElement.addEventListener("mouseenter", this.onMouseEventEnter);
            uiElement.addEventListener("click", this.onMouseEventClick);
            uiElement.addEventListener("mouseleave",this.onMouseEventLeave);
            uiElement.style.left = `${screen.x}px`;
            uiElement.style.top = `${screen.y}px`;
        }
    }
    //its just like a extension. u add it to the three js object.
    updateUiElements(props:UIProps){
        let currentObject = this.uiPositions.find( value => value.name === props.name);
        this.rendererDomElement = this.document.querySelector(".renderer") as HTMLDivElement;
        const rendererPosition:ScreenSize = {width: this.rendererDomElement?.offsetWidth!,height: this.rendererDomElement?.offsetHeight!};
      
        const screen = setWorldToScreenPosition(currentObject?.objectMatrix!, rendererPosition,this.camera, currentObject?.offsetY!);

        const uiElement = this.document.querySelector(`#ui-element-${currentObject?.index}`) as HTMLDivElement;
        if(uiElement !== null){
            uiElement.style.left = `${screen.x}px`;
            uiElement.style.top = `${screen.y + currentObject?.offsetY!}px`;
        }
    }
    onMouseEventEnter(event:MouseEvent | UIEvent | Event | ProgressEvent<EventTarget>){
        const mouseDomElement = event.target as HTMLDivElement;
       if(mouseDomElement !== null ){
           const index = mouseDomElement.id.match(/\d+/)?.[0];
           const innerCircle = mouseDomElement.querySelector(`#ui-inner-circle-${index}`) as HTMLDivElement;
           if(innerCircle !== null ){
               innerCircle.style.cursor ="pointer";
               innerCircle.style.backgroundColor = "black";
               innerCircle.style.width = "20px";
               innerCircle.style.height = "20px";
           }
       }
    }
    onMouseEventLeave(event:MouseEvent | UIEvent | Event | ProgressEvent<EventTarget>){
        const mouseDomElement = event.target as HTMLDivElement;
        if(mouseDomElement !== null ){
            const index = mouseDomElement.id.match(/\d+/)?.[0];
            const innerCircle = mouseDomElement.querySelector(`#ui-inner-circle-${index}`) as HTMLDivElement;
            if(innerCircle !== null ){
                innerCircle.style.cursor ="";
                innerCircle.style.backgroundColor ="white";
                innerCircle.style.width = "14px";
                innerCircle.style.height = "14px";
            }
        }
    }
    onMouseEventClick(event:MouseEvent | UIEvent | Event | ProgressEvent<EventTarget>){
        const mouseDomElement = event.target as HTMLDivElement;
        if(mouseDomElement !== null && mouseDomElement.id.includes("ui-inner-circle")){
            mouseDomElement.style.backgroundColor ="white";
            mouseDomElement.style.width = "14px";
            mouseDomElement.style.height = "14px";
            const fileUrl = new URL("/assets/sound/menu.wav",import.meta.url);
            const uiAudio = new Audio(fileUrl.href);
            uiAudio.volume = 0.3;
            uiAudio.play();
        }
    }
}

export default RendererGUI;