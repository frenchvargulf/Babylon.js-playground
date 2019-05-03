// The babylon engine
var engine;
// The current scene
var scene;
// The HTML canvas
var canvas;

// The v3 vector
var v3 = BABYLON.Vector3;

// Wait till DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
    onload();
}, false);

// Resize the babylon engine when the window is resized
window.addEventListener("resize", function () {
	if (engine) {
		engine.resize();
	}
},false);

// Create engine and the scene
var onload = function () {
    canvas = document.getElementById("renderCanvas");
	engine = new BABYLON.Engine(canvas, true);

    // Create scene
	createScene();

    // Render scene
	engine.runRenderLoop(function () {
        scene.render();
	});	

};

// Create scene
var createScene = function() {
    scene = new BABYLON.Scene(engine);
    // Enable Oimo Physics
    scene.enablePhysics(new BABYLON.Vector3(0,-10,0), new BABYLON.OimoJSPlugin());

    // Create skybox
    BABYLON.Engine.ShadersRepository = "shaders/";
    var skybox = BABYLON.Mesh.CreateSphere("skyBox", 10, 2500, scene); // {diameter: (diameter of the sphere - 1), diameterX: (diameter on X axis, overwrites diameter option)}
    var shader = new BABYLON.ShaderMaterial("gradient", scene, "gradient", {});
    shader.setFloat("offset", 0);
    shader.setFloat("exponent", 0.6);
    shader.setColor3("topColor", BABYLON.Color3.FromInts(0,119,255));
    shader.setColor3("bottomColor", BABYLON.Color3.FromInts(240,240, 255));
    // Do not allow backface culling
    shader.backFaceCulling = false;
    skybox.material = shader;

    // Create camera
    var camera = new BABYLON.ArcRotateCamera("Camera", 0.86, 1.37, 250, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas);
    camera.maxZ = 5000;
    camera.lowerRadiusLimit = 120;
    camera.upperRadiusLimit = 430;
    camera.lowerBetaLimit =0.75;
    camera.upperBetaLimit =1.58 ;

    // Create Hemispheric Light - sun like
    new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);

    // Create ground material
    var mat = new BABYLON.StandardMaterial("ground", scene);
    var t = new BABYLON.Texture("img/ground3.jpg", scene);
    t.uScale = t.vScale = 10;
    mat.diffuseTexture = t;
    mat.specularColor = BABYLON.Color3.Black();
    // Create ground
    var g = BABYLON.Mesh.CreateBox("ground", 400, scene);
    g.position.y = -20;
    g.scaling.y = 0.01;
    g.material = mat;
    // Set a box impostor for ground
    g.setPhysicsState({ impostor: BABYLON.PhysicsEngine.BoxImpostor, move:false});

    // Get a random number
    var randomNumber = function (min, max) {
        if (min == max) {
            return (min);
        }
        var random = Math.random();
        return ((random * (max - min)) + min);
    };

    // Initial height
    var y = 50;
    // Objects
    var objects = [];
    // max number of objects
    var max = 150;

    // Creates random position above the ground
    var getPosition = function(y) {
        return new v3(randomNumber(-200,200), y, randomNumber(-200, 200));
    };

    // Creates
    for (var index = 0; index < max; index++) {

        // SPHERES
        var s = BABYLON.Mesh.CreateSphere("s", 30, randomNumber(20, 30), scene);
        s.position = getPosition(y);
        s.setPhysicsState({impostor:BABYLON.PhysicsEngine.SphereImpostor, move:true, mass:1, friction:0.5, restitution:0.5});
        var shaderSphere = new BABYLON.ShaderMaterial("gradient", scene, "gradient", {});
        shaderSphere.setFloat("offset", 10);
        shaderSphere.setFloat("exponent", 1.0);
        shaderSphere.setColor3("topColor", BABYLON.Color3.FromInts(129,121,153));
        shaderSphere.setColor3("bottomColor", BABYLON.Color3.FromInts(161,152, 191));
        s.material = shaderSphere;

        // BOXES
        var d = BABYLON.Mesh.CreateBox("s", randomNumber(10, 20), scene);
        d.setPhysicsState({impostor:BABYLON.PhysicsEngine.BoxImpostor, move:true, mass:1, friction:0.5, restitution:0.1});
        var boxMaterial = new BABYLON.StandardMaterial("boxmat", scene);
        boxMaterial.diffuseColor = BABYLON.Color3.FromInts(75, 71, 89);
        boxMaterial.specularColor = BABYLON.Color3.Black();
        d.material = shaderSphere;
        s.material = boxMaterial;
        d.position = getPosition(y);

        d.rotation.x = randomNumber(-Math.PI/2, Math.PI/2);
        d.rotation.y = randomNumber(-Math.PI/2, Math.PI/2);
        d.rotation.z = randomNumber(-Math.PI/2, Math.PI/2);
        d.updateBodyPosition();

        // Save boxes to objects
        objects.push(s, d);

        // Increase height
        y+=10;
    }

    scene.registerBeforeRender(function() {
        objects.forEach(function(obj) {
            // If object falls
            if (obj.position.y < -100) {
                obj.position = getPosition(200);
                obj.updateBodyPosition();
            }
        });
    })

};