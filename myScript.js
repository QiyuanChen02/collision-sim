//Setting up canvas
var canvasEl = document.querySelector("canvas");
var c = canvasEl.getContext("2d");

canvasEl.width = window.innerWidth;
canvasEl.height = window.innerHeight;

//Colours
colourPalette = [
    "hsl(29, 86%, 77%)",
    "hsl(7, 86%, 77%)",
    "hsl(311, 86%, 77%)",
    "hsl(266, 86%, 77%)",
    "hsl(226, 86%, 77%)"
]

//Particle info
velocityEl = parseFloat(document.getElementById("velocity").value);
minRadiusEl = parseFloat(document.getElementById("minRadius").value);
maxRadiusEl = parseFloat(document.getElementById("maxRadius").value);
noParticlesEl = parseFloat(document.getElementById("noParticles").value);

//Resets canvas when resized
window.addEventListener("resize", function(){
    canvasEl.width = window.innerWidth;
    canvasEl.height = window.innerHeight;
    init();
});

//Opens and closes tabs when clicked
var settingsEl = document.getElementById("settings");
settingsEl.addEventListener("click", function(){
    var settingsTabEl = document.getElementById("settingsTab");
    var openSettingsEl = document.getElementById("openSettings");
    settingsTabEl.style.display = "none";
    openSettingsEl.style.display = "block";
});

var openSettingsEl = document.getElementById("openSettings");
openSettingsEl.addEventListener("click", function(){
    var settingsTabEl = document.getElementById("settingsTab");
    var openSettingsEl = document.getElementById("openSettings");
    settingsTabEl.style.display = "block";
    openSettingsEl.style.display = "none";
});

var aboutEl = document.getElementById("about");
aboutEl.addEventListener("click", function(){
    var openAboutEl = document.getElementById("openAbout");
    var aboutTabEl = document.getElementById("aboutTab");
    openAboutEl.style.display = "block";
    aboutTabEl.style.display = "none";
});

var openAboutEl = document.getElementById("openAbout");
openAboutEl.addEventListener("click", function(){
    var aboutTabEl = document.getElementById("aboutTab");
    var openAboutEl = document.getElementById("openAbout");
    aboutTabEl.style.display = "block";
    openAboutEl.style.display = "none";
});

//Applies the current settings
var simulateEl = document.getElementById("simulate");
simulateEl.addEventListener("click", function(){
    velocityEl = parseFloat(document.getElementById("velocity").value);
    minRadiusEl = parseFloat(document.getElementById("minRadius").value);
    maxRadiusEl = parseFloat(document.getElementById("maxRadius").value);
    noParticlesEl = parseFloat(document.getElementById("noParticles").value);
    init();
});

//Utility functions
function getDistance(x1, y1, x2, y2){
    return Math.sqrt(((x1 - x2)**2) + ((y1 - y2)**2));
}

function randomInteger(min, max){
    var integer = Math.floor(Math.random() * (max - min + 1) ) + min;
    return integer;
}

//Utility functions to calculate the collisions, I don't really understand them but I guess I'll just steal the code. :D

function rotate(velocity, angle) {
    const rotatedVelocities = {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    };

    return rotatedVelocities;
}

function resolveCollision(particle, otherParticle) {
    const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
    const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

    const xDist = otherParticle.x - particle.x;
    const yDist = otherParticle.y - particle.y;

    // Prevent accidental overlap of particles
    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {

        // Grab angle between the two colliding particles
        const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);

        // Store mass in var for better readability in collision equation
        const m1 = particle.mass;
        const m2 = otherParticle.mass;

        // Velocity before equation
        const u1 = rotate(particle.velocity, angle);
        const u2 = rotate(otherParticle.velocity, angle);

        // Velocity after 1d collision equation
        const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
        const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m1 / (m1 + m2), y: u2.y };

        // Final velocity after rotating axis back to original location
        const vFinal1 = rotate(v1, -angle);
        const vFinal2 = rotate(v2, -angle);

        // Swap particle velocities for realistic bounce effect
        particle.velocity.x = vFinal1.x;
        particle.velocity.y = vFinal1.y;

        otherParticle.velocity.x = vFinal2.x;
        otherParticle.velocity.y = vFinal2.y;
    }
}

//Defines particle objects
function Particles(radius, x, y, velocity, colour){
    this.radius = radius;
    this.x = x;
    this.y = y;
    this.velocity = velocity;
    this.colour = colour;
    this.mass = this.radius**2;

    //Draws particles
    this.draw = function (){
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        c.fillStyle = this.colour;
        c.fill();
        c.closePath();
    }

    //Updates position of particles
    this.update = function (particles){
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        //Bounces particles off walls
        if (this.x - this.radius < 0 || this.x + this.radius > canvasEl.width){
            this.velocity.x = -1 * this.velocity.x;
            if (this.x - this.radius < 0){
                this.x = this.radius + 0.1;
            } else {
                this.x = canvasEl.width - this.radius - 0.1;
            }
        }

        if (this.y - this.radius < 0 || this.y + this.radius > canvasEl.height){
            this.velocity.y = -1 * this.velocity.y;
            if (this.y - this.radius < 0){
                this.y = this.radius + 0.1;
            } else {
                this.y = canvasEl.height - this.radius - 0.1;
            }
        } 

        //Bounces particles off each other
        for (var i = 0; i < particles.length; i++){
            if (particles[i] != this){
                if (getDistance(this.x, this.y, particles[i].x, particles[i].y) < this.radius + particles[i].radius + 0.3){
                    resolveCollision(this, particles[i]);
                }
            }
        }
    }
}

//Initially defines the initial conditions
function init(){
    particles = [];
    var numberParticles = noParticlesEl;

    //Sets the position of the particles, making sure they're not generated on top of each other
    for (var i = 0; i < numberParticles; i++){
        var radius = randomInteger(minRadiusEl, maxRadiusEl);
        var x = randomInteger(radius, canvasEl.width - radius);
        var y = randomInteger(radius, canvasEl.height - radius);
        for (var j = 0; j < particles.length; j++){
            if (getDistance(x, y, particles[j].x, particles[j].y) < (radius + particles[j].radius)){
                var radius = randomInteger(minRadiusEl, maxRadiusEl);
                var x = randomInteger(radius, canvasEl.width - radius);
                var y = randomInteger(radius, canvasEl.height - radius);
                j = -1;
            }
        }

        var colour = colourPalette[Math.floor(Math.random() * colourPalette.length)];

        if (i < numberParticles - 1){
            var velocity = {
                x: 0,
                y: 0
            };
        } else {
            var velocity = {
                x: velocityEl,
                y: velocityEl
            };
        }
        //var dx = (Math.random() - 0.5) * 10;
        //var dx = 0;
        //var dy = (Math.random() - 0.5) * 10;
        //var dy = 0;

        particles.push(new Particles(radius, x, y, velocity, colour)); 
    }
}

//Animates the particles
function animate(){
    requestAnimationFrame(animate);
    c.fillStyle = "rgba(10,10,40, 0.36)";
    c.fillRect(0, 0, canvasEl.width, canvasEl.height);
    for (var i = 0; i < particles.length; i++){
        particles[i].update(particles);
    }
}

//Starts the whole program
init();
animate();