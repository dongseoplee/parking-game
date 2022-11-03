import * as THREE from "three";
import { OrbitControls} from '../threejs/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '../threejs/examples/jsm/loaders/GLTFLoader.js';
import GUI from '../threejs/examples/jsm/libs/lil-gui.module.min.js';
import { FlyControls} from '../threejs/examples/jsm/controls/FlyControls.js';
import { PointerLockControls} from '../threejs/examples/jsm/controls/PointerLockControls.js';
import { FirstPersonControls} from '../threejs/examples/jsm/controls/FirstPersonControls.js';




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
let cameraWheel
let isFirstPersonCamera = false



//
let std_car01
let std_car02
let std_car03
let std_car04
let std_car05
let scooter
let cubeBody2
let cubeBody3
let tree
let statue

// helpers to debug
let controls;


// show and move cube
let cubeThree;
let keyboard = {};

// camera follow player
let enableFollow = true;

// cannon variables
let world;
let cannonDebugger;
let timeStep = 1 / 60;
let cubeBody, planeBody;
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

  addObstacle();
  addObstacleBody();

  moveCar();


  //addWallBody();
  addWall();


	addGUI();

  animate()
  setInterval(checkParkingLot, 1000)
}

function addWall() {

  const texture = new THREE.TextureLoader().load( "src/assets/wall.jpeg" );

  //크기
  let geometry =  new THREE.BoxGeometry(100, 0, 50);
  let material = new THREE.MeshBasicMaterial({map: texture});
  let planeThree = new THREE.Mesh(geometry, material);

  //위치
  planeThree.position.set(-1, 30,-100);
  //각도
  planeThree.quaternion.setFromAxisAngle(new CANNON.Vec3(80, 0, 0), Math.PI / 180);

    // change rotation

  scene.add(planeThree);

}




function animate(){
	renderer.render(scene, camera);

  if (enableFollow) followPlayer();

  world.step(timeStep);
	cannonDebugger.update();

  cubeThree.position.copy(cubeBody.position);
  cubeThree.position.y = cubeBody.position.y - 1.3;
  cubeThree.quaternion.copy(cubeBody.quaternion);

    std_car01.position.copy(cubeBody2.position);

    std_car02.position.copy(cubeBody3.position);

  for (let i = 0; i < obstaclesBodies.length; i++) {
    obstaclesMeshes[i].position.copy(obstaclesBodies[i].position);
		obstaclesMeshes[i].quaternion.copy(obstaclesBodies[i].quaternion);
	}
  controls.update(0.05)

	requestAnimationFrame(animate);

}

function addCubeBody(){
  let cubeShape = new CANNON.Box(new CANNON.Vec3(1.5,1,5));
  //slipperyMaterial = new CANNON.Material('slippery');
  cubeBody = new CANNON.Body({ mass: 4 });
  cubeBody.addShape(cubeShape, new CANNON.Vec3(0,0,-1));

  // change rotation
  cubeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 180);
  
  cubeBody.position.set(-35, 5, -55);
  //cubeBody.position.set(15, 5, -50);
  cubeBody.linearDamping = 0.5;

  vehicle = new CANNON.RigidVehicle({
    chassisBody : cubeBody
  })
 
  world.addBody(cubeBody);

    cubeBody2 = new CANNON.Body({ mass: 5 });
    cubeBody2.addShape(cubeShape, new CANNON.Vec3(0,0,-1));
    // change rotation
    cubeBody2.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 180*90);
    cubeBody2.position.set(25, 5, -35);
    cubeBody2.linearDamping = 0.5;
    world.addBody(cubeBody2);

    cubeBody3 = new CANNON.Body({ mass: 5 });
    cubeBody3.addShape(cubeShape, new CANNON.Vec3(0,0,-1));
    cubeBody3.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 180*90);
    cubeBody3.position.set(25, 5, -47);
    cubeBody3.linearDamping = 0.5;
    world.addBody(cubeBody3);

}

async function addCube(){
  const gltfLoader = new GLTFLoader().setPath( 'src/assets/' );
  const carLoaddedd = await gltfLoader.loadAsync( 'car.glb' );


	cubeThree = carLoaddedd.scene.children[0];
  cubeThree.scale.set(0.015,0.015,0.015)
  scene.add(cubeThree)


    const stdLoaddedd=await gltfLoader.loadAsync('classic_muscle_car.glb');
    std_car01=stdLoaddedd.scene.children[0];
    std_car01.scale.set(0.85,0.85,0.85);
    std_car01.rotation.z=Math.PI*0.5;
    scene.add(std_car01)

    const std2Loaddedd=await gltfLoader.loadAsync('carr.glb');
    std_car02=std2Loaddedd.scene.children[0];
    std_car02.scale.set(0.9,0.9,0.9)
    std_car02.rotation.z=Math.PI*0.5;
    scene.add(std_car02)

    //just gltf car

    const std3Loaddedd=await gltfLoader.loadAsync('std_car03.glb');
    std_car03=std3Loaddedd.scene.children[0];
    std_car03.scale.set(0.015,0.015,0.015)
    std_car03.position.set(-14,0,-47)
    std_car03.rotation.z=Math.PI*0.5;
    scene.add(std_car03)

    const std4Loaddedd=await gltfLoader.loadAsync('std_car04.glb');
    std_car04=std4Loaddedd.scene.children[0];
    std_car04.scale.set(0.015,0.015,0.015)
    std_car04.position.set(-14,0,-42)
    // std_car04.rotation.z=Math.PI*0.5;
    scene.add(std_car04)

    const std5Loaddedd=await gltfLoader.loadAsync('std_car05.glb');
    std_car05=std5Loaddedd.scene.children[0];
    std_car05.scale.set(0.05,0.05,0.05)
    std_car05.position.set(-22.5,0,-42)
    // std_car04.rotation.z=Math.PI*0.5;
    scene.add(std_car05)

    const statueLoaddedd=await gltfLoader.loadAsync('statue.glb');
    statue=statueLoaddedd.scene.children[0];
    statue.position.set(6,4,-80)
    statue.scale.set(2,2,2)
    // std_car04.rotation.z=Math.PI*0.5;
    scene.add(statue)

    const scooterLoaddedd=await gltfLoader.loadAsync('vino.glb')
    scooter=scooterLoaddedd.scene.children[0];
    scooter.scale.set(4.5,4.5,4.5)
    scooter.position.set(-13,0,-35)
    scooter.rotation.z=Math.PI*-0.5;
    scene.add(scooter)

    const treeLoaddedd=await gltfLoader.loadAsync('tree.glb')
    tree=treeLoaddedd.scene.children[0];
    // scooter.scale.set(4.5,4.5,4.5)
    tree.position.set(40,0,-35)
    // scooter.rotation.z=Math.PI*-0.5;
    scene.add(tree)
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
      position : new CANNON.Vec3(1.3,-1,-3.7),
      axis: axis, 
      direction: direction
    })


  //오른쪽 뒷바퀴
  wheelBody4 = new CANNON.Body({ mass: 1,material: wheelMaterial });
  wheelBody4.addShape(wheelShape);
  wheelBody4.angularDamping= 0.4;


  vehicle.addWheel({
      body : wheelBody4,
      position : new CANNON.Vec3(-1.3,-1,-3.7),
      axis: axis, 
      direction: direction
    })
 


  //카메라
  cameraWheel = new CANNON.Body({ mass: 1,material: wheelMaterial });
  cameraWheel.addShape(wheelShape);
  cameraWheel.angularDamping= 0.4;



  vehicle.addWheel({
      body : cameraWheel,
      position : new CANNON.Vec3(0,6,-5),
      //position : new CANNON.Vec3(0.5,2.3,3),
      axis: axis, 
      direction: direction
    })
  

 
  vehicle.addToWorld(world)
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

    //1
    let obstacleShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
    obstacleBody = new CANNON.Body({ mass: 0.5 });
    obstacleBody.addShape(obstacleShape);
		obstacleBody.position.set(-30, 2, -30);

    world.addBody(obstacleBody);
    obstaclesBodies.push(obstacleBody);

    //2
    obstacleBody = new CANNON.Body({ mass: 0.5 });
    obstacleBody.addShape(obstacleShape);
		obstacleBody.position.set(-30, 2, -35);

    world.addBody(obstacleBody);
    obstaclesBodies.push(obstacleBody);

    //3
    obstacleBody = new CANNON.Body({ mass: 0.5 });
    obstacleBody.addShape(obstacleShape);
		obstacleBody.position.set(-30, 2, -40);

    world.addBody(obstacleBody);
    obstaclesBodies.push(obstacleBody);

    //4
    obstacleBody = new CANNON.Body({ mass: 0.5 });
    obstacleBody.addShape(obstacleShape);
		obstacleBody.position.set(-30, 2, -45);

    world.addBody(obstacleBody);
    obstaclesBodies.push(obstacleBody);

    //5
    obstacleBody = new CANNON.Body({ mass: 0.5 });
    obstacleBody.addShape(obstacleShape);
		obstacleBody.position.set(-30, 2, -50);

    world.addBody(obstacleBody);
    obstaclesBodies.push(obstacleBody);
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







function followPlayer(){

  if(isFirstPersonCamera == false) {

    camera.position.x = cubeBody.position.x;
    camera.position.y = cubeBody.position.y + 30;
    camera.position.z = cubeBody.position.z + 70;


  } else {
    camera.position.x = cameraWheel.position.x;
    camera.position.y = cameraWheel.position.y;
    camera.position.z = cameraWheel.position.z;
    camera.lookAt(new THREE.Vector3(cubeBody.position.x, 5, cubeBody.position.z));
}
  
}






function addGUI(){

  document.addEventListener("keydown", (event) => {
    if (event.key === "v") {

      document.getElementById("baseCamera").src = "src/assets/camera/baseCameraClick.png";
      document.getElementById("flyCamera").src = "src/assets/camera/flyCamera.png";
      document.getElementById("carCamera").src = "src/assets/camera/carCamera.png";

      isFirstPersonCamera = false
      camera.rotation.x = 0
      camera.rotation.y = 0
      camera.rotation.z = 0
  
      controls.enabled = false;
      enableFollow = true;
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "g") {
      document.getElementById("baseCamera").src = "src/assets/camera/baseCamera.png"
      document.getElementById("flyCamera").src = "src/assets/camera/flyCameraClick.png";
      document.getElementById("carCamera").src = "src/assets/camera/carCamera.png";

      isFirstPersonCamera = false
      controls.enabled = true;
      enableFollow = false;
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "z") {
      document.getElementById("baseCamera").src = "src/assets/camera/baseCamera.png";
      document.getElementById("flyCamera").src = "src/assets/camera/flyCamera.png";
      document.getElementById("carCamera").src = "src/assets/camera/carCameraClick.png";

      isFirstPersonCamera = true
      camera.rotation.y = Math.PI/180 * 180;
      controls.enabled = false;
      enableFollow = true;
    }
  });
  
}



function initCannon() {
	// Setup world
	world = new CANNON.World();
	world.gravity.set(0, -9.8, 0);

	initCannonDebugger();
}


function moveCar() {
  document.addEventListener('keydown', (event) => {
    const maxSteerVal = Math.PI / 8;
    const maxForce = 10;

    switch (event.key) {
      //case 'w':
      case 'ArrowUp':
        document.getElementById("arrowUp").src = "src/assets/keyboard/arrowUpClick.png";
        vehicle.setWheelForce(maxForce, 0);
        vehicle.setWheelForce(maxForce, 1);
        
        break;

      //case 's':
      case 'ArrowDown':
        document.getElementById("arrowDown").src = "src/assets/keyboard/arrowDownClick.png";
        vehicle.setWheelForce(-maxForce / 2, 0);
        vehicle.setWheelForce(-maxForce / 2, 1);
        break;

      //case 'a':
      case 'ArrowLeft':
        document.getElementById("arrowLeft").src = "src/assets/keyboard/arrowLeftClick.png";
        vehicle.setSteeringValue(maxSteerVal, 0);
        vehicle.setSteeringValue(maxSteerVal, 1);
        break;

      //case 'd':
      case 'ArrowRight':
        document.getElementById("arrowRight").src = "src/assets/keyboard/arrowRightClick.png";
        vehicle.setSteeringValue(-maxSteerVal, 0);
        vehicle.setSteeringValue(-maxSteerVal, 1);
        break;
      case 'p':
        console.log("오른쪽 앞바퀴" + "x:" + wheelBody1.position.x + " y:" + wheelBody1.position.y + " z:"+ wheelBody1.position.z)
        console.log("왼쪽 앞바퀴" + "x:" + wheelBody2.position.x + " y:" + wheelBody2.position.y + " z:"+ wheelBody2.position.z)
        console.log("왼쪽 뒷바퀴" + "x:" + wheelBody3.position.x + " y:" + wheelBody3.position.y + " z:"+ wheelBody3.position.z)
        console.log("오른쪽 뒷바퀴" + "x:" + wheelBody4.position.x + " y:" + wheelBody4.position.y + " z:"+ wheelBody4.position.z)
        break;
      case 't':
        console.log("오른쪽 앞바퀴" + "x:" + wheelBody1.position.x + " y:" + wheelBody1.position.y + " z:"+ wheelBody1.position.z)
        console.log("오른쪽 뒷바퀴" + "x:" + wheelBody4.position.x + " y:" + wheelBody4.position.y + " z:"+ wheelBody4.position.z)
        break;
    }
  });

  // reset car force to zero when key is released
  document.addEventListener('keyup', (event) => {
    switch (event.key) {
      //case 'w':
      case 'ArrowUp':
        document.getElementById("arrowUp").src = "src/assets/keyboard/arrowUp.png";
        vehicle.setWheelForce(0, 0);
        vehicle.setWheelForce(0, 1);
        break;

      //case 's':
      case 'ArrowDown':
        document.getElementById("arrowDown").src = "src/assets/keyboard/arrowDown.png";
        vehicle.setWheelForce(0, 0);
        vehicle.setWheelForce(0, 1);
        break;

      //case 'a':
      case 'ArrowLeft':
        document.getElementById("arrowLeft").src = "src/assets/keyboard/arrowLeft.png";
        vehicle.setSteeringValue(0, 0);
        vehicle.setSteeringValue(0, 1);
       
        break;

      //case 'd':
      case 'ArrowRight':
        document.getElementById("arrowRight").src = "src/assets/keyboard/arrowRight.png";
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

    //왼쪽 바퀴가 주차 공간에 들어 왔을 경우

    if((wheelBody1.position.x > 26 && wheelBody1.position.x <30.2) &&
     (wheelBody1.position.z < -38 && wheelBody1.position.z >-40.5))
    {
      if((wheelBody3.position.x > 21.3 && wheelBody3.position.x <26) && 
      (wheelBody3.position.z < -40.5 && wheelBody3.position.z >-43)) {
        document.getElementById("parking").src = "src/assets/213.png";
        isParking = true;
        console.log("주차성공")
      }
    } else {
      isParking = false;
      document.getElementById("parking").src = "src//assets/wall2.png";
    }
    // if((wheelBody2.position.z > -42.5 && wheelBody2.position.z < 40) && (wheelBody3.position.z < -39 && wheelBody3.position.z <-37.5 )){
    //   if((wheelBody1.position.x > 26 && wheelBody1.position.x < 31 && (wheelBody4.position.x > 21.8 && wheelBody4.position.x < 26)))
    //     console.log("주차성공") 
    // }
      
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

