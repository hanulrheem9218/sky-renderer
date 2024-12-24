import * as Three from 'three';

export type ScreenSize ={
    width: number;
    height:number;
}

type ClampProps ={
    transformOffsetY: number;
    position: Three.Vector2;
    marginOffset:number;
    screen:ScreenSize;
}

export const setWorldToScreenPosition = (matrix:Three.Matrix4, screen:ScreenSize,camera:Three.Camera , offsetY:number):Three.Vector3 =>{
    const screenPosition = new Three.Vector3(0,0,0);
    screenPosition.setFromMatrixPosition(matrix);
    screenPosition.project(camera);
    const halfScreenPosition = new Three.Vector2(screen.width / 2, screen.height /2);
    screenPosition.x = (screenPosition.x * halfScreenPosition.x) + halfScreenPosition.x;
    screenPosition.y = - (screenPosition.y * halfScreenPosition.y) + halfScreenPosition.y;
    //clamp position
    const clampPosition = clampVectorPosition({position: new Three.Vector2(screenPosition.x,screenPosition.y), marginOffset :50 ,screen, transformOffsetY:offsetY});
    return new Three.Vector3(clampPosition.x,clampPosition.y, 0);
};

const clampVectorPosition = (props:ClampProps) =>{
    const screenLimits = {
        minX: props.marginOffset,
        minY: props.marginOffset - props.transformOffsetY!,
        maxX: props.screen.width - props.marginOffset,
        maxY: props.screen.height - props.marginOffset,
    }
    const newPosition = new Three.Vector2(Math.max(screenLimits.minX, Math.min(props.position.x, screenLimits.maxX)),
    Math.max(screenLimits.minY, Math.min(props.position.y, screenLimits.maxY)));
    return newPosition;
}