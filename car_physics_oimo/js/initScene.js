// Init onload function
document.addEventListener("DOMContentLoaded", function () {
    onload();
}, false);

// Resize the babylon engine when the window is resized
window.addEventListener("resize", function () {
	if (engine) {
		engine.resize();
	}
}, false);

// Creates engine and the scene
var onload = function () {
	// Get canvas and create engine
    canvas = document.getElementById("renderCanvas");
	engine = new BABYLON.Engine(canvas, true);

    // Create scene
	createScene();

    // Render scene
	engine.runRenderLoop(function () {
        scene.render();
	});

};

// Init scene
var createScene = function() {

    var scene = new BABYLON.Scene(engine);

    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(100, 200, -400), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);


    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    //the ground
    var ground = BABYLON.MeshBuilder.CreateGround("ground", {
        width: 4000,
        height: 4000
    }, scene);
    ground.position.y = -70;

    //The car's body:

    //wheel radius
    var rad = 50;
    //height
    var h = 40;
    //width
    var w = 50;
    //depth
    var d = 100;

    var body = BABYLON.MeshBuilder.CreateBox("body", {
        width: (w + 20) * 1.5,
        height: h,
        depth: (d + 40) * 1.5
    }, scene);

    //the wheels:

    var wheel1 = BABYLON.MeshBuilder.CreateSphere("wheel1", {
        diameterY: rad,
        //make the wheel look like... a wheel.
        diameterX: rad / 2,
        diameterZ: rad,
        segments: 5
    }, scene);
    wheel1.position.copyFromFloats(-(w + 30), -20, -d);

    var wheel2 = BABYLON.MeshBuilder.CreateSphere("wheel2", {
        diameterY: rad,
        diameterX: rad / 2,
        diameterZ: rad,
        segments: 5
    }, scene);
    wheel2.position.copyFromFloats((w + 30), -20, -d);

    var wheel3 = BABYLON.MeshBuilder.CreateSphere("wheel3", {
        diameterY: rad,
        diameterX: rad / 2,
        diameterZ: rad,
        segments: 5
    }, scene);
    wheel3.position.copyFromFloats(-(w + 30), -20, d);

    var wheel4 = BABYLON.MeshBuilder.CreateSphere("wheel4", {
        diameterY: rad,
        diameterX: rad / 2,
        diameterZ: rad,
        segments: 5
    }, scene);
    wheel4.position.copyFromFloats((w + 30), -20, d);


};