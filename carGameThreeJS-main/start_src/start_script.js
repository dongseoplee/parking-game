(function () {
	'use strict';

	var container,
		renderer,
		camera,
		scene,
		group,
		buttonGroup,

		raycaster = new THREE.Raycaster(),
		raycasterCheck = false,
		intersects,
		mouseVectors = new THREE.Vector2(),

		alertPlaying = false,
		audioContext,
		audioSource,

		blinkTid,
		blinkDelay = 400,
		blinkLimit = 10,

		targetRotationX = 0,
		targetRotationY = 1,
		targetRotationXOnMouseDown = 0,
		targetRotationYOnMouseDown = 0,

		mouseX = 0,
		mouseXOnMouseDown = 0,
		mouseY = 0,
		mouseYOnMouseDown = 0,

		windowHalfX = window.innerWidth / 2,
		windowHalfY = window.innerHeight / 2,

		topSphere,
		buttonMaterial,
		buttonMaterialInner,
		delayInMilliseconds = 2000; 

		


	function init3d() {
		container = document.createElement('div');
		document.body.appendChild(container);

		renderer = new THREE.WebGLRenderer({
			antialias: true
		});

		renderer.setClearColor("rgb(10, 39, 101)");
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);

		camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 5000);
		camera.position.set(0, 0, 200);

		scene = new THREE.Scene();
		scene.add(camera);

		initLights();

		group = new THREE.Group();

		scene.add(group);

		container.appendChild(renderer.domElement);
	}

	function initLights() {
		var light1,
			light2,
			light3,
			light4,
			light5,
			light6;

		light1 = new THREE.PointLight(0xffffff, 0.8, 500);
		light1.position.set(300.0, -300.0, 300.0);

		light2 = new THREE.PointLight(0xffffff, 0.8, 500);
		light2.position.set(-300.0, -300.0, 300.0);

		light3 = new THREE.PointLight(0xffffff, 0.8, 500);
		light3.position.set(0.0, 300.0, 300.0);

		light4 = new THREE.DirectionalLight(0xffffff, 0.5);
		light4.position.set(0.0, -200.0, 200.0);

		light5 = new THREE.DirectionalLight(0xffffff, 0.5);
		light5.position.set(0.0, 200.0, -200.0);

		light6 = new THREE.DirectionalLight(0xffffff, 0.5);
		light6.position.set(-200.0, 200.0, 200.0);

		scene.add(light1);
		scene.add(light2);
		scene.add(light3);
		scene.add(light4);
		scene.add(light5);
		scene.add(light6);

	}

	function initEventBindings() {
		document.addEventListener('mousedown', onDocumentMouseDown, false);
		document.addEventListener('touchstart', onDocumentTouchStart, false);
		document.addEventListener('touchmove', onDocumentTouchMove, false);
		window.addEventListener('resize', onWindowResize, false);
	}

	function createBaseCylinder() {
		var bottomGeometry = new THREE.CylinderGeometry(37, 37, 32, 256, 16, true),
			bottomGeometry2 = new THREE.CylinderGeometry(36, 37, 12, 64),
			topGeometry = new THREE.CylinderGeometry(30, 37, 4, 64),
			batteryGeometry = new THREE.BoxGeometry(50, 10, 25),
			material = new THREE.MeshPhongMaterial({
				color: new THREE.Color('#CDB599FF'),
				shading: THREE.SmoothShading
			}),
			screwMaterial = new THREE.MeshPhongMaterial({
				color: new THREE.Color('#bcc6cc'),
				emissive: new THREE.Color('#333333'),
				shininess: 40,
				metal: true
			}),
			cylinderGroup,
			batteryBox,
			batteryCover,
			batteryCoverBSP,
			bottomCylinder,
			bottomCylinder2,
			bottomBSP,
			topCylinder,
			substractCylinder,
			screw1,
			screw2,
			screw3,
			screw4,
			screwGeometry = new THREE.CylinderGeometry(1.5, 1.5, 3, 64),
			batteryBSP,
			substractBSP,
			substractGeometry = new THREE.CylinderGeometry(2, 2, 5, 64),
			resultBSP,
			resultCylinder,
			bottomCylinderBSP,
			box,
			box2,
			box3,
			boxMesh,
			boxMesh2,
			boxMesh3,
			boxBSP,
			boxBSP2,
			boxBSP3,
			cutCylinder,
			cutCylinderMesh,
			cutCylinderBSP;

		cylinderGroup = new THREE.Group();
		bottomCylinder = new THREE.Mesh(bottomGeometry, material);
		bottomCylinder2 = new THREE.Mesh(bottomGeometry2, material);
		bottomCylinder2.position.y = -10;

		batteryBox = new THREE.Mesh(batteryGeometry);
		batteryBox.position.y = -14;
		batteryBox.position.z = 11;

		screw1 = new THREE.Mesh(screwGeometry, screwMaterial);
		screw2 = new THREE.Mesh(screwGeometry, screwMaterial);
		screw3 = new THREE.Mesh(screwGeometry, screwMaterial);
		screw4 = new THREE.Mesh(screwGeometry, screwMaterial);

		topCylinder = new THREE.Mesh(topGeometry, material);
		substractCylinder = new THREE.Mesh(substractGeometry);

		substractCylinder.position.x = 20;
		substractCylinder.position.z = -20;
		substractCylinder.position.y = -14;

		screw1.position.x = 20;
		screw1.position.z = -20;
		screw1.position.y = -12;

		topCylinder.position.y = 18;

		bottomBSP = new ThreeBSP(bottomCylinder2);
		substractBSP = new ThreeBSP(substractCylinder);
		batteryBSP = new ThreeBSP(batteryBox);

		resultBSP = bottomBSP.subtract(substractBSP);
		resultBSP = resultBSP.subtract(batteryBSP);

		batteryBox = new THREE.Mesh(batteryGeometry);
		batteryBox.scale.x = 0.15;
		batteryBox.position.x = -10;
		batteryBox.position.y = -14;
		batteryBox.position.z = 16;

		batteryBSP = new ThreeBSP(batteryBox);

		resultBSP = resultBSP.subtract(batteryBSP);

		batteryBox = new THREE.Mesh(new THREE.BoxGeometry(50, 12, 35));
		batteryBox.position.y = -10;
		batteryBox.position.z = 11;

		batteryBSP = new ThreeBSP(batteryBox);
		batteryCoverBSP = batteryBSP.subtract(resultBSP);
		batteryCoverBSP = batteryCoverBSP.intersect(bottomBSP);

		substractCylinder.position.x = -10;
		substractCylinder.position.z = 26;
		substractBSP = new ThreeBSP(substractCylinder);
		batteryCoverBSP = batteryCoverBSP.subtract(substractBSP);

		batteryCover = batteryCoverBSP.toMesh(material);
		batteryCover.geometry.computeFaceNormals();
		batteryCover.scale.x = 0.98;
		batteryCover.scale.y = 0.98;
		batteryCover.scale.z = 0.98;

		screw4.position.x = -10;
		screw4.position.z = 26;
		screw4.position.y = -12;

		substractCylinder.position.x = -28;
		substractCylinder.position.z = -10;

		screw2.position.x = -28;
		screw2.position.z = -10;
		screw2.position.y = -12;

		substractBSP = new ThreeBSP(substractCylinder);

		resultBSP = resultBSP.subtract(substractBSP);

		substractCylinder.position.x = 5;
		substractCylinder.position.z = 28;

		screw3.position.x = 5;
		screw3.position.z = 28;
		screw3.position.y = -12;

		substractBSP = new ThreeBSP(substractCylinder);

		resultBSP = resultBSP.subtract(substractBSP);

		resultCylinder = resultBSP.toMesh(material);
		resultCylinder.geometry.computeFaceNormals();

		cylinderGroup.add(topCylinder);
		cylinderGroup.add(resultCylinder);
		//cylinderGroup.add(batteryCover);
		
		box = new THREE.BoxGeometry(72, 5, 72);
		boxMesh = new THREE.Mesh(box);
		boxMesh.position.y = 10;
		boxBSP = new ThreeBSP(boxMesh);
		
		box2 = new THREE.BoxGeometry(15, 5, 72);
		boxMesh2 = new THREE.Mesh(box2);
		boxMesh2.position.y = 10;
		boxBSP2 = new ThreeBSP(boxMesh2);
		
		box3 = new THREE.BoxGeometry(72, 5, 15);
		boxMesh3 = new THREE.Mesh(box3);
		boxMesh3.position.y = 10;
		boxBSP3 = new ThreeBSP(boxMesh3);
		
		cutCylinder = new THREE.CylinderGeometry(35, 35, 5, 128);
		cutCylinderMesh = new THREE.Mesh(cutCylinder);
		cutCylinderMesh.position.y = 10;
		cutCylinderBSP = new ThreeBSP(cutCylinderMesh);
		
		bottomCylinderBSP = new ThreeBSP(bottomCylinder);
		
		resultBSP = boxBSP.subtract(boxBSP2);
		resultBSP = resultBSP.subtract(boxBSP3);
		resultBSP = resultBSP.subtract(cutCylinderBSP);
		resultBSP = bottomCylinderBSP.subtract(resultBSP);
		
		bottomCylinder = resultBSP.toMesh(material);
		bottomCylinder.geometry.computeFaceNormals();
		
		cylinderGroup.add(bottomCylinder);
		
		cylinderGroup.add(screw1);
		cylinderGroup.add(screw2);
		cylinderGroup.add(screw3);
		cylinderGroup.add(screw4);

		group.add(cylinderGroup);
	}

	function createButton() {
		var baseGeometry = new THREE.CylinderGeometry(29, 29, 4, 64),
			textMaterial = new THREE.MeshLambertMaterial({
				color: 0xffffff,
				emissive: 0xffffff,
				overdraw: 0.5
			}),
			textGeometry = new THREE.TextGeometry('START', {
				size: 12.1,
				height: 0.8,
				font: 'helvetiker',
				weight: 'normal',
				style: 'normal'
			}),
			topGeometry = new THREE.SphereGeometry(45, 64, 64, 0, Math.PI * 2, 0, 0.7),
			textMesh,
			baseCylinder,
			centerOffsetX,
			centerOffsetY,
			direction,
			axis,
			angle,
			modifier = new THREE.BendModifier();
		
			//button color
		buttonMaterial = new THREE.MeshPhongMaterial({
			color: new THREE.Color('#982625'),
			emissive: new THREE.Color('#9d0302'),
			specular: new THREE.Color('#333333'),
			shininess: 30
		});

		buttonMaterialInner = new THREE.MeshPhongMaterial({
			color: new THREE.Color('#982625'),
			emissive: new THREE.Color('#9d0302'),
			specular: new THREE.Color('#333333')
		});
		
		buttonGroup = new THREE.Group();
		buttonGroup.name = 'button';

		baseCylinder = new THREE.Mesh(baseGeometry, buttonMaterial);
		baseCylinder.position.y = 22;

		topSphere = new THREE.Mesh(topGeometry, buttonMaterial);
		topSphere.position.y = -10.5;
		topSphere.doubleSided = true;

		//buttonGroup.add(baseCylinder);
		buttonGroup.add(topSphere);

		direction = new THREE.Vector3(0, 0, -1);
		axis = new THREE.Vector3(0, 1, 0);
		angle = Math.PI / 5.75;
		modifier.set(direction, axis, angle).modify(textGeometry);

		textMesh = new THREE.Mesh(textGeometry, textMaterial);
		textMesh.rotation.x = -90 * Math.PI / 180;
		textMesh.position.y = 34;

		textGeometry.computeBoundingBox();

		centerOffsetX = -0.5 * (textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x);
		centerOffsetY = 0.5 * (textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y);

		textMesh.position.x = centerOffsetX;
		textMesh.position.z = centerOffsetY;

		buttonGroup.add(textMesh);

		group.add(buttonGroup);
	}

	function createTexts() {
		var bottomTextGeometry = new THREE.TextGeometry('2022 Graphics', {
				size: 3,
				height: 1,
				font: 'helvetiker',
				weight: 'normal',
				style: 'normal'
			}),
			bottomTextGeometry2 = new THREE.TextGeometry('Nothing is Impossible', {
				size: 2,
				height: 1,
				font: 'helvetiker',
				weight: 'normal',
				style: 'normal'
			}),
			bottomTextGeometry3 = new THREE.TextGeometry('JaewonKim, MinjunKim', {
				size: 2,
				height: 1,
				font: 'helvetiker',
				weight: 'normal',
				style: 'normal'
			}),
			bottomTextGeometry4 = new THREE.TextGeometry('DongseopLee, WonjaeLee', {
				size: 2,
				height: 1,
				font: 'helvetiker',
				weight: 'normal',
				style: 'normal'
			}),
			planeGeometry = new THREE.PlaneBufferGeometry(32, 14, 1, 1),
			material = new THREE.MeshLambertMaterial({
				color: 0x39ECEC,
				overdraw: 0.5
			}),
			textureImg = new Image(),
			texture,
			planeMaterial,
			planeMesh,
			bottomTextMesh,
			bottomTextMesh2,
			bottomTextMesh3,
			bottomTextMesh4;

		textureImg.crossOrigin = "Anonymous";
		texture = new THREE.Texture();
		texture.image = textureImg;

		textureImg.onload = function () {
			texture.needsUpdate = true;
		};

		textureImg.src = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/8223/environmental-signs.png';

		planeMaterial = new THREE.MeshLambertMaterial({
			map: texture,
			transparent: true,
			overdraw: true
		});

		bottomTextMesh = new THREE.Mesh(bottomTextGeometry, material);
		bottomTextMesh.rotation.x = 90 * Math.PI / 180;
		bottomTextMesh.rotation.z = -180 * Math.PI / 180;

		bottomTextMesh.position.x = 10;
		bottomTextMesh.position.y = -15.2;
		bottomTextMesh.position.z = -28;

		bottomTextMesh2 = new THREE.Mesh(bottomTextGeometry2, material);
		bottomTextMesh2.rotation.x = 90 * Math.PI / 180;
		bottomTextMesh2.rotation.z = -180 * Math.PI / 180;

		bottomTextMesh2.position.x = 10;
		bottomTextMesh2.position.y = -15.2;
		bottomTextMesh2.position.z = -25;

		bottomTextMesh3 = new THREE.Mesh(bottomTextGeometry3, material);
		bottomTextMesh3.rotation.x = 90 * Math.PI / 180;
		bottomTextMesh3.rotation.z = -180 * Math.PI / 180;

		bottomTextMesh3.position.x = 10;
		bottomTextMesh3.position.y = -15.2;
		bottomTextMesh3.position.z = -20;

		bottomTextMesh4 = new THREE.Mesh(bottomTextGeometry4, material);
		bottomTextMesh4.rotation.x = 90 * Math.PI / 180;
		bottomTextMesh4.rotation.z = -180 * Math.PI / 180;

		bottomTextMesh4.position.x = 10;
		bottomTextMesh4.position.y = -15.2;
		bottomTextMesh4.position.z = -17;

		planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
		planeMesh.rotation.x = 90 * Math.PI / 180;
		planeMesh.rotation.z = -180 * Math.PI / 180;

		planeMesh.position.x = 0;
		planeMesh.position.y = -16.2;
		planeMesh.position.z = -10;

		group.add(bottomTextMesh);
		group.add(bottomTextMesh2);
		group.add(bottomTextMesh3);
		group.add(bottomTextMesh4);
		group.add(planeMesh);

	}

	function animate() {
		window.requestAnimationFrame(animate);

		render();
	}

	function render() {
		group.rotation.x += (targetRotationY - group.rotation.x) * 0.05;
		group.rotation.y += (targetRotationX - group.rotation.y) * 0.05;

		if (raycasterCheck) {
			raycaster.setFromCamera(mouseVectors, camera);

			intersects = raycaster.intersectObjects(scene.children, true);
			if (intersects.length > 0) {
				checkHit(intersects);
			}
			raycasterCheck = false;
		}

		renderer.render(scene, camera);
	}

	function checkHit(intersects) {
		var i = 0,
			l = intersects.length;

		if (l > 0) {

			if (intersects[0].object.parent && intersects[i].object.parent.name === 'button') {
				moveButton();
				blinkLimit = 10;
				blinkButton();
				if(!alertPlaying){
				loadAlertSound();
				alertPlaying = true;
				
				setTimeout(function() {
					window.location.href = "../index.html";
				}, delayInMilliseconds);
				
				}
			}

		}

	}

	function moveButton() {
		TweenMax.killAll();
		TweenMax.to(buttonGroup.position, 0.25, {
			ease: Expo.easeInOut,
			y: -3,
			yoyo: true,
			repeat: 1
		});
	}

	function blinkButton() {
		clearTimeout(blinkTid);
		if (blinkLimit > 0) {
			blinkTid = window.setTimeout(function () {

				if (blinkLimit % 2 === 0) {
					buttonMaterial.emissive = new THREE.Color('#9d0302');
					buttonMaterial.shininess = 30;
				} else {
					buttonMaterial.emissive = new THREE.Color('#ff3600');
					buttonMaterial.shininess = 40;
				}

				blinkButton();
			}, blinkDelay);
			blinkLimit--;
		}

	}

	function loadAlertSound() {
			var audio = new Audio('../src/assets/start_sound.mp3');
			audio.play();
		
	}

	function onWindowResize() {
		windowHalfX = window.innerWidth / 2;
		windowHalfY = window.innerHeight / 2;
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	function onDocumentMouseDown(event) {
		event.preventDefault();
		document.addEventListener('mousemove', onDocumentMouseMove, false);
		document.addEventListener('mouseup', onDocumentMouseUp, false);
		document.addEventListener('mouseout', onDocumentMouseOut, false);
		mouseXOnMouseDown = event.clientX - windowHalfX;
		mouseYOnMouseDown = event.clientY - windowHalfY;
		targetRotationXOnMouseDown = targetRotationX;
		targetRotationYOnMouseDown = targetRotationY;
		mouseVectors.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouseVectors.y = -(event.clientY / window.innerHeight) * 2 + 1;
		raycasterCheck = true;
	}

	function onDocumentMouseMove(event) {
		mouseX = event.clientX - windowHalfX;
		mouseY = event.clientY - windowHalfY;
		targetRotationX = targetRotationXOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.02;
		targetRotationY = targetRotationYOnMouseDown + (mouseY - mouseYOnMouseDown) * 0.02;
	}

	function onDocumentMouseUp() {
		document.removeEventListener('mousemove', onDocumentMouseMove, false);
		document.removeEventListener('mouseup', onDocumentMouseUp, false);
		document.removeEventListener('mouseout', onDocumentMouseOut, false);
		raycasterCheck = false;
	}

	function onDocumentMouseOut() {
		document.removeEventListener('mousemove', onDocumentMouseMove, false);
		document.removeEventListener('mouseup', onDocumentMouseUp, false);
		document.removeEventListener('mouseout', onDocumentMouseOut, false);
	}

	function onDocumentTouchStart(event) {

		if (event.touches.length === 1) {
			event.preventDefault();
			mouseXOnMouseDown = event.touches[0].pageX - windowHalfX;
			mouseYOnMouseDown = event.touches[0].pageY - windowHalfY;
			targetRotationXOnMouseDown = targetRotationX;
			targetRotationYOnMouseDown = targetRotationY;
		}
	}

	function onDocumentTouchMove(event) {

		if (event.touches.length === 1) {
			event.preventDefault();
			mouseX = event.touches[0].pageX - windowHalfX;
			mouseY = event.touches[0].pageY - windowHalfY;
			targetRotationX = targetRotationXOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.05;
			targetRotationY = targetRotationYOnMouseDown + (mouseY - mouseYOnMouseDown) * 0.05;
		}
	}

	

	init3d();
	initEventBindings();

	createBaseCylinder();
	createButton();
	createTexts();

	animate();

})();