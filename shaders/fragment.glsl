uniform float time;
uniform float progress;
uniform sampler2D texture1;
uniform sampler2D texture2;
uniform vec2 cameraRotation;

uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
float PI = 3.1415926;


vec2 warp(vec2 pos, vec2 amplitude) {
	pos = pos * 2.0 - 1.0;
	pos.x *= 1.0 - (pos.y * pos.y) * amplitude.x * .2;
	pos.y *= 1. + (pos.x * pos.x) * amplitude.y;
	return pos * .5 + .5;
}


void main() {
	float myprogress = fract(progress);


	vec2 wrapedUV = warp(vUv, vec2(-0.9));
	 

	vec2 center =  (gl_FragCoord.xy/resolution.xy) - vec2(.5);

	// float len = length()

	float len = length(center);

	float vignette = 1. - smoothstep(0.4, 0.75, len);


	vec2 uvCurrent = vec2(
		wrapedUV.x + myprogress * 0.8 + cameraRotation.x, 
		wrapedUV.y - myprogress * 0.5 - cameraRotation.y);
	vec2 uvNext = vec2(
		wrapedUV.x - (1. - myprogress) + cameraRotation.x, 
		wrapedUV.y + (1. - myprogress) * .3 - cameraRotation.y);

	vec4 imgCurrent = texture2D(texture1, uvCurrent);
	vec4 imgNext = texture2D(texture2, uvNext);

	vec3 colorCurrent = imgCurrent.rgb * (1. - myprogress);
	vec3 colorNext = imgNext.rgb *   myprogress;



	vec4 final  = mix(imgCurrent, imgNext, myprogress);

	gl_FragColor = vec4(colorCurrent + colorNext, 1.);
	gl_FragColor.rgb = mix(gl_FragColor.rgb * 0.5, gl_FragColor.rgb, vignette);
}