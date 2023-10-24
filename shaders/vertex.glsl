uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
uniform vec2 pixels;
uniform vec3 uMin;
float PI = 3.1415926;
void main () {
	vUv = uv;

	vec3 newposition = position;
  

	gl_Position = projectionMatrix * modelViewMatrix * vec4(newposition, 1.0);
}