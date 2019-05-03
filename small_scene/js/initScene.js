// Global variables
var canvas, engine, scene, camera = 0;

//Load the scene when canvas is loaded
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

//Create a new BABYLON Engine and initializes the scene

function initScene() {
    // Get canvas
    canvas = document.getElementById("renderCanvas");

    // Create babylon engine
    engine = new BABYLON.Engine(canvas, true);

    // Create scene
    scene = new BABYLON.Scene(engine);

    // Create the camera
    var camera = new BABYLON.ArcRotateCamera("Camera", 0.4, 1.2, 20, new BABYLON.Vector3(-10, 0, 0), scene);
    camera.attachControl(canvas, true);

    // Create light
    var light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(10, 50, 50), scene);
    
    // Create material
    var material1 = new BABYLON.StandardMaterial("mat1", scene);
    material1.diffuseTexture = new BABYLON.Texture("images/tshphere.jpg", scene);

    // Create sphere
    var sphere = BABYLON.Mesh.CreateSphere("red", 32, 2, scene);
    sphere.setPivotMatrix(BABYLON.Matrix.Translation(2, 0, 0));
    sphere.material = material1;

    // Create Fog
    scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
    scene.fogColor = new BABYLON.Color3(0.9, 0.9, 0.85);
    scene.fogDensity = 0.01;

    // Create skybox
    var skybox = BABYLON.Mesh.CreateBox("skybox", 100.0, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skybox", scene);
    skyboxMaterial.backFaceCulling = false;

    skybox.material = skyboxMaterial;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/cubetexture/skybox", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.disableLighting = true;

    // Create spriteManager
    var spriteManagerPlayer = new BABYLON.SpriteManager("planeManager", "images/plane.png", 8, 1000, scene);

    var plane = new BABYLON.Sprite("plane", spriteManagerPlayer);
    plane.position.x = -2;
    plane.position.y = 2;	
    plane.position.z = 0;	
    plane.isPickable = true;

    var alpha = 0;
    var x = 2;
    var y = 0;
    
    scene.registerBeforeRender(function () {
        
        scene.fogDensity = Math.cos(alpha) / 10;
        alpha += 0.02;
        sphere.rotation.y += 0.01;
        y += 0.05; 
    
        if (x > 50) {
            x = -2;
        }
    
        plane.position.x = -x;
        x += 0.05; 

    });

    
 
};
         

// Onload function
function onload() {
    initScene();

    //-----------------------------------
    engine.runRenderLoop(function () {
        scene.render();
    });

}
