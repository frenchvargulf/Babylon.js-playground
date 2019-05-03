// Do not use full precision floating values
recision mediump float;

// Attributes - Define a portion of a vertex
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv; // texture coordinates that allow us to apply a 2D texture on an 3D object

// Uniforms - variable used by shader and defined by CPU
uniform mat4 worldViewProjection; //matrix used to project the position of the vertex (x, y, z) to the screen (x, y)

// Varying - variables are values created by the vertex shader and transmitted
// to the pixel shader, vertex shader will transmit a vUV (simply copy of uv)
// value to the pixel shader, a pixel is defined here with a position and texture 
//coordinates. These values will be interpolated by the GPU and used by the pixel shader. 

varying vec4 vPosition;
varying vec3 vNormal;

// Code - main: executed by the GPU for each vertex and must at least produce a value for gl_position (the position on the screen of the current vertex). 
void main() {

    vec4 p = vec4( position, 1. );
    vPosition = p;
    vNormal = normal;
    gl_Position = worldViewProjection * p;

}

/**
* It generates a system variable (starting with gl_) named gl_position 
* to define the position of the associated pixel, and it sets a varying 
* variable called vUV. 
**/