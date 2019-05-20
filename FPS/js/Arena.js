// /**
//  * The arena is the world where the player will evolve
//  * @param scene
//  * @constructor
//  */

Arena = function(game) {
    this.game = game;

    // The arena size
    this.size = 100;

//     // The ground
    // var ground = BABYLON.Mesh.CreateGround("ground",  this.size,  this.size, 2, this.game.scene);
    // var ground = BABYLON.Mesh.CreateBox("ground",  this.size, scene);
    // ground.position.y = -500;
    // ground.visible = false;
    // this._deactivateSpecular(ground);
    // ground.checkCollisions = true;

    var _this = this;
    setInterval(function() {
        var posX = _this._randomNumber(-_this.size/2, _this.size/2);
        var posZ = _this._randomNumber(-_this.size/2, _this.size/2);
        var t = new Target(_this.game, posX, posZ);
    }, 1000);

    // Minimap
    var mm = new BABYLON.FreeCamera("minimap", new BABYLON.Vector3(0,-990,0), this.game.scene);
    mm.layerMask = 1;
    mm.setTarget(new BABYLON.Vector3(0.1,0.1,0.1));
    mm.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;

    mm.orthoLeft = -this.size/2;
    mm.orthoRight = this.size/2;
    mm.orthoTop =  this.size/2;
    mm.orthoBottom = -this.size/2;

    mm.rotation.x = Math.PI/2;

    var xstart = 0.8,
        ystart = 0.75;
    var width = 0.99-xstart,
        height = 1-ystart;

    mm.viewport = new BABYLON.Viewport(
        xstart,
        ystart,
        width,
        height
    );
    this.game.scene.activeCameras.push(mm);
};


Arena.prototype = {

    /**
     * Generates a random number between min and max
     * @param min
     * @param max
     * @returns {number}
     * @private
     */
    _randomNumber : function (min, max) {
        if (min == max) {
            return (min);
        }
        var random = Math.random();
        return ((random * (max - min)) + min);
    },

    _deactivateSpecular : function(mesh) {
        if (!mesh.material) {
            mesh.material = new BABYLON.StandardMaterial(mesh.name+"mat", this.game.scene);
        }
        mesh.material.specularColor = BABYLON.Color3.Black();
    }

};