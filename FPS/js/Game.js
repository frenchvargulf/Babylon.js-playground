// The function onload is loaded when the DOM has been loaded
document.addEventListener("DOMContentLoaded", function () {
    new Game('renderCanvas');
}, false);


Game = function(canvasId) {

    var canvas = document.getElementById(canvasId);
    var engine = new BABYLON.Engine(canvas, true);

    this.scene = this._initScene(engine);

    var _this = this;
    this.loader =  new BABYLON.AssetsManager(this.scene);

    // An array containing the loaded assets
    this.assets = {};

    var meshTask = this.loader.addMeshTask("gun", "", "./assets/", "gun.babylon");
    meshTask.onSuccess = function(task) {
        _this._initMesh(task);
    };

    this.loader.onFinish = function (tasks) {

        // Player and arena creation when the loading is finished
        var player = new Player(_this);
        var arena = new Arena(_this);

        engine.runRenderLoop(function () {
            _this.scene.render();
        });

        window.addEventListener("keyup", function(evt) {
            _this.handleUserInput(evt.keyCode);
        });
    };

    this.loader.load();

    // Resize the babylon engine when the window is resized
    window.addEventListener("resize", function () {
        if (engine) {
            engine.resize();
        }
    },false);

};


Game.prototype = {
    /**
     * Init the environment of the game / skybox, camera, ...
     */
    _initScene : function(engine) {

        var scene = new BABYLON.Scene(engine);

        // Camera attached to the canvas
//        var camera = new BABYLON.ArcRotateCamera("Camera", 0, Math.PI/5, 10, BABYLON.Vector3.Zero(), scene);
//        camera.maxZ = 1000;
//        camera.attachControl(engine.getRenderingCanvas());
//
        axis(scene, 5);


        // Update the scene background color
        scene.clearColor=new BABYLON.Color3(0.8,0.8,0.8);

        // Hemispheric light to light the scene
        new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(1, 2, 1), scene);

        // Skydome
        var skybox = BABYLON.Mesh.CreateSphere("skyBox", 50, 1000, scene);
        skybox.layerMask = 2;

        // The sky creation
        BABYLON.Engine.ShadersRepository = "shaders/";

        var shader = new BABYLON.ShaderMaterial("gradient", scene, "gradient", {});
        shader.setFloat("offset", 200);
        shader.setColor3("topColor", BABYLON.Color3.FromInts(0,119,255));
        shader.setColor3("bottomColor", BABYLON.Color3.FromInts(240,240, 255));
        shader.backFaceCulling = false;
        skybox.material = shader;

        // Create skybox
        var skybox = BABYLON.Mesh.CreateBox("hot", 100.0, scene);
        var skyboxMaterial = new BABYLON.StandardMaterial("hot", scene);
        skyboxMaterial.backFaceCulling = false;

        skybox.material = skyboxMaterial;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/cubetexture/hot", scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.disableLighting = true;

        return scene;
    },


    /**
     * Handle user keyboard inputs
     * @param keycode
     */
    handleUserInput : function(keycode) {
        switch (keycode) {
            // user inputs
        }
    },

    /**
     * Initialize a mesh once it has been loaded. Store it in the asset array and set it not visible.
     * @param task
     * @private
     */
    _initMesh : function(task) {
        this.assets[task.name] = task.loadedMeshes;
        for (var i=0; i<task.loadedMeshes.length; i++ ){
            var mesh = task.loadedMeshes[i];
            mesh.isVisible = false;
        }
    }
};


/**
 * Draw axis on the scene
 * @param scene The scene where the axis will be displayed
 * @param size The size of each axis.
 */
var axis = function(scene, size) {
        //X axis
        var x = BABYLON.Mesh.CreateCylinder("x", size, 0.1, 0.1, 6, scene, false);
        x.material = new BABYLON.StandardMaterial("xColor", scene);
        x.material.diffuseColor = new BABYLON.Color3(1, 0, 0);
        x.position = new BABYLON.Vector3(size/2, 0, 0);
        x.rotation.z = Math.PI / 2;

        //Y axis
        var y = BABYLON.Mesh.CreateCylinder("y", size, 0.1, 0.1, 6, scene, false);
        y.material = new BABYLON.StandardMaterial("yColor", scene);
        y.material.diffuseColor = new BABYLON.Color3(0, 1, 0);
        y.position = new BABYLON.Vector3(0, size / 2, 0);

        //Z axis
        var z = BABYLON.Mesh.CreateCylinder("z", size, 0.1, 0.1, 6, scene, false);
        z.material = new BABYLON.StandardMaterial("zColor", scene);
        z.material.diffuseColor = new BABYLON.Color3(0, 0, 1);
        z.position = new BABYLON.Vector3(0, 0, size/2);
        z.rotation.x = Math.PI / 2;
};