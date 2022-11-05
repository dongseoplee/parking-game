import * as THREE from "three";
import { GLTFLoader } from '../threejs/examples/jsm/loaders/GLTFLoader.js';
import { FlyControls} from '../threejs/examples/jsm/controls/FlyControls.js';

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

//tree
let tree2
let tree3
let tree4
let tree5
let tree6
let tree7
let tree8
let tree9

//car
let std_car01
let std_car02
let std_car03
let std_car04
let std_car05
let scooter
let cubeBody2
let cubeBody3
let cubeBody2ds
let cubeBody3ds
let tree
let statue
let cubeThree2ds
let cubeThree3ds

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

//gear Lock
let gearLock = false;

//sound
var engine = document.getElementById('engineSound');
var reverse = document.getElementById('reverseSound');
var parkingSound = document.getElementById('parkingSound');
var gearShift = document.getElementById('gearShiftSound');
var countDown = document.getElementById("countDownSound");
var timeout = document.getElementById("timeoutSound");

//timer
var time = 60;
var min = "";
var sec = "";

<<<<<<< HEAD
=======
var first = true;

>>>>>>> J1-coding

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
  //firework

  addPlaneBody();
  addPlane();

  addCubeBody();
  await addCube();

  addWheelBody(); 

  addObstacle();
  addObstacleBody();
  
  moveCar();
  
  addWall();
  //addWall2();
  

	addGUI();

  animate()
  setInterval(checkParkingLot, 1000)

}


function addWall() {
  const texture = new THREE.TextureLoader().load( "src/assets/wall3.jpeg" );

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

  //2
  cubeThree2ds.position.copy(cubeBody2ds.position);
  cubeThree2ds.quaternion.copy(cubeBody2ds.quaternion);

  //3
  cubeThree3ds.position.copy(cubeBody3ds.position);
  cubeThree3ds.quaternion.copy(cubeBody3ds.quaternion);

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
  cubeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI /180 * 2);
  
  cubeBody.position.set(45, 5, -23);
  //cubeBody.position.set(-40, 5, -50);
  cubeBody.linearDamping = 0.5;

  vehicle = new CANNON.RigidVehicle({
    chassisBody : cubeBody
  })
 
  world.addBody(cubeBody);

  //2
  let cubeShape2ds = new CANNON.Box(new CANNON.Vec3(4, 1, 0.5)); //캐논 박스 사이즈
  //slipperyMaterial = new CANNON.Material('slippery');
  cubeBody2ds = new CANNON.Body({ mass: 4 });
  cubeBody2ds.addShape(cubeShape2ds, new CANNON.Vec3(0,0,0));
  // change rotation
  cubeBody2ds.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 180 * 270);
  //cubeBody.position.set(-35, 5, -55);
  //x + 오른쪽, y + 위쪽, z + 앞쪽
  cubeBody2ds.position.set(25, 1, -58.5); //캐본 박스 위치
  
  cubeBody2ds.linearDamping = 0.5;
  world.addBody(cubeBody2ds);

  //3
  let cubeShape3ds = new CANNON.Box(new CANNON.Vec3(2, 3.5, 0.5)); //캐논 박스 사이즈
  //slipperyMaterial = new CANNON.Material('slippery');
  cubeBody3ds = new CANNON.Body({ mass: 4 });
  cubeBody3ds.addShape(cubeShape3ds, new CANNON.Vec3(0,0,0));
  // change rotatio
  cubeBody3ds.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 1, 1), Math.PI / 180 * 270);
  //cubeBody.position.set(-35, 5, -55);
  //x + 오른쪽, y + 위쪽, z + 앞쪽
  cubeBody3ds.position.set(25, 6, -70); //캐본 박스 위치
  
  cubeBody3ds.linearDamping = 0.5;
  world.addBody(cubeBody3ds);


  //평행주차 장애물
  cubeBody2 = new CANNON.Body({ mass: 5 });
  cubeBody2.addShape(cubeShape, new CANNON.Vec3(0,0,-1));
  // change rotation
  cubeBody2.position.set(-24, 3, -21.5);
  cubeBody2.linearDamping = 0.5;
  cubeBody2.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 180*180);
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


  //2
  const carLoaddedd2ds = await gltfLoader.loadAsync( 'std_car01.glb' );
	cubeThree2ds = carLoaddedd2ds.scene.children[0];
  cubeThree2ds.scale.set(0.05, 0.03, 0.03);
  scene.add(cubeThree2ds);

  //3
  const carLoaddedd3ds = await gltfLoader.loadAsync( 'std_car06.glb' );
	cubeThree3ds = carLoaddedd3ds.scene.children[0];
  cubeThree3ds.scale.set(0.15, 0.15, 0.15);
  scene.add(cubeThree3ds);

    const stdLoaddedd=await gltfLoader.loadAsync('classic_muscle_car.glb');
    std_car01=stdLoaddedd.scene.children[0];
    std_car01.scale.set(0.85,0.85,0.85);
    std_car01.rotation.z=Math.PI*1;
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

    const treeLoaddedd2=await gltfLoader.loadAsync('tree.glb')
    tree2=treeLoaddedd2.scene.children[0];
    // scooter.scale.set(4.5,4.5,4.5)
    tree2.position.set(40,0,-50)
    // scooter.rotation.z=Math.PI*-0.5;
    scene.add(tree2)

    const treeLoaddedd3=await gltfLoader.loadAsync('tree.glb')
    tree3=treeLoaddedd3.scene.children[0];
    // scooter.scale.set(4.5,4.5,4.5)
    tree3.position.set(40,0,-65)
    // scooter.rotation.z=Math.PI*-0.5;
    scene.add(tree3)

    const treeLoaddedd4=await gltfLoader.loadAsync('tree.glb')
    tree4=treeLoaddedd4.scene.children[0];
    // scooter.scale.set(4.5,4.5,4.5)
    tree4.position.set(40,0,-80)
    // scooter.rotation.z=Math.PI*-0.5;
    scene.add(tree4)

    //왼쪽 나무들


    const treeLoaddedd6=await gltfLoader.loadAsync('tree.glb')
    tree6=treeLoaddedd6.scene.children[0];
    // scooter.scale.set(4.5,4.5,4.5)
    tree6.position.set(-25,0,-53)
    // scooter.rotation.z=Math.PI*-0.5;
    scene.add(tree6)

    const treeLoaddedd7=await gltfLoader.loadAsync('tree.glb')
    tree7=treeLoaddedd7.scene.children[0];
    // scooter.scale.set(4.5,4.5,4.5)
    tree7.position.set(-25,0,-68)
    // scooter.rotation.z=Math.PI*-0.5;
    scene.add(tree7)

    const treeLoaddedd8=await gltfLoader.loadAsync('tree.glb')
    tree8=treeLoaddedd8.scene.children[0];
    // scooter.scale.set(4.5,4.5,4.5)
    tree8.position.set(-25,0,-83)
    // scooter.rotation.z=Math.PI*-0.5;
    scene.add(tree8)

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
  const texture = new THREE.TextureLoader().load( "src/assets/reverseParking.png" );

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
		
    //평행주차 장애물
    //obstacleBody.position.set(-25, 2, -30);
    obstacleBody.position.set(0, 2, -30);

    world.addBody(obstacleBody);
    obstaclesBodies.push(obstacleBody);

    //2
    obstacleBody = new CANNON.Body({ mass: 0.5 });
    obstacleBody.addShape(obstacleShape);
		obstacleBody.position.set(0, 2, -10);

    world.addBody(obstacleBody);
    obstaclesBodies.push(obstacleBody);

    //3
    obstacleBody = new CANNON.Body({ mass: 0.5 });
    obstacleBody.addShape(obstacleShape);
		obstacleBody.position.set(-30, 2, -10);

    world.addBody(obstacleBody);
    obstaclesBodies.push(obstacleBody);

    //4
    obstacleBody = new CANNON.Body({ mass: 0.5 });
    obstacleBody.addShape(obstacleShape);
		obstacleBody.position.set(-23, 2, -45);

    world.addBody(obstacleBody);
    obstaclesBodies.push(obstacleBody);

    //5
    obstacleBody = new CANNON.Body({ mass: 0.5 });
    obstacleBody.addShape(obstacleShape);
		obstacleBody.position.set(-26, 2, -45);

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
    if (event.key === "z") {

      document.getElementById("baseCamera").src = "src/assets/camera/baseCameraClick.png";
      document.getElementById("flyCamera").src = "src/assets/camera/flyCamera.png";
      document.getElementById("carCamera").src = "src/assets/camera/carCamera.png";

      camera.rotation.x = 0
      camera.rotation.y = 0
      camera.rotation.z = 0

      isFirstPersonCamera = false  
      controls.enabled = false;
      enableFollow = true;
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "x") {
      document.getElementById("baseCamera").src = "src/assets/camera/baseCamera.png"
      document.getElementById("flyCamera").src = "src/assets/camera/flyCameraClick.png";
      document.getElementById("carCamera").src = "src/assets/camera/carCamera.png";

      camera.rotation.x = 0
      camera.rotation.y = 0
      camera.rotation.z = 0
      
      isFirstPersonCamera = false
      controls.enabled = true;
      enableFollow = false;
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "c") {
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

//key down
function moveCar() {
  document.addEventListener('keydown', (event) => {
    const maxSteerVal = Math.PI / 8;
    const maxForce = 10;

    switch (event.key) {
      //case 'w':
      case 'ArrowUp':

        if(!gearLock){
        document.getElementById("arrowUp").src = "src/assets/keyboard/arrowUpClick.png";
        vehicle.setWheelForce(maxForce, 0);
        vehicle.setWheelForce(maxForce, 1);
        if(engine.pause)
          {
          engine.play();
          }
        }
        break;

      //case 's':
      case 'ArrowDown':
        if(!gearLock){
        document.getElementById("arrowDown").src = "src/assets/keyboard/arrowDownClick.png";
        vehicle.setWheelForce(-maxForce / 2, 0);
        vehicle.setWheelForce(-maxForce / 2, 1);
        if(reverse.pause)
          {
          reverse.play();
          }
        }
        break;

      //case 'a':
      case 'ArrowLeft':
        if(!gearLock){
        document.getElementById("arrowLeft").src = "src/assets/keyboard/arrowLeftClick.png";
        vehicle.setSteeringValue(maxSteerVal, 0);
        vehicle.setSteeringValue(maxSteerVal, 1);
        }
        break;

      //case 'd':
      case 'ArrowRight':
        if(!gearLock){
        document.getElementById("arrowRight").src = "src/assets/keyboard/arrowRightClick.png";
        vehicle.setSteeringValue(-maxSteerVal, 0);
        vehicle.setSteeringValue(-maxSteerVal, 1);
        }
        break;
      
      case 't':
        console.log("오른쪽 앞바퀴" + "x:" + wheelBody1.position.x + " y:" + wheelBody1.position.y + " z:"+ wheelBody1.position.z)
        console.log("오른쪽 뒷바퀴" + "x:" + wheelBody4.position.x + " y:" + wheelBody4.position.y + " z:"+ wheelBody4.position.z)
        break;

        //parking
      case 'p':
        
        if(!gearLock){
          document.getElementById("parkingGear").src = "src/assets/keyboard/gearP.png";
          gearLock = true;
          //gearShift.pause();
          parkingSound.play();
        }
        else if(gearLock)
        {
          document.getElementById("parkingGear").src = "src/assets/keyboard/gearP2.png";
          gearLock = false;
          //parkingSound.pause();
          gearShift.play();
        }
        
        console.log("오른쪽 앞바퀴" + "x:" + wheelBody1.position.x + " y:" + wheelBody1.position.y + " z:"+ wheelBody1.position.z)
        console.log("왼쪽 앞바퀴" + "x:" + wheelBody2.position.x + " y:" + wheelBody2.position.y + " z:"+ wheelBody2.position.z)
        console.log("왼쪽 뒷바퀴" + "x:" + wheelBody3.position.x + " y:" + wheelBody3.position.y + " z:"+ wheelBody3.position.z)
        console.log("오른쪽 뒷바퀴" + "x:" + wheelBody4.position.x + " y:" + wheelBody4.position.y + " z:"+ wheelBody4.position.z)
        break;

        
    }
  });

  


  // reset car force to zero when key is released
  document.addEventListener('keyup', (event) => {
    switch (event.key) {
      //case 'w':
      case 'ArrowUp':
        if(!gearLock){
        document.getElementById("arrowUp").src = "src/assets/keyboard/arrowUp.png";
        vehicle.setWheelForce(0, 0);
        vehicle.setWheelForce(0, 1);
        
        engine.pause();
        engine.src = engine.src;
        }
        break;

      //case 's':
      case 'ArrowDown':
        if(!gearLock){
        document.getElementById("arrowDown").src = "src/assets/keyboard/arrowDown.png";
        vehicle.setWheelForce(0, 0);
        vehicle.setWheelForce(0, 1);

        reverse.pause();
        reverse.src = reverse.src;
        }
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
        
    }
  });
}



function initCannonDebugger(){
  cannonDebugger = new CannonDebugger(scene, world, {
		onInit(body, mesh) {
      mesh.visible = false;
			// Toggle visibiliy on "d" press
			document.addEventListener("keydown", (event) => {
				if (event.key === "v") {
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

    
    // 오른쪽 앞바퀴
    if((wheelBody1.position.x > 21.8 && wheelBody1.position.x < 28.3) &&
     (wheelBody1.position.z > -66.5 && wheelBody1.position.z < -64.2))
    {
      // 왼쩍 뒷바퀴
      if((wheelBody3.position.x > 26.3 && wheelBody3.position.x < 34.8) && 
      (wheelBody3.position.z < -62 && wheelBody3.position.z > -64.2)) {
        console.log("주차성공");
<<<<<<< HEAD
        //p누르면 넘어감
        if(gearLock)
        {
            localStorage.setItem('result', time);
=======
        document.getElementById("parkingGear").src = "src/assets/keyboard/gearP3.png";
        //p누르면 넘어감
        if(gearLock)
        {
          if(first)
          {
            localStorage.setItem('result3', time);
            const checkconsole = localStorage.getItem('result3') || null
            console.log(checkconsole + '3차');
            first = false;
          }
>>>>>>> J1-coding
            // setTimeout(function(){window.location.href= "./index2.html"},500);
            setTimeout(function(){window.location.href= "./end_src/timeout.html"},500);
        }
      }
    }
      
}
//BGM here!!
window.addEventListener("DOMContentLoaded", event => {
  const audio = document.querySelector("audio");
  audio.volume = 0.6;
  audio.play();
});

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

var x = setInterval(function(){
  min = parseInt(time/60);
  sec=time%60;
  document.getElementById("timer").innerHTML=min+"m"+" "+sec+"s";
  --time;

  if(time<11)
  {
    countDown.play();
  }

  if(time<0){
    //obviously, time score is 0 if timeout
<<<<<<< HEAD
    localStorage.setItem('result', 0);
=======
    localStorage.setItem('result3', 0);
>>>>>>> J1-coding

    countDown.pause();
    clearInterval (x);
    document.getElementById("timer").innerHTML = "Time Over"
    gearLock = true;
    timeout.play();
    setTimeout(function(){window.location.href= "./end_src/timeout.html"},5000);
    //go to timeout.html


  }
},1000);