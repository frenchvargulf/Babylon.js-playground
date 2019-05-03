// Generate trees

TreeGenerator = function TreeGenerator (scene, sd) {
    // The number of trees to generate
    this.treeNumber = 50;

    // The list containing all trees
    this._trees = [];

    this.scene = scene;

    // trunk - pień
    // foliage - liście 

    // The size (min/max) of the foliage
    this.minSizeBranch = 15;
    this.maxSizeBranch = 20;


    // The size (min/max) of the trunk
    this.minSizeTrunk = 10;
    this.maxSizeTrunk = 15;
    // The radius (min/max) of the trunk
    this.minRadius = 1;
    this.maxRadius = 5;


    // The shadow generator, to add each created tree in the render list
    this.sd = sd;

    this.generate();
};

TreeGenerator.prototype.generate = function() {

    // Clean trees
    // this.clean(); 

    // Generate randomNumber
    var randomNumber = function (min, max) {
        if (min == max) {
            return (min);
        }
        var random = Math.random();
        return ((random * (max - min)) + min);
    };

    var size,
        sizeTrunk, x, z, radius;

    // Random parameters
    for (var i = 0; i<this.treeNumber; i++) {
        size = randomNumber(this.minSizeBranch,this.maxSizeBranch);
        sizeTrunk = randomNumber(this.minSizeTrunk,this.maxSizeTrunk);
        radius = randomNumber(this.minRadius,this.maxRadius);
        x = randomNumber(-300, 300);
        z = randomNumber(-300, 300);

        // Create tree
        var tree = new Tree(size, sizeTrunk, radius, scene, this.sd);
        tree.position.x = x;
        tree.position.z = z;
        this._trees.push(tree);
    }
};

// Remove trees
TreeGenerator.prototype.clean = function() {
    this._trees.forEach(function(t) {
        t.dispose();
    });

    this._trees = [];
};