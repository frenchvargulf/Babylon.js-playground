// Pixel or Fragment shader
precision mediump float;

// Varying: Varying variables are values created by the vertex shader and transmitted to the pixel shader. 
// Here the pixel shader will receive a vUV value from the vertex shader. 

// Attributes
uniform mat4 worldView;
varying vec4 vPosition;
varying vec3 vNormal;

// PARAMETER GIVEN IN THE JS CODE //
// Uniforms: A uniform is a variable used by the shader and defined by the CPU. 
// Offset position
uniform float offset;
// Exponent
uniform float exponent;
// Colors
uniform vec3 topColor;
uniform vec3 bottomColor;

// / main: The function named main is the code executed by the GPU for each pixel and must at least produce a value for gl_FragColor (the color of the current pixel). 
void main(void) {
    float h = normalize(vPosition + offset).y;
    gl_FragColor = vec4( mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0 );
}