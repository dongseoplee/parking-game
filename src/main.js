import * as THREE from "three";
import { OrbitControls} from '../threejs/examples/jsm/controls/OrbitControls.js';
import { FlyControls} from '../threejs/examples/jsm/controls/FlyControls.js';
import { GLTFLoader } from '../threejs/examples/jsm/loaders/GLTFLoader.js';
import GUI from '../threejs/examples/jsm/libs/lil-gui.module.min.js';

import * as CANNON from "../cannonjs/cannon-es.js";
import CannonDebugger from "../cannonjs/cannon-es-debugger.js";

let elThreejs = document.getElementById("threejs");
let camera,scene,renderer;



let vehicle
let wheelBody1
let wheelBody2
let wheelBody3
let wheelBody4
let isParking = false

// helpers to debug
let axesHelper;
let controls;
let gui;

// show and move cube
let cubeThree;
let cubeThree2;
let cubeThree3;
let keyboard = {};

// camera follow player
let enableFollow = true;

// cannon variables
let world;
let cannonDebugger;
let timeStep = 1 / 60;
let cubeBody, planeBody;
let cubeBody2;
let cubeBody3;
let slipperyMaterial, groundMaterial;
let obstacleBody;
let obstaclesBodies = [];
let obstaclesMeshes = [];
init();

async function init() {




  // Scene
	scene = new THREE.Scene();

  // Camera
	camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);
  camera.position.z = 10;
  camera.position.y = 5;


  // render
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	renderer.outputEncoding = THREE.sRGBEncoding;

  const ambient = new THREE.HemisphereLight(0xffffbb, 0x080820);
  scene.add(ambient);

  const light = new THREE.DirectionalLight(0xFFFFFF, 1);
  light.position.set( 1, 10, 6);
  scene.add(light);


  // axesHelper
	// axesHelper = new THREE.AxesHelper( 100 );
	// scene.add( axesHelper );

  // orbitControls
  // controls = new OrbitControls(camera, renderer.domElement);
  // controls.rotateSpeed = 1.0
  // controls.zoomSpeed = 1.2
  // controls.enablePan = false
  // controls.dampingFactor = 0.2
  // controls.minDistance = 10
  // controls.maxDistance = 500
  // controls.enabled = false

  //flyControls
  controls = new FlyControls(camera, renderer.domElement);
  controls.dragToLook = true;
  controls.movementSpeed = 10;
  controls.rollSpeed = 0.5;
  controls.enabled = true;

	elThreejs.appendChild(renderer.domElement);

  initCannon();

  addBackground();

  addPlaneBody();
  addPlane();

  addCubeBody();
  await addCube();

  addWheelBody(); 

  moveCar();
  moveCamera();

  addObstacle();
  addObstacleBody();

  //주차 검사 로직 비동기
  

  //addContactMaterials();

  //addKeysListener();
	addGUI();

  animate()
  setInterval(checkParkingLot, 1000)
}

function animate(){
	renderer.render(scene, camera);

  movePlayer();

  if (enableFollow) followPlayer();

  world.step(timeStep);
	cannonDebugger.update();

  cubeThree.position.copy(cubeBody.position);
  cubeThree.position.y = cubeBody.position.y - 1.3;
  cubeThree.quaternion.copy(cubeBody.quaternion);


  for (let i = 0; i < obstaclesBodies.length; i++) {
    obstaclesMeshes[i].position.copy(obstaclesBodies[i].position);
		obstaclesMeshes[i].quaternion.copy(obstaclesBodies[i].quaternion);
	}
  controls.update(0.05);

	requestAnimationFrame(animate);

}

function addCubeBody(){
  let cubeShape = new CANNON.Box(new CANNON.Vec3(1.2,1,3));
  //slipperyMaterial = new CANNON.Material('slippery');
  cubeBody = new CANNON.Body({ mass: 4 });
  cubeBody.addShape(cubeShape, new CANNON.Vec3(0,0,-1));


  // change rotation
  cubeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 180);
  
  //cubeBody.position.set(-35, 5, -55);
  cubeBody.position.set(15, 5, -50);
  cubeBody.linearDamping = 0.5;

  vehicle = new CANNON.RigidVehicle({
    chassisBody : cubeBody
  })
 
  world.addBody(cubeBody);
  
}



function addWheelBody(){

  

  let wheelShape = new CANNON.Sphere(0.5);
  let wheelMaterial = new CANNON.Material('wheel')
  let axis = new CANNON.Vec3(1,0,0)
  let direction = new CANNON.Vec3(0,-1,0)

  //오른쪽 앞바퀴
  wheelBody1 = new CANNON.Body({ mass: 1,material: wheelMaterial });
  wheelBody1.addShape(wheelShape);
  wheelBody1.angularDamping= 0.4;

  vehicle.addWheel({
      body : wheelBody1,
      position : new CANNON.Vec3(-1.3,-1,1),
      axis: axis, 
      direction: direction
    })


  //왼쪽 앞바퀴
  wheelBody2 = new CANNON.Body({ mass: 1,material: wheelMaterial });
  wheelBody2.addShape(wheelShape);
  wheelBody2.angularDamping= 0.4;



  vehicle.addWheel({
      body : wheelBody2,
      position : new CANNON.Vec3(1.3,-1,1),
      axis: axis, 
      direction: direction
    })



    
  //왼쪽 뒷바퀴
  wheelBody3 = new CANNON.Body({ mass: 1,material: wheelMaterial });
  wheelBody3.addShape(wheelShape);
  wheelBody3.angularDamping= 0.4;


  vehicle.addWheel({
      body : wheelBody3,
      position : new CANNON.Vec3(1.3,-1,-2.4),
      axis: axis, 
      direction: direction
    })


  //오른쪽 뒷바퀴
  wheelBody4 = new CANNON.Body({ mass: 1,material: wheelMaterial });
  wheelBody4.addShape(wheelShape);
  wheelBody4.angularDamping= 0.4;



  vehicle.addWheel({
      body : wheelBody4,
      position : new CANNON.Vec3(-1.3,-1,-2.4),
      axis: axis, 
      direction: direction
    })
 

  

 
  vehicle.addToWorld(world)
}

async function addCube(){
  // let geometry = new THREE.BoxGeometry(2,2,2);
  // let material = new THREE.MeshBasicMaterial({color: 'pink'});
  // cubeThree = new THREE.Mesh(geometry, material);
  // cubeThree.position.set(0, 1, 0);
  // console.log(cubeThree, "cube");
  // scene.add(cubeThree);

  const gltfLoader = new GLTFLoader().setPath( 'src/assets/' );
	const carLoaddedd = await gltfLoader.loadAsync( 'car.glb' );


	cubeThree = carLoaddedd.scene.children[0];
  cubeThree.position.set(0, 1, 10);
  scene.add(cubeThree);

  const carLoaddedd2 = await gltfLoader.loadAsync( 'std_car01.glb' );


	cubeThree2 = carLoaddedd2.scene.children[0];
  cubeThree2.position.set(-10, 1, -24);
  scene.add(cubeThree2);



}


function addPlaneBody(){
  groundMaterial = new CANNON.Material('ground')
  const planeShape = new CANNON.Box(new CANNON.Vec3(50, 0.01, 50));
	planeBody = new CANNON.Body({ mass: 0, material: groundMaterial });
	planeBody.addShape(planeShape);
	planeBody.position.set(0, 0, -45);
	world.addBody(planeBody);
}



function addPlane(){
  const texture = new THREE.TextureLoader().load( "src/assets/parking.png" );

  let geometry =  new THREE.BoxGeometry(100, 0, 100);
  let material = new THREE.MeshBasicMaterial({map: texture});
  let planeThree = new THREE.Mesh(geometry, material);
  planeThree.position.set(0, 0, -45);
  scene.add(planeThree);
}

function addObstacleBody(){

  for (let i = 0; i < 5; i++) {
    let obstacleShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
    obstacleBody = new CANNON.Body({ mass: 1 });
    obstacleBody.addShape(obstacleShape);
		obstacleBody.position.set(0, 5,-(i+1) * 15);

    world.addBody(obstacleBody);
    obstaclesBodies.push(obstacleBody);

  }
}

function addObstacle(){
 
  let geometry = new THREE.BoxGeometry(2,2,2);
  const texture = new THREE.TextureLoader().load( "src/assets/obstacle.png" );

  let material = new THREE.MeshBasicMaterial({ map: texture});

  let obstacle = new THREE.Mesh(geometry, material);

  for (let i = 0; i < 5; i++) {
		let obstacleMesh = obstacle.clone();
		scene.add(obstacleMesh);
		obstaclesMeshes.push(obstacleMesh);
	}
}


function addContactMaterials(){
  const slippery_ground = new CANNON.ContactMaterial(groundMaterial, slipperyMaterial, {
    friction: 0.00,
    restitution: 0.1, //bounciness
    contactEquationStiffness: 1e8,
    contactEquationRelaxation: 3,
  })

  // We must add the contact materials to the world
  world.addContactMaterial(slippery_ground)

}


function addKeysListener(){
  window.addEventListener('keydown', function(event){
    keyboard[event.keyCode] = true;
  } , false);
  window.addEventListener('keyup', function(event){
    keyboard[event.keyCode] = false;
  } , false);
}




function movePlayer(){

  // up letter W
  // if(keyboard[87]) cubeThree.position.z -= 0.1
  // if(keyboard[87]) cubeThree.translateZ(-0.1);

  let maxForce = 10;
  let maxStreetVal = Math.pi / 8;

  const strengthWS = 500;
  if(keyboard[87]) {
    vehicle.setWheelForce(maxForce,0)
    vehicle.setWheelForce(maxForce,1)
  }

  // down letter S
  if(keyboard[83]) {
    vehicle.setWheelForce(-maxForce / 2,0)
    vehicle.setWheelForce(-maxForce / 2,1)
  }

  // left letter A
  // if(keyboard[65]) cube.rotation.y += 0.01;
  // if(keyboard[65]) cube.rotateY(0.01);

  if(keyboard[65]) {
    vehicle.setSteeringValue(maxStreetVal,0)
    vehicle.setSteeringValue(maxStreetVal,1)
  }

  // right letter D
  if(keyboard[68]) {
    vehicle.setSteeringValue(-maxStreetVal,0)
    vehicle.setSteeringValue(-maxStreetVal,1)
  }

}


function followPlayer(){
  // camera.position.x = cubeThree.position.x;
  // camera.position.y = cubeThree.position.y + 5;
  // camera.position.z = cubeBody.position.z + 10;

  camera.position.x = cubeThree.position.x;
  camera.position.y = cubeThree.position.y + 5;
  camera.position.z = cubeThree.position.z + 10;
  
}

function addGUI(){
  controls.enabled = true;
  enableFollow = false;

document.addEventListener("keydown", (event) => {
  if (event.key === "g") {

    camera.position.x = cubeBody.position.x;
    camera.position.y = cubeBody.position.y + 35;
    camera.position.z = cubeBody.position.z + 70;
  }
});


}

function initCannon() {
	// Setup world
	world = new CANNON.World();
	world.gravity.set(0, -9.8, 0);

	initCannonDebugger();
}

function moveCamera() {
  document.addEventListener('keydown', (event) => {
  
    switch (event.key) {
      case '1':
        camera.position.z = camera.position.z - 1;
        break;

      case '2':
        camera.position.z = camera.position.z + 1;
        break;

      case '3':
        camera.position.x = camera.position.x - 1;
        break;

      case '4':
        camera.position.x = camera.position.x + 1;
        break;
      
      case '5':
        camera.position.y = camera.position.y + 1;
        break;

      case '6':
        camera.position.y = camera.position.y - 1;
        break;

    }
  
  })
}
function moveCar() {
  document.addEventListener('keydown', (event) => {
    const maxSteerVal = Math.PI / 8;
    const maxForce = 10;

    switch (event.key) {
      //case 'w':
      case 'ArrowUp':
        vehicle.setWheelForce(maxForce, 0);
        vehicle.setWheelForce(maxForce, 1);
        break;

      //case 's':
      case 'ArrowDown':
        vehicle.setWheelForce(-maxForce / 2, 0);
        vehicle.setWheelForce(-maxForce / 2, 1);
        break;

      //case 'a':
      case 'ArrowLeft':
        vehicle.setSteeringValue(maxSteerVal, 0);
        vehicle.setSteeringValue(maxSteerVal, 1);
        break;

      //case 'd':
      case 'ArrowRight':
        vehicle.setSteeringValue(-maxSteerVal, 0);
        vehicle.setSteeringValue(-maxSteerVal, 1);
        break;
      case 'p':
        console.log("오른쪽 앞바퀴" + "x:" + wheelBody1.position.x + " y:" + wheelBody1.position.y + " z:"+ wheelBody1.position.z)
        console.log("왼쪽 앞바퀴" + "x:" + wheelBody2.position.x + " y:" + wheelBody2.position.y + " z:"+ wheelBody2.position.z)
        console.log("왼쪽 뒷바퀴" + "x:" + wheelBody3.position.x + " y:" + wheelBody3.position.y + " z:"+ wheelBody3.position.z)
        console.log("오른쪽 뒷바퀴" + "x:" + wheelBody4.position.x + " y:" + wheelBody4.position.y + " z:"+ wheelBody4.position.z)
    }
  });

  // reset car force to zero when key is released
  document.addEventListener('keyup', (event) => {
    switch (event.key) {
      //case 'w':
      case 'ArrowUp':
        vehicle.setWheelForce(0, 0);
        vehicle.setWheelForce(0, 1);
        break;

      //case 's':
      case 'ArrowDown':
        vehicle.setWheelForce(0, 0);
        vehicle.setWheelForce(0, 1);
        break;

      //case 'a':
      case 'ArrowLeft':
        vehicle.setSteeringValue(0, 0);
        vehicle.setSteeringValue(0, 1);
        break;

      //case 'd':
      case 'ArrowRight':
        vehicle.setSteeringValue(0, 0);
        vehicle.setSteeringValue(0, 1);
        break;
        
    }
  });
}

function initCannonDebugger(){
  cannonDebugger = new CannonDebugger(scene, world, {
		onInit(body, mesh) {
      mesh.visible = false;
			// Toggle visibiliy on "d" press
			document.addEventListener("keydown", (event) => {
				if (event.key === "c") {
					mesh.visible = !mesh.visible;
				}
			});
		},
	});
}

function createCustomShape(){
  const vertices = [
		new CANNON.Vec3(2, 0, 0),
		new CANNON.Vec3(2, 0, 2),
		new CANNON.Vec3(2, 2, 0),
		new CANNON.Vec3(0, 0, 0),
		new CANNON.Vec3(0, 0, 2),
		new CANNON.Vec3(0, 2, 0),
	]

	return new CANNON.ConvexPolyhedron({
		vertices,
		faces: [
      [3, 4, 5],
			[2, 1, 0],
			[1,2,5,4],
			[0,3,4,1],
			[0,2,5,3],
		]
	})
}

 function checkParkingLot() {

    //왼쪽앞바퀴와 왼쪽 뒷바퀴가 주차 자리에 들어오면 z축
    if((wheelBody2.position.z > -42.5 && wheelBody2.position.z < 40) && (wheelBody3.position.z < -39 && wheelBody3.position.z <-37.5 )){
      if((wheelBody3.position.x > 21.5 && wheelBody3.position.x < 30) && wheelBody3.position.x < 31)
        console.log("주차성공") 
    }
      
}


async function addBackground(){
	const gltfLoader = new GLTFLoader().setPath( 'src/assets/' );

	const mountainLoaded = await gltfLoader.loadAsync( 'mountain.glb' );
	let mountainMesh = mountainLoaded.scene.children[0];
	mountainMesh.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 180 *90);
	mountainMesh.position.set(0, 60, -90);
	mountainMesh.scale.set(0.008,0.008,0.008);
	scene.add(mountainMesh);

	const domeLoaded = await gltfLoader.loadAsync( 'skydome.glb' );
	let domeMesh = domeLoaded.scene.children[0];
	domeMesh.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 180 *90);
	domeMesh.position.set(0, -40, 0);
	domeMesh.scale.set(0.1, 0.1, 0.1);
	scene.add(domeMesh);
}

