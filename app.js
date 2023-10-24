import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader' 
import GUI from 'lil-gui'
import gsap from 'gsap'
import fragmentShader from './shaders/fragment.glsl'
import vertexShader from './shaders/vertex.glsl'
 
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer'
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass'
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass'
import {GlitchPass} from 'three/examples/jsm/postprocessing/GlitchPass'

 

import onep from './onep.jpg'
import twop from './tow.webp'



export default class Sketch {
	constructor(options) {
		
		this.scene = new THREE.Scene()
		
		this.container = options.dom
		
		this.width = this.container.offsetWidth
		this.height = this.container.offsetHeight
		
		
		// // for renderer { antialias: true }
		this.renderer = new THREE.WebGLRenderer({ antialias: true })
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
		this.renderTarget = new THREE.WebGLRenderTarget(this.width, this.height)
		this.renderer.setSize(this.width ,this.height )
		this.renderer.setClearColor(0xeeeeee, 1)
		this.renderer.useLegacyLights = true
		this.renderer.outputEncoding = THREE.sRGBEncoding
 

		 
		this.renderer.setSize( window.innerWidth, window.innerHeight )

		this.container.appendChild(this.renderer.domElement)
 

		this.textures = [
			new THREE.TextureLoader().load(onep),
			new THREE.TextureLoader().load(twop),
			new THREE.TextureLoader().load(onep),
			new THREE.TextureLoader().load(twop),


		]

		this.camera = new THREE.PerspectiveCamera( 70,
			 this.width / this.height,
			 0.01,
			 1000
		)
 
		this.camera.position.set(0, 0, -6) 
 
		this.time = 0
		// const frusumSize = 1
		// const aspect = this.width / this.height
		// this.camera = new THREE.OrthographicCamera(frusumSize  / -2, frusumSize / 2, frusumSize / 2, frusumSize / -2, -1000, 1000)
		
		this.controls = new OrbitControls(this.camera, this.renderer.domElement)
		this.dracoLoader = new DRACOLoader()
		this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
		this.gltf = new GLTFLoader()
		this.gltf.setDRACOLoader(this.dracoLoader)
		this.speed = 0
		this.position = 0
		this.isPlaying = true
		document.addEventListener('wheel', e => {
			this.speed += e.deltaY * 0.0002
		})

		this.addObjects()		 
		this.resize()
		this.render()
		this.setupResize()
		this.mouse()

		this.settings()
 
	}

	settings() {
		let that = this
		this.settings = {
			progress: 0
		}
		this.gui = new GUI()
		this.gui.add(this.settings, 'progress', 0, 1, 0.01)
	}

	setupResize() {
		window.addEventListener('resize', this.resize.bind(this))
	}

	resize() {
		this.width = this.container.offsetWidth
		this.height = this.container.offsetHeight
		this.renderer.setSize(this.width, this.height)
		this.camera.aspect = this.width / this.height


		this.imageAspect = 1920 / 1080
		let a1, a2
		if(this.height / this.width > this.imageAspect) {
			a1 = (this.width / this.height) * this.imageAspect
			a2 = 1
		} else {
			a1 = 1
			a2 = (this.height / this.width) / this.imageAspect
		} 


		this.material.uniforms.resolution.value.x = this.width
		this.material.uniforms.resolution.value.y = this.height
		this.material.uniforms.resolution.value.z = a1
		this.material.uniforms.resolution.value.w = a2

		this.camera.updateProjectionMatrix()



	}
 

	addObjects() {
 
		console.log(this.textures);
		let that = this
		this.material = new THREE.ShaderMaterial({
			extensions: {
				derivatives: '#extension GL_OES_standard_derivatives : enable'
			},
			side: THREE.DoubleSide,
			uniforms: {
				time: {value: 0},
				resolution: {value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
				cameraRotation: {value: new THREE.Vector2(0,0)},

				texture1: {value: this.textures[0]},
				texture2: {value: this.textures[1]},
				progress: {value: 0}

			},
			vertexShader,
			fragmentShader,
		 
		})
		
		this.geometry = new THREE.CylinderGeometry(10,10,30,30, 1, 1, 0, Math.PI)
		this.plane = new THREE.Mesh(this.geometry, this.material)
		this.plane.rotation.y = -Math.PI / 2
		this.scene.add(this.plane)
 
	}
	mouse() {
		let width = window.innerWidth / 2
		let height = window.innerHeight / 2

		this.currentX = 0
		this.currentY = 0
		this.destX = 0
		this.destY = 0


		document.addEventListener('mousemove', (e) => {
			this.mouseX = (e.clientX - width) / width
			this.mouseY =  -(e.clientY - height) / height
			this.destX = this.mouseX / 10
			this.destY = this.mouseY / 10

		})
	}


	addLights() {
		const light1 = new THREE.AmbientLight(0xeeeeee, 0.5)
		this.scene.add(light1)
	
	
		const light2 = new THREE.DirectionalLight(0xeeeeee, 0.5)
		light2.position.set(0.5,0,0.866)
		this.scene.add(light2)
	}

	stop() {
		this.isPlaying = false
	}

	play() {
		if(!this.isPlaying) {
			this.isPlaying = true
			this.render()
		}
	}
	tao() {
		this.position += this.speed
		this.speed *= 0.7

		let i = Math.round(this.position)
		let dif = i - this.position

		this.position += dif * 0.035

		if(Math.abs(i = this.position) < 0.001) {
			this.position = i
		}
		let l = this.textures.length
		this.curSlide = ((Math.floor(this.position) - 1) % l + l) % l
		this.nextSlide = ((this.curSlide + 1)% l + l ) % l

	}

	render() {
		if(!this.isPlaying) return
		this.time += 0.05
		this.material.uniforms.time.value = this.time
		 this.tao()

		this.currentX -= (this.currentX - this.destX) * 0.02
		this.currentY -= (this.currentY - this.destY) * 0.02

		//this.renderer.setRenderTarget(this.renderTarget)
		this.renderer.render(this.scene, this.camera)

		this.material.uniforms.progress.value = this.settings.progress
		this.material.uniforms.progress.value = this.position


		this.material.uniforms.cameraRotation.value.x = this.currentX
		this.material.uniforms.cameraRotation.value.y = this.currentY


		this.material.uniforms.texture1.value = this.textures[this.curSlide]
		this.material.uniforms.texture2.value = this.textures[this.nextSlide]




		//this.renderer.setRenderTarget(null)
 
		requestAnimationFrame(this.render.bind(this))
	}
 
}
new Sketch({
	dom: document.getElementById('container')
})
 