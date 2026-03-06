import { GridHelper, PointLight, CanvasTexture, MeshPhongMaterial, PlaneGeometry, WebGLRenderer, LinearFilter, BufferGeometry, SphereGeometry, MeshBasicMaterial, TextureLoader, Vector4, Vector3, AdditiveBlending,  BufferAttribute, Points, Group, RawShaderMaterial, ShaderMaterial, Mesh} from 'three'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { gsap, ScrollTrigger } from 'gsap/all';
gsap.registerPlugin(ScrollTrigger); 

export default class Obj_1 {
  constructor(stage) {
    this.rotationPower = 0.001;
    this.stage = stage;
    this.numParticles = 2000000;
		this.particleMoveSpeed = 0.15;
		this.particleRange = 30.0
		this.textureRadius = 30;
		this.fogStart = 1.0;
		this.fogEnd = 50.8;
		this.particleAnimationRange = 0.3;
		this.particleMoveatart = false;
    this.time = 0;
    this.current = 0;
    this.textures = [];
    this.sliderImages = [];

  }

  init() {
      //this._setMesh();
      this._clicks();
      this._ti_pic();
    }

  _getGeometryPosition(geometry) {
    const material = new MeshBasicMaterial();
    const mesh = new Mesh(geometry, material);
    const sampler = new MeshSurfaceSampler(mesh).build();

    const particlesPosition = new Float32Array(this.numParticles * 3);
    for (let i = 0; i < this.numParticles; i++) {
      const newPosition = new Vector3();
      const normal = new Vector3();

      sampler.sample(newPosition, normal);
      particlesPosition.set([newPosition.x, newPosition.y, newPosition.z], i * 3);
    }
    return particlesPosition;
  }
  _setMesh() {
    const geometry = new BufferGeometry();
    const firstPos = this._getGeometryPosition(new SphereGeometry(0.1, 32, 32).toNonIndexed());
    let self = this;
    console.log(BufferGeometryUtils);
  new OBJLoader().load(
        "../models/wave.obj",
        (obj) => {
          obj.traverse(function(child){
          if(child.geometry!==undefined){
            child.geometry= BufferGeometryUtils.mergeVertices(child.geometry,0.1);
            child.geometry.computeVertexNormals();
            let moodel = child.geometry;
            let elph = self._getGeometryPosition(moodel.toNonIndexed());
            fnc(elph);
          }
        });
      },
        (xhr) => console.log((xhr.loaded / xhr.total) * 100 + "% loaded"),
        (err) => console.error(err),
      )        
    const material = new RawShaderMaterial({
      vertexShader: document.querySelector("#js-vertex-shader").textContent,
      fragmentShader: document.querySelector("#js-fragment-shader").textContent,
      uniforms: {
        u_sec1: { type: "f", value: 0.0 },
        u_sec2: { type: "f", value: 0.0 },
        c: { type: "f", value: 0.0 },
        u_time: { type: "f", value: 0.0 },
        u_alpha: { type: "f", value: 0.0 },
        u_particle_range: { type: "f", value: 1 },
				u_particle_animation_range: {
					type: "f",
					value: this.particleAnimationRange
				},
				u_animationRange: { type: "f", value: 0.0 },
      },
      blending:AdditiveBlending,
      transparent:true,
     });
    const vertexIndex = [];
		const randomValue = [];
		const phaseValue = [];

    for (let i = 0; i < this.numParticles; i++) {
			vertexIndex.push(i);
			phaseValue.push((Math.random() - 0.5) * 2.0);
			randomValue.push(Math.random(), Math.random(), Math.random(), Math.random());
		}
    geometry.setAttribute(
			"vertexIndex",
			new BufferAttribute(new Float32Array(vertexIndex), 1)
		);
		geometry.setAttribute(
			"phaseValue",
			new BufferAttribute(new Float32Array(phaseValue), 1)
		);
		geometry.setAttribute(
			"randomValue",
			new BufferAttribute(new Float32Array(randomValue), 4)
		);
    geometry.setAttribute("position", new BufferAttribute(firstPos, 3));
    
    function fnc(elph) {
    geometry.setAttribute("secPosition", new BufferAttribute(elph, 3));
    }

    this.mesh = new Points(geometry, material);

    this.group = new Group();
    this.group.add(this.mesh);
    this.group.depthTest = false;
    this.group.renderOrder = 1; // rendering first

    this.stage.scene.add(this.group);

  }

  _clicks() {
    gsap.timeline({
        defaults: {},
      })

    const buttonBox = document.querySelector('.effect_btn');
    buttonBox.addEventListener('click', () => {
      buttonBox.classList.toggle("effect");
      let timl = gsap.timeline();
      let len = this.sliderImages.length;
      let nextTexture =this.sliderImages[(this.current +1)%len];
      this.object.material.uniforms.nextImage.value = nextTexture;
      let prevTexture =this.sliderImages[(this.current -1)%len];
      
      if( buttonBox.classList.contains('effect') == true ){
        //
        timl.to(this.object.material.uniforms.progress,{
          value:1,
          ease: 'Power2.out',
          duration: 0.8,
          onComplete:()=>{
            this.current = (this.current +1)%len;
            this.object.material.uniforms.currentImage.value = nextTexture;
            this.object.material.uniforms.progress.value = 0;
        }})
    
        } else {
          //
          timl.to(this.object.material.uniforms.progress,{
            value:1,
            ease: 'Power2.out',
            duration: 0.5,
            onComplete:()=>{
              this.current = (this.current -1)%len;
              this.object.material.uniforms.currentImage.value = prevTexture;
              this.object.material.uniforms.progress.value = 0;
            }})
      
        }
    });    

  }
  _ti_pic() {
    let self = this;

    const displacementSlider = function (opts) {
    let images = opts.images;
    let image;
    let canvasWidth = images[0].clientWidth;
    let canvasHeight = images[0].clientHeight;
    let parent = opts.parent;
    let renderWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    let renderHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    let renderW, renderH;

    renderW = renderWidth;
    renderH = canvasHeight;

    let renderer = new WebGLRenderer({antialias: false });

    let loader = new TextureLoader();
    loader.crossOrigin = "anonymous"; 
    images.forEach(img => {
  
      image = loader.load(img.getAttribute('src') + '?v=' + Date.now());
          
      image.magFilter = image.minFilter = LinearFilter;
      image.anisotropy = renderer.capabilities.getMaxAnisotropy();
      self.sliderImages.push(image);
  
    });

    let mat = new ShaderMaterial({
      uniforms: {
        time: { type: "f", value: 0 },
        progress: { type: "f", value: 0 },
        border: { type: "f", value: 0 },
        intensity: { type: "f", value: 0 },
        transition: { type: "f", value: 40 },
        swipe: { type: "f", value: 0 },
        width: { type: "f", value: 0 },
        radius: { type: "f", value: 0 },
        resolution: { type: "v4", value: new Vector4() },
        intensity: {value: 50., type:'f', min:1., max:100},		
        currentImage: { type: "f", value: self.sliderImages[0] },
        nextImage: { type: "f", value: self.sliderImages[1] } },
        vertexShader: document.querySelector("#ti-vertex-shader").textContent,
        fragmentShader: document.querySelector("#ti-fragment-shader").textContent,
        transparent: true,
      opacity: 1.0 });


      let geometry = new PlaneGeometry(1.75, 1.75);

      const hi = (window.innerWidth / window.innerHeight);
      const w =  canvasWidth / (canvasHeight / hi);
      
      self.object = new Mesh(geometry, mat);
  
      self.object.scale.set(w, hi, 1);
      var getDevice = (function(){
        var ua = navigator.userAgent;
        if(ua.indexOf('iPhone') > 0 || ua.indexOf('iPod') > 0 || ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0){
          return 'sp';
        }else if(ua.indexOf('iPad') > 0 || ua.indexOf('Android') > 0){
          return 'tab';
        }else{
          return 'other';
        }
      })();
      if( getDevice == 'tab' ){
        self.object.position.set(0, 0, 0.8);
      }  
      if( getDevice == 'sp' ){
        self.object.position.set(0, 0, 0);
        self.object.scale.set(w, hi, 0);
      }  
      if( getDevice == 'other' ){
        self.object.position.set(0, 0, 0.01);
      }        
      
        self.stage.scene.add(self.object);   
  };
  var imagesLoaded = require('imagesloaded');
    imagesLoaded(document.querySelectorAll('img'), () => {
      const el = document.getElementById('slider');
      const imgs = Array.from(el.querySelectorAll('img'));
      new displacementSlider({
        parent: el,
        images: imgs });

    });  
  }


_render() {
  this.mesh.material.uniforms.u_time.value += this.particleMoveSpeed;
}

  onResize() {
        //this.grid_plane.material.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
    
  }

  onRaf() {
    if (this.particleMoveatart) {
      this._render();
    }
  }
}