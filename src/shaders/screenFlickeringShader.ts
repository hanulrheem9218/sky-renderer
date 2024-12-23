import * as Three from 'three';
export const Flickering = {
    uniforms: {
        time: {  value: 0.0 },
        flickerStrength: { value: 0.3 },
        lightPos: { value: new Three.Vector3 },
        texture: {  value: new Three.Texture },
      },
      vertexShader: `
        varying vec2 vUv; // Pass UV coordinates to the fragment shader

        void main() {
            vUv = uv; // Assign UV from geometry to the varying variable
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); // Standard vertex transformation
        }
      `,
      fragmentShader: `
        uniform float time;           // Time for animation
        uniform float flickerStrength; // Strength of the flickering effect
        uniform vec3 lightPos;         
        uniform sampler2D baseMap;     

        varying vec2 vUv; // UV coordinates passed from the vertex shader

        void main() {
            // Flicker effect based on sine wave and time
            float flicker = sin(time * 10.0 + vUv.x * 5.0) * 0.5 + 0.5; // Adjust frequencies for smoother animation
            flicker = pow(flicker, 3.0) * flickerStrength;             // Amplify and control strength

            // Sample the texture using UV coordinates
            vec4 texColor = texture(baseMap, vUv);

            // Calculate 2D light distance (since vUv is 2D)
            vec2 fragPos = vUv * 2.0 - 1.0; // Convert vUv to [-1, 1] space
            float lightDist = length(lightPos.xy - fragPos); // Only consider x and y of lightPos
            float lightEffect = 1.0 / (1.0 + lightDist * lightDist); // Prevent divide by zero and scale attenuation

            // Combine texture color, flickering effect, and light effect
            vec3 finalColor = texColor.rgb * (flicker + lightEffect);

            gl_FragColor = vec4(finalColor, texColor.a); // Preserve the original 
        }

      `,
};