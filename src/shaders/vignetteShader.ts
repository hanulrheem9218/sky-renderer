// Vignette Shader Code
export const VignetteShader = {
    uniforms: {
        tDiffuse: { value: null },
        resolution: { value: null },
        offset: { value: 1.0 }, // The radius of the vignette effect
        darkness: { value: 1.0 }, // The intensity of the vignette
        smoothness: { value: 1.5 } // Controls the smoothness of the vignette
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec2 resolution;
        uniform float offset;
        uniform float darkness;
        uniform float smoothness;

        varying vec2 vUv;

        void main() {
            vec4 color = texture2D(tDiffuse, vUv);
            vec2 uv = vUv - vec2(0.5); // Center the UV coordinates
            float len = length(uv) * 2.0; // Scale factor for vignette size
            float vignette = smoothstep(offset, offset + smoothness, len); // Vignette falloff

            // Apply the vignette effect to darken the outer region (make it black)
            color.rgb *= mix(vec3(1.0), vec3(0.0), vignette); // Blend from original color to black

            gl_FragColor = color;
        }
    `
};

