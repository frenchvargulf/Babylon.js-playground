// The babylon engine
var engine;
// The current scene
var scene;
// The HTML canvas
var canvas;
// The camera, the ship and the ground will move
var camera, ship, ground;

//Fire event when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
	if (BABYLON.Engine.isSupported()) {
        onload();
	}
}, false);

// Resize the babylon engine when the window is resized
window.addEventListener("resize", function () {
	if (engine) {
		engine.resize();
	}
}, false);

// Onload function : creates engine and the scene
function onload () {
    // Engine creation
    canvas = document.getElementById("renderCanvas");
    engine = new BABYLON.Engine(canvas, true);

    // Scene creation
    initScene();
    
    // Engine run
    engine.runRenderLoop(function () {
        if (! ship.killed) {
            ship.move();
    
            camera.position.z += ship.speed;
            ship.position.z += ship.speed;
            ground.position.z += ship.speed;
        }
    
    scene.render();
    });

};

//Initialize the Babylon engine, scene, light
var initScene = function initScene() {

    // Create scene
    scene = new BABYLON.Scene(engine);

    // Create camera
    camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 5, -30), scene);
    camera.setTarget(new BABYLON.Vector3(0,0,20));
    camera.maxZ = 1000;
    camera.speed = 4;

    // Hemispheric light to enlight the scene
    var h = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 0.5, 0), scene);
    h.intensity = 0.6;

    // A directional light to add some colors
    var d = new BABYLON.DirectionalLight("dir", new BABYLON.Vector3(0,-0.5,0.5), scene);
    d.position = new BABYLON.Vector3(0.1,100,-100);
    d.intensity = 0.4;
    // Purple haze
    d.diffuse = BABYLON.Color3.FromInts(204,196,255);

    // ground
    ground = BABYLON.Mesh.CreateGround("ground", 800, 2000, 2, scene);

    // Create ship
    ship = new Ship(1, scene);

    // Create fog
    scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
    scene.fogDensity = 0.01;

    setInterval(box, 100);
    setInterval(bonus, 1000);

};

//  Create boxes 
var box = function() {
    var minZ = camera.position.z+500;
    var maxZ = camera.position.z+1500;
    var minX = camera.position.x - 100, maxX = camera.position.x+100;
    var minSize = 2, maxSize = 10;

    var randomX, randomZ, randomSize;

    randomX = randomNumber(minX, maxX);
    randomZ = randomNumber(minZ, maxZ);
    randomSize = randomNumber(minSize, maxSize);

    var b = BABYLON.Mesh.CreateBox("bb", randomSize, scene);

    b.scaling.x = randomNumber(0.5, 1.5);
    b.scaling.y = randomNumber(4, 8);
    b.scaling.z = randomNumber(2, 3);

    b.position.x = randomX;
    b.position.y = b.scaling.y/2 ;
    b.position.z = randomZ;

      
    // We must create a new ActionManager for our building in order to use Actions.
    b.actionManager = new BABYLON.ActionManager(scene);

    // The trigger is OnIntersectionEnterTrigger
    var trigger = {trigger:BABYLON.ActionManager.OnIntersectionEnterTrigger, parameter: ship};

    var sba = new BABYLON.SwitchBooleanAction(trigger, ship, "killed");
    b.actionManager.registerAction(sba);

    // on collision with ship
    var trigger = {trigger:BABYLON.ActionManager.OnIntersectionEnterTrigger, parameter: ship};
    var exec = new BABYLON.SwitchBooleanAction(trigger, ship, "killed");
    b.actionManager.registerAction(exec);
    

    // condition : ammo > 0
    var condition = new BABYLON.ValueCondition(b.actionManager, ship, "ammo", 0, BABYLON.ValueCondition.IsGreater);

    var onpickAction = new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPickTrigger,
        function(evt) {
            if (evt.meshUnderPointer) {
                // Find the clicked mesh
                var meshClicked = evt.meshUnderPointer;
                // Detroy it !
                meshClicked.dispose();
                // Reduce the number of ammo by one
                ship.ammo -= 1;
                // Update the ammo label
                ship.sendEvent();
            }
        },
        condition);

    b.actionManager.registerAction(onpickAction);

    
};

// Create bonus
var bonus = function bonus() {
    var bonus = BABYLON.Mesh.CreateSphere("sphere", 20, 5, scene);
    bonus.material = new BABYLON.StandardMaterial("bonusMat", scene);
    bonus.material.diffuseColor = BABYLON.Color3.Red();

    var minZ = camera.position.z+500,maxZ = camera.position.z+1500;
    var minX = camera.position.x - 100, maxX = camera.position.x+100;

    bonus.position.x = randomNumber(minX, maxX);
    bonus.position.y = 2.5;
    bonus.position.z = randomNumber(minZ, maxZ);

    bonus.actionManager = new BABYLON.ActionManager(scene);

    // on collision
    var addAmmo = new BABYLON.IncrementValueAction(BABYLON.ActionManager.NothingTrigger, ship, "ammo", 1);
    var destroyBonus = new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.NothingTrigger, function(evt) {
        ship.sendEvent();
        evt.source.dispose();
    });

    var trigger = {trigger:BABYLON.ActionManager.OnIntersectionEnterTrigger, parameter: ship};
    var combine = new BABYLON.CombineAction(trigger, [addAmmo, destroyBonus]);
    bonus.actionManager.registerAction(combine);

};

// Generate randomNumber
var randomNumber = function randomNumber(min, max) {
    if (min == max) {
        return (min);
    }
    var random = Math.random();
    return ((random * (max - min)) + min);
};