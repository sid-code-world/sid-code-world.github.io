// script.js

// --- Basic Setup ---
const messageBox = document.getElementById('messageBox');
const distanceCounter = document.getElementById('distanceCounter');
const healthBar = document.getElementById('healthBar');
const hitFlashOverlay = document.getElementById('hitFlashOverlay'); // Get hit flash element
const gameContainer = document.getElementById('gameContainer');
let scene, camera, renderer;
let gameWidth = window.innerWidth * 0.8;
let gameHeight = window.innerHeight * 0.9;

// --- Game Settings ---
const PLAYER_BASE_FORWARD_SPEED = 80;
const PLAYER_STRAFE_SPEED = 35;
const PLAYER_VERTICAL_SPEED = 30;
const PLAYER_ROLL_SPEED = 3.0;
const PLAYER_MAX_HEALTH = 5;
const BOOST_MULTIPLIER = 2.5;
const BOOST_DURATION = 5.0;
const BOOST_COOLDOWN = 10.0;
const CAMERA_DISTANCE = 120;
const CAMERA_HEIGHT = 40;
const CAMERA_LAG = 0.03;
const LASER_SPEED = 900;
const ENEMY_LASER_SPEED = 500;
const TRENCH_SEGMENT_LENGTH = 250;
const TRENCH_WIDTH = 800;
const TRENCH_HEIGHT = 400;
const DEATH_STAR_WALL_HEIGHT = 1500;
const TRENCH_DEPTH_LIMIT = 15000;
const TARGET_Z_POSITION = 10000;
const TARGET_SIZE = 50;
const TARGET_HIT_RANGE = 500;
const TRENCH_COLOR_FLOOR = 0x222222;
const TRENCH_COLOR_WALL = 0x383838;
const TRENCH_COLOR_DS_WALL = 0x1F1F1F;
const STAR_COUNT = 500;
const OBSTACLE_SPAWN_RATE = 1.5;
const OBSTACLE_SPEED_FACTOR = 0.9;
const TIE_FIGHTER_SCALE = 0.5;
const TIE_TURN_SPEED = 0.6;
const TIE_CHASE_FACTOR = 0.3;
const TIE_FIRE_RATE = 2.0;
const CANNON_SCALE = 15;
const CANNON_FIRE_RATE = 5.0;
const CANNON_PROBABILITY = 0.15;
const WALL_COLLISION_PADDING = 5;
const PLAYER_HITBOX_SIZE = 15;
const HIT_FLASH_DURATION = 150; // Milliseconds for the flash effect

// --- Game State ---
let playerShip;
let playerHealth = PLAYER_MAX_HEALTH;
let lastPlayerPosition = new THREE.Vector3();
let playerVelocity = new THREE.Vector3();
let target;
let lasers = [];
let enemyLasers = [];
let trenchSegments = [];
let stars = [];
let obstacles = [];
let wallCannons = [];
let keysPressed = {};
let targetHit = false;
let gameOver = false;
let animationFrameId;
let lastObstacleSpawnTime = 0;
let clock = new THREE.Clock();
let isBoosting = false;
let boostTimer = 0;
let boostCooldownTimer = 0;
let currentForwardSpeed = PLAYER_BASE_FORWARD_SPEED;
let hitFlashTimeoutId = null; // To manage the flash timeout

// --- Materials ---
// (Materials remain the same)
const shipBodyMaterial = new THREE.MeshStandardMaterial({ color: 0xCCCCCC, metalness: 0.5, roughness: 0.6 });
const shipWingMaterial = new THREE.MeshStandardMaterial({ color: 0xAAAAAA, metalness: 0.5, roughness: 0.7 });
const shipEngineMaterial = new THREE.MeshStandardMaterial({ color: 0xFF8800, emissive: 0xAA5500 });
const shipEngineBoostMaterial = new THREE.MeshStandardMaterial({ color: 0x88CCFF, emissive: 0x66AAFF });
const shipCockpitMaterial = new THREE.MeshStandardMaterial({ color: 0x222288, roughness: 0.2, metalness: 0.1 });
const laserMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 }); // Player laser
const enemyLaserMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 }); // Enemy laser (green)
const targetMaterial = new THREE.MeshStandardMaterial({ color: 0x00FF00, emissive: 0x006600 });
const targetCenterMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
const starMaterial = new THREE.MeshBasicMaterial({ color: 0xBBBBBB });
const trenchFloorMaterial = new THREE.MeshStandardMaterial({ color: TRENCH_COLOR_FLOOR, roughness: 0.8 });
const trenchWallMaterial = new THREE.MeshStandardMaterial({ color: TRENCH_COLOR_WALL, roughness: 0.8 });
const deathStarWallMaterial = new THREE.MeshStandardMaterial({ color: TRENCH_COLOR_DS_WALL, roughness: 0.9 });
const tieBodyMaterial = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.6, roughness: 0.5 });
const tieWingMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.2, roughness: 0.8 });
const cannonBodyMaterial = new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.7, roughness: 0.4 });
const cannonBarrelMaterial = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.8, roughness: 0.3 });
const explosionMaterials = [
    new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true }),
    new THREE.MeshBasicMaterial({ color: 0xFFFF00, transparent: true }),
    new THREE.MeshBasicMaterial({ color: 0xFF8800, transparent: true }),
    new THREE.MeshBasicMaterial({ color: 0xFF0000, transparent: true }),
];
let explosionParticles = [];
let explosionActive = false;
let explosionTimer = 0;
const EXPLOSION_DURATION = 0.7;
const EXPLOSION_PARTICLE_COUNT = 80;
const EXPLOSION_SPEED = 200;

// --- Engine References for Boost ---
let engineMeshes = [];

// --- Initialization ---
function init() {
    // Scene, Camera, Renderer, Lighting
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.Fog(0x000000, 700, TRENCH_DEPTH_LIMIT * 0.9);
    const fieldOfView = 75; const aspect = gameWidth / gameHeight; const nearPlane = 0.1; const farPlane = TRENCH_DEPTH_LIMIT * 1.2;
    camera = new THREE.PerspectiveCamera(fieldOfView, aspect, nearPlane, farPlane);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(gameWidth, gameHeight);
    gameContainer.appendChild(renderer.domElement);
    const ambientLight = new THREE.AmbientLight(0x505050, 1.8); scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2); directionalLight.position.set(0, 1, 0.5).normalize(); scene.add(directionalLight);

    // Create Game Objects
    createPlayerShip();
    createTarget();
    createInitialTrenchSegments();
    createStars();

    // Initial camera position
    if (playerShip) {
        lastPlayerPosition.copy(playerShip.position);
        camera.position.copy(playerShip.position).add(new THREE.Vector3(0, CAMERA_HEIGHT, CAMERA_DISTANCE));
        camera.lookAt(playerShip.position);
    }

    // Initial Health Bar Update
    updateHealthBarUI();

    // Event Listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Start game loop
    animate();
}

// --- Object Creation ---
// createPlayerShip, createTarget, createInitialTrenchSegments, addTrenchSegment,
// createCannon, createStars, createTieFighter
// (These functions remain largely the same as the previous version)
function createPlayerShip() {
    playerShip = new THREE.Group();
    engineMeshes = [];

    const bodyWidth = 15, bodyHeight = 10, bodyDepth = 40;
    const wingWidth = 50, wingHeight = 4, wingDepth = 25;
    const engineRadius = 4, engineLength = 15;
    const wingAngle = Math.PI / 9; // Increased angle for more pronounced X (20 degrees)

    // Main Body
    const bodyGeo = new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyDepth);
    const bodyMesh = new THREE.Mesh(bodyGeo, shipBodyMaterial);
    playerShip.add(bodyMesh);

    // Cockpit
    const cockpitGeo = new THREE.BoxGeometry(bodyWidth * 0.6, bodyHeight * 0.5, bodyDepth * 0.3);
    const cockpitMesh = new THREE.Mesh(cockpitGeo, shipCockpitMaterial);
    cockpitMesh.position.set(0, bodyHeight * 0.5, bodyDepth * 0.2);
    playerShip.add(cockpitMesh);

    // Wings
    const wingOffset = bodyWidth * 0.5;
    const wingZOffset = -bodyDepth * 0.1;
    const wingYOffset = wingHeight * 0.5;
    const wingGroup = new THREE.Group();

    // Top Wing Pair
    const topWingPair = new THREE.Group();
    const tlWingGeo = new THREE.BoxGeometry(wingWidth, wingHeight, wingDepth);
    const tlWingMesh = new THREE.Mesh(tlWingGeo, shipWingMaterial);
    tlWingMesh.position.set(-wingOffset - wingWidth/2, wingYOffset, wingZOffset);
    topWingPair.add(tlWingMesh);
    const trWingGeo = new THREE.BoxGeometry(wingWidth, wingHeight, wingDepth);
    const trWingMesh = new THREE.Mesh(trWingGeo, shipWingMaterial);
    trWingMesh.position.set(wingOffset + wingWidth/2, wingYOffset, wingZOffset);
    topWingPair.add(trWingMesh);
    topWingPair.rotation.x = wingAngle; // Apply angle
    wingGroup.add(topWingPair);

    // Bottom Wing Pair
    const bottomWingPair = new THREE.Group();
    const blWingGeo = new THREE.BoxGeometry(wingWidth, wingHeight, wingDepth);
    const blWingMesh = new THREE.Mesh(blWingGeo, shipWingMaterial);
    blWingMesh.position.set(-wingOffset - wingWidth/2, -wingYOffset, wingZOffset);
    bottomWingPair.add(blWingMesh);
    const brWingGeo = new THREE.BoxGeometry(wingWidth, wingHeight, wingDepth);
    const brWingMesh = new THREE.Mesh(brWingGeo, shipWingMaterial);
    brWingMesh.position.set(wingOffset + wingWidth/2, -wingYOffset, wingZOffset);
    bottomWingPair.add(brWingMesh);
    bottomWingPair.rotation.x = -wingAngle; // Apply angle
    wingGroup.add(bottomWingPair);

    playerShip.add(wingGroup);

    // Engines
    const engineGeo = new THREE.CylinderGeometry(engineRadius, engineRadius * 0.8, engineLength, 16);
    const engineZPos = wingZOffset - wingDepth * 0.3;

    // TL Engine
    const tlEngineMesh = new THREE.Mesh(engineGeo, shipEngineMaterial.clone());
    tlEngineMesh.rotation.x = -Math.PI / 2;
    const tlEnginePos = new THREE.Vector3(-wingOffset - wingWidth * 0.4, wingYOffset, engineZPos);
    tlEnginePos.applyAxisAngle(new THREE.Vector3(1, 0, 0), wingAngle);
    tlEngineMesh.position.copy(tlEnginePos);
    playerShip.add(tlEngineMesh);
    engineMeshes.push(tlEngineMesh);

    // TR Engine
    const trEngineMesh = new THREE.Mesh(engineGeo, shipEngineMaterial.clone());
    trEngineMesh.rotation.x = -Math.PI / 2;
    const trEnginePos = new THREE.Vector3(wingOffset + wingWidth * 0.4, wingYOffset, engineZPos);
    trEnginePos.applyAxisAngle(new THREE.Vector3(1, 0, 0), wingAngle);
    trEngineMesh.position.copy(trEnginePos);
    playerShip.add(trEngineMesh);
    engineMeshes.push(trEngineMesh);

    // BL Engine
    const blEngineMesh = new THREE.Mesh(engineGeo, shipEngineMaterial.clone());
    blEngineMesh.rotation.x = -Math.PI / 2;
    const blEnginePos = new THREE.Vector3(-wingOffset - wingWidth * 0.4, -wingYOffset, engineZPos);
    blEnginePos.applyAxisAngle(new THREE.Vector3(1, 0, 0), -wingAngle);
    blEngineMesh.position.copy(blEnginePos);
    playerShip.add(blEngineMesh);
    engineMeshes.push(blEngineMesh);

    // BR Engine
    const brEngineMesh = new THREE.Mesh(engineGeo, shipEngineMaterial.clone());
    brEngineMesh.rotation.x = -Math.PI / 2;
    const brEnginePos = new THREE.Vector3(wingOffset + wingWidth * 0.4, -wingYOffset, engineZPos);
    brEnginePos.applyAxisAngle(new THREE.Vector3(1, 0, 0), -wingAngle);
    brEngineMesh.position.copy(brEnginePos);
    playerShip.add(brEngineMesh);
    engineMeshes.push(brEngineMesh);

    playerShip.position.set(0, 0, 0);
    playerShip.rotation.y = Math.PI;

    scene.add(playerShip);
}

function createTarget() {
    if (typeof TARGET_SIZE === 'undefined') { console.error("TARGET_SIZE undefined"); return; }
    const geometry = new THREE.SphereGeometry(TARGET_SIZE / 2, 16, 16);
    target = new THREE.Mesh(geometry, targetMaterial);
    target.position.set(0, 0, TARGET_Z_POSITION);
    target.visible = true;
    target.userData.hit = false;
    const centerGeo = new THREE.SphereGeometry(TARGET_SIZE / 5, 8, 8);
    const centerMesh = new THREE.Mesh(centerGeo, targetCenterMaterial);
    centerMesh.position.z = 1;
    target.add(centerMesh);
    scene.add(target);
}

function createInitialTrenchSegments() {
    trenchSegments = [];
    wallCannons = []; // Clear cannons on init
    const startZ = -TRENCH_SEGMENT_LENGTH * 2;
    const endZ = TRENCH_DEPTH_LIMIT;
    if (typeof TRENCH_SEGMENT_LENGTH === 'undefined' || TRENCH_SEGMENT_LENGTH <= 0) { console.error("Invalid TRENCH_SEGMENT_LENGTH"); return; }
    for (let z = startZ; z < endZ; z += TRENCH_SEGMENT_LENGTH) {
        addTrenchSegment(z);
    }
}

function addTrenchSegment(zPos) {
    const segmentGroup = new THREE.Group();
    const segmentCenterZ = zPos + TRENCH_SEGMENT_LENGTH / 2;

    // Floor, Walls, Outer Walls (same as before)
    const floorGeo = new THREE.PlaneGeometry(TRENCH_WIDTH, TRENCH_SEGMENT_LENGTH);
    const floorMesh = new THREE.Mesh(floorGeo, trenchFloorMaterial);
    floorMesh.rotation.x = -Math.PI / 2; floorMesh.position.set(0, -TRENCH_HEIGHT / 2, segmentCenterZ); segmentGroup.add(floorMesh);
    const wallGeo = new THREE.PlaneGeometry(TRENCH_SEGMENT_LENGTH, TRENCH_HEIGHT);
    const leftWallMesh = new THREE.Mesh(wallGeo, trenchWallMaterial);
    leftWallMesh.rotation.y = Math.PI / 2; leftWallMesh.position.set(-TRENCH_WIDTH / 2, 0, segmentCenterZ); segmentGroup.add(leftWallMesh);
    const rightWallMesh = new THREE.Mesh(wallGeo, trenchWallMaterial);
    rightWallMesh.rotation.y = -Math.PI / 2; rightWallMesh.position.set(TRENCH_WIDTH / 2, 0, segmentCenterZ); segmentGroup.add(rightWallMesh);
    const dsWallDepth = 10; const dsWallGeo = new THREE.BoxGeometry(dsWallDepth, DEATH_STAR_WALL_HEIGHT, TRENCH_SEGMENT_LENGTH);
    const leftDSWallMesh = new THREE.Mesh(dsWallGeo, deathStarWallMaterial); leftDSWallMesh.position.set(-TRENCH_WIDTH / 2 - dsWallDepth / 2, TRENCH_HEIGHT / 2 + DEATH_STAR_WALL_HEIGHT / 2, segmentCenterZ); segmentGroup.add(leftDSWallMesh);
    const rightDSWallMesh = new THREE.Mesh(dsWallGeo, deathStarWallMaterial); rightDSWallMesh.position.set(TRENCH_WIDTH / 2 + dsWallDepth / 2, TRENCH_HEIGHT / 2 + DEATH_STAR_WALL_HEIGHT / 2, segmentCenterZ); segmentGroup.add(rightDSWallMesh);

    // Random Details/Greebles & Cannons
    const greebleCount = 8;
    for(let i = 0; i < greebleCount; i++) {
        const side = Math.random() < 0.5 ? -1 : 1; // Choose left (-1) or right (1) wall
        const detailHeight = Math.random() * TRENCH_HEIGHT * 0.3 + 15;
        const detailWidth = Math.random() * 50 + 20;
        const detailDepth = Math.random() * TRENCH_SEGMENT_LENGTH * 0.7 + 25;
        const detailGeo = new THREE.BoxGeometry(detailWidth, detailHeight, detailDepth);
        const detailMat = Math.random() < 0.6 ? trenchWallMaterial : trenchFloorMaterial;
        const detailMesh = new THREE.Mesh(detailGeo, detailMat);

        const detailX = side * (TRENCH_WIDTH / 2 - detailWidth / 2 - Math.random() * 15);
        const detailY = -TRENCH_HEIGHT / 2 + detailHeight / 2 + Math.random() * (TRENCH_HEIGHT - detailHeight);
        const detailZ = zPos + Math.random() * TRENCH_SEGMENT_LENGTH;

        detailMesh.position.set(detailX, detailY, detailZ);
        detailMesh.rotation.y = Math.random() * Math.PI * 2;
        segmentGroup.add(detailMesh);

        // Add a cannon sometimes instead of a greeble? Or on top?
        if (Math.random() < CANNON_PROBABILITY) {
            createCannon(side, detailY, detailZ, segmentGroup); // Pass segment group
        }
    }

    scene.add(segmentGroup);
    trenchSegments.push({ mesh: segmentGroup, z: zPos });
}

function createCannon(side, yPos, zPos, parentGroup) {
    const cannon = new THREE.Group();
    const scale = CANNON_SCALE;

    // Base
    const baseGeo = new THREE.CylinderGeometry(scale * 0.8, scale, scale * 0.5, 8);
    const baseMesh = new THREE.Mesh(baseGeo, cannonBodyMaterial);
    baseMesh.rotation.x = Math.PI / 2; // Lay flat against wall

    // Barrel
    const barrelGeo = new THREE.CylinderGeometry(scale * 0.3, scale * 0.2, scale * 2, 8);
    const barrelMesh = new THREE.Mesh(barrelGeo, cannonBarrelMaterial);
    barrelMesh.position.z = -scale; // Barrel extends forward (local Z)

    cannon.add(baseMesh);
    cannon.add(barrelMesh);

    // Position on the wall
    const cannonX = side * (TRENCH_WIDTH / 2 - scale * 0.5); // Place flush against wall
    cannon.position.set(cannonX, yPos, zPos);

    // Rotate to face inwards/slightly forward
    cannon.rotation.y = side * Math.PI / 2; // Face into trench

    // Store firing cooldown timer in userData
    cannon.userData = { type: 'cannon', lastFired: 0, health: 1 }; // Cannons have 1 health

    parentGroup.add(cannon); // Add to the segment group
    wallCannons.push(cannon); // Add to global list for updates/collision
}


function createStars() {
    stars = [];
    const starGeo = new THREE.SphereGeometry(6, 6, 6);
    for (let i = 0; i < STAR_COUNT; i++) {
        const star = new THREE.Mesh(starGeo, starMaterial);
        const distance = TRENCH_DEPTH_LIMIT * 1.5 + Math.random() * TRENCH_DEPTH_LIMIT * 10;
        const angle = Math.random() * Math.PI * 2;
        const heightAngle = (Math.random() - 0.5) * Math.PI;
        star.position.set(
            Math.sin(angle) * Math.cos(heightAngle) * distance,
            Math.sin(heightAngle) * distance,
            Math.cos(angle) * Math.cos(heightAngle) * distance
        );
        scene.add(star);
        stars.push(star);
    }
}

function createTieFighter(zPos) {
    const tie = new THREE.Group();
    const scale = TIE_FIGHTER_SCALE;

    const bodyGeo = new THREE.SphereGeometry(15 * scale, 12, 12);
    const bodyMesh = new THREE.Mesh(bodyGeo, tieBodyMaterial);
    tie.add(bodyMesh);

    const wingThickness = 4 * scale;
    const wingRadius = 40 * scale;
    const wingGeo = new THREE.CylinderGeometry(wingRadius, wingRadius, wingThickness, 6);

    const leftWing = new THREE.Mesh(wingGeo, tieWingMaterial);
    leftWing.rotation.z = Math.PI / 2; leftWing.position.x = -25 * scale; tie.add(leftWing);
    const rightWing = new THREE.Mesh(wingGeo, tieWingMaterial);
    rightWing.rotation.z = Math.PI / 2; rightWing.position.x = 25 * scale; tie.add(rightWing);

    tie.position.z = zPos;
    tie.position.x = (Math.random() - 0.5) * (TRENCH_WIDTH * 0.75);
    tie.position.y = (Math.random() - 0.5) * (TRENCH_HEIGHT * 0.75);
    tie.rotation.y = Math.PI; // Face towards player

    // Store AI state in userData
    tie.userData = {
        type: 'tie',
        speed: currentForwardSpeed * OBSTACLE_SPEED_FACTOR,
        lastFired: 0, // Timer for firing cooldown
        targetPosition: new THREE.Vector3(), // Where it's trying to go
        health: 2 // TIEs take 2 hits?
    };

    scene.add(tie);
    obstacles.push(tie);
}

// --- Predictive Aiming Function ---
function calculateInterceptPoint(sourcePos, targetPos, targetVel, projectileSpeed) {
    const deltaPos = new THREE.Vector3().subVectors(targetPos, sourcePos);
    const a = targetVel.dot(targetVel) - projectileSpeed * projectileSpeed;
    const b = 2 * targetVel.dot(deltaPos);
    const c = deltaPos.dot(deltaPos);
    const discriminant = b * b - 4 * a * c;

    if (discriminant >= 0) {
        const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        const t = Math.min(t1 > 0 ? t1 : Infinity, t2 > 0 ? t2 : Infinity);
        if (t > 0 && t !== Infinity) {
            return targetPos.clone().addScaledVector(targetVel, t);
        }
    }
    return targetPos.clone(); // Fallback: aim directly
}


function fireEnemyLaser(sourceObject, targetObject) {
    if (!sourceObject || !targetObject) return;

    const laserGeo = new THREE.BoxGeometry(4, 4, 25);
    const laser = new THREE.Mesh(laserGeo, enemyLaserMaterial);

    const sourcePos = new THREE.Vector3();
    sourceObject.getWorldPosition(sourcePos);

    const targetPos = new THREE.Vector3();
    targetObject.getWorldPosition(targetPos);

    // Calculate intercept point using player's current velocity
    const interceptPoint = calculateInterceptPoint(sourcePos, targetPos, playerVelocity, ENEMY_LASER_SPEED);

    // Calculate direction from source to intercept point
    const direction = new THREE.Vector3().subVectors(interceptPoint, sourcePos).normalize();

    // Position laser slightly in front of the source
    laser.position.copy(sourcePos).addScaledVector(direction, 30);
    // Align laser rotation to the calculated direction
    laser.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), direction);

    laser.userData.velocity = direction;

    enemyLasers.push(laser);
    scene.add(laser);
}


// --- Event Handlers ---
function onWindowResize() {
    gameWidth = window.innerWidth * 0.8; gameHeight = window.innerHeight * 0.9;
    camera.aspect = gameWidth / gameHeight; camera.updateProjectionMatrix();
    renderer.setSize(gameWidth, gameHeight);
}

function onKeyDown(event) {
    keysPressed[event.code] = true;
    if (event.code === 'Space' && !targetHit && !gameOver && !keysPressed.fired && playerShip) {
        fireLaser(); keysPressed.fired = true;
    }
    if (event.code === 'KeyB' && !isBoosting && boostCooldownTimer <= 0 && !gameOver) {
        isBoosting = true; boostTimer = BOOST_DURATION; boostCooldownTimer = BOOST_COOLDOWN;
        currentForwardSpeed = PLAYER_BASE_FORWARD_SPEED * BOOST_MULTIPLIER;
        engineMeshes.forEach(engine => engine.material = shipEngineBoostMaterial);
    }
    if (event.code === 'KeyR') { resetGame(); }
}

function onKeyUp(event) {
    keysPressed[event.code] = false;
    if (event.code === 'Space') { keysPressed.fired = false; }
}

function resetGame() {
    if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; }

    // Clear scene objects
    lasers.forEach(laser => scene.remove(laser)); lasers = [];
    enemyLasers.forEach(laser => scene.remove(laser)); enemyLasers = [];
    trenchSegments.forEach(seg => scene.remove(seg.mesh)); trenchSegments = [];
    stars.forEach(star => scene.remove(star)); stars = [];
    obstacles.forEach(obs => scene.remove(obs)); obstacles = [];
    wallCannons.forEach(cannon => {
        if(cannon.parent) cannon.parent.remove(cannon); else scene.remove(cannon);
    }); wallCannons = [];
    explosionParticles.forEach(p => scene.remove(p)); explosionParticles = [];

    if (playerShip) scene.remove(playerShip);
    if (target) scene.remove(target);

    // Reset game state variables
    playerHealth = PLAYER_MAX_HEALTH; // Reset health
    targetHit = false; gameOver = false; explosionActive = false; explosionTimer = 0;
    keysPressed = {}; lastObstacleSpawnTime = 0; isBoosting = false; boostTimer = 0;
    boostCooldownTimer = 0; currentForwardSpeed = PLAYER_BASE_FORWARD_SPEED;
    clock = new THREE.Clock();

    messageBox.style.display = 'none';

    // Recreate elements
    createPlayerShip(); createTarget(); createInitialTrenchSegments(); createStars();

    // Reset camera position & player velocity tracking
    if (playerShip) {
        lastPlayerPosition.copy(playerShip.position); // Initialize last position
        playerVelocity.set(0, 0, 0); // Reset velocity
        camera.position.copy(playerShip.position).add(new THREE.Vector3(0, CAMERA_HEIGHT, CAMERA_DISTANCE));
        camera.lookAt(playerShip.position);
    }
    // Reset UI
    updateHealthBarUI();
    updateDistanceCounter();

    // Restart animation loop
    animate();
}


// --- Game Logic ---
function handleInput(deltaTime) {
    if (gameOver || targetHit || !playerShip) return;

    const moveSpeed = currentForwardSpeed * deltaTime;
    const strafeSpeed = PLAYER_STRAFE_SPEED * deltaTime;
    const verticalSpeed = PLAYER_VERTICAL_SPEED * deltaTime;
    const rollSpeed = PLAYER_ROLL_SPEED * deltaTime;

    // Movement
    if (keysPressed['KeyA']) playerShip.translateX(-strafeSpeed);
    if (keysPressed['KeyD']) playerShip.translateX(strafeSpeed);
    if (keysPressed['KeyW'] || keysPressed['ArrowUp']) playerShip.translateY(verticalSpeed);
    if (keysPressed['KeyS'] || keysPressed['ArrowDown']) playerShip.translateY(-verticalSpeed);

    // Rotation
    if (keysPressed['KeyQ']) playerShip.rotateZ(rollSpeed);
    if (keysPressed['KeyE']) playerShip.rotateZ(-rollSpeed);

    // Apply Forward Movement
    playerShip.translateZ(-moveSpeed);

    // Clamp Position (Wall collision check is primary)
    const limitX = TRENCH_WIDTH / 2 + 50;
    playerShip.position.x = Math.max(-limitX, Math.min(limitX, playerShip.position.x));
    const limitY = TRENCH_HEIGHT / 2 + 50;
    playerShip.position.y = Math.max(-limitY, Math.min(limitY, playerShip.position.y));
}

function fireLaser() {
    if (!playerShip) return;
    const laserGeo = new THREE.BoxGeometry(3, 3, 40);
    const shipPosition = new THREE.Vector3(); playerShip.getWorldPosition(shipPosition);
    const shipQuaternion = new THREE.Quaternion(); playerShip.getWorldQuaternion(shipQuaternion);
    const offsets = [new THREE.Vector3(-5, 0, -25), new THREE.Vector3( 5, 0, -25)]; // Fire from two points

    offsets.forEach(offset => {
        const singleLaser = new THREE.Mesh(laserGeo, laserMaterial);
        const rotatedOffset = offset.clone().applyQuaternion(shipQuaternion);
        singleLaser.position.copy(shipPosition).add(rotatedOffset);
        singleLaser.rotation.copy(playerShip.rotation);
        const velocity = new THREE.Vector3(0, 0, -1); velocity.applyQuaternion(shipQuaternion); velocity.normalize();
        singleLaser.userData.velocity = velocity;
        lasers.push(singleLaser); scene.add(singleLaser);
    });
}

function checkWallCollisions() {
    if (!playerShip || gameOver || targetHit) return;
    const playerPos = playerShip.position;
    const shipRadius = PLAYER_HITBOX_SIZE;

    let collisionType = null;

    if (playerPos.y - shipRadius < -TRENCH_HEIGHT / 2 + WALL_COLLISION_PADDING) collisionType = "Floor";
    else if (playerPos.y + shipRadius > TRENCH_HEIGHT / 2 - WALL_COLLISION_PADDING) collisionType = "Ceiling"; // Check ceiling
    else if (playerPos.x - shipRadius < -TRENCH_WIDTH / 2 + WALL_COLLISION_PADDING) collisionType = "Left Wall";
    else if (playerPos.x + shipRadius > TRENCH_WIDTH / 2 - WALL_COLLISION_PADDING) collisionType = "Right Wall";

    if (collisionType) {
        playerHealth -= PLAYER_MAX_HEALTH; // Wall hit = instant death
        updateHealthBarUI();
        triggerHitFlash(); // Flash on wall hit too
        startExplosion(playerShip.position);
        if (playerHealth <= 0) {
            gameOver = true;
            // *** Updated Message Logic ***
            if (collisionType === "Ceiling") {
                showWinMessage("MISSION ABANDONED - Flew too high!");
            } else {
                showWinMessage(`GAME OVER - Hit ${collisionType}!`);
            }
            playerShip.visible = false;
        }
    }
}

function updateHealthBarUI() {
    if (!healthBar) return;
    const healthPercentage = Math.max(0, (playerHealth / PLAYER_MAX_HEALTH) * 100);
    // Use the ::after pseudo-element's width for the bar fill
    healthBar.style.setProperty('--health-percentage', `${healthPercentage}%`);
}

function triggerHitFlash() {
    if (!hitFlashOverlay) return;
    // Clear any existing timeout to prevent overlaps
    if (hitFlashTimeoutId) clearTimeout(hitFlashTimeoutId);

    hitFlashOverlay.style.opacity = '1'; // Show the flash
    // Set a timeout to hide the flash after a short duration
    hitFlashTimeoutId = setTimeout(() => {
        hitFlashOverlay.style.opacity = '0';
        hitFlashTimeoutId = null; // Clear the timeout ID
    }, HIT_FLASH_DURATION);
}


function updateGameObjects(deltaTime, elapsedTime) {
    const gameActive = !gameOver && !targetHit;
    if (!playerShip) return;

    // --- Calculate Player Velocity (for enemy aiming) ---
    if (gameActive) {
        // Ensure deltaTime is not zero to avoid division issues
        if (deltaTime > 0) {
            playerVelocity.subVectors(playerShip.position, lastPlayerPosition).divideScalar(deltaTime);
            lastPlayerPosition.copy(playerShip.position);
        }
    } else {
        playerVelocity.set(0,0,0); // Stop velocity calculation if game over
    }


    // Update Boost
    if (isBoosting) {
        boostTimer -= deltaTime;
        if (boostTimer <= 0) {
            isBoosting = false; boostTimer = 0; currentForwardSpeed = PLAYER_BASE_FORWARD_SPEED;
            engineMeshes.forEach(engine => engine.material = shipEngineMaterial);
        }
    } else if (boostCooldownTimer > 0) {
        boostCooldownTimer -= deltaTime; if (boostCooldownTimer < 0) boostCooldownTimer = 0;
    }

    // Check Wall Collisions FIRST
    checkWallCollisions();
    // Re-check gameActive state after collision check
    const stillGameActive = !gameOver && !targetHit; // Use a new var to avoid modifying gameActive mid-loop

    if (!stillGameActive) {
        updateExplosion(deltaTime); updateDistanceCounter(); updateCamera();
        return; // Stop further updates if game ended
    }

    // --- Update Player Lasers ---
    for (let i = lasers.length - 1; i >= 0; i--) {
        const laser = lasers[i];
        if (!laser) { lasers.splice(i, 1); continue; }
        laser.position.addScaledVector(laser.userData.velocity, LASER_SPEED * deltaTime);
        let laserRemoved = false;

        // Collision with Target (Range Check)
        const distanceToTarget = TARGET_Z_POSITION - laser.position.z;
        // *** TARGET HIT RANGE CHECK - Reinforced ***
        if (target.visible && distanceToTarget <= TARGET_HIT_RANGE && distanceToTarget > -TARGET_SIZE) { // Check range strictly
            const laserSphere = new THREE.Sphere(); new THREE.Box3().setFromObject(laser).getBoundingSphere(laserSphere);
            const targetSphere = new THREE.Sphere(); new THREE.Box3().setFromObject(target).getBoundingSphere(targetSphere);
            if (laserSphere.intersectsSphere(targetSphere)) {
                targetHit = true; target.visible = false; target.userData.hit = true;
                scene.remove(laser); lasers.splice(i, 1); laserRemoved = true;
                startExplosion(target.position); showWinMessage("TARGET DESTROYED!");
                continue; // Skip other checks, end game state handled at top
            }
        }

        // Collision with TIE Fighters
        if (!laserRemoved) {
            for (let j = obstacles.length - 1; j >= 0; j--) {
                const obstacle = obstacles[j]; if (!obstacle || !laser) continue;
                const laserBoxCheck = new THREE.Box3().setFromObject(laser);
                const obstacleBoxCheck = new THREE.Box3().setFromObject(obstacle);
                if (laserBoxCheck.intersectsBox(obstacleBoxCheck)) {
                    scene.remove(laser); lasers.splice(i, 1); laserRemoved = true;
                    obstacle.userData.health -= 1;
                    if (obstacle.userData.health <= 0) {
                        scene.remove(obstacle); obstacles.splice(j, 1);
                        startExplosion(obstacle.position);
                    } break;
                }
            }
        }
        // Collision with Cannons
        if (!laserRemoved) {
            for (let j = wallCannons.length - 1; j >= 0; j--) {
                 const cannon = wallCannons[j]; if (!cannon || !laser) continue;
                 const laserBoxCheck = new THREE.Box3().setFromObject(laser);
                 const cannonBoxCheck = new THREE.Box3().setFromObject(cannon);
                 if (laserBoxCheck.intersectsBox(cannonBoxCheck)) {
                     scene.remove(laser); lasers.splice(i, 1); laserRemoved = true;
                     cannon.userData.health -= 1;
                     if (cannon.userData.health <= 0) {
                         if(cannon.parent) cannon.parent.remove(cannon); else scene.remove(cannon);
                         wallCannons.splice(j, 1); startExplosion(cannon.position);
                     } break;
                 }
            }
        }
        // Remove lasers far away or behind
        if (!laserRemoved && (laser.position.z > playerShip.position.z + TRENCH_DEPTH_LIMIT * 1.1 || laser.position.z < playerShip.position.z - 300)) {
            scene.remove(laser); lasers.splice(i, 1);
        }
    }

     // --- Update Enemy Lasers ---
    for (let i = enemyLasers.length - 1; i >= 0; i--) {
        const laser = enemyLasers[i];
        if (!laser) { enemyLasers.splice(i, 1); continue; }
        laser.position.addScaledVector(laser.userData.velocity, ENEMY_LASER_SPEED * deltaTime);
        let laserRemoved = false;

        // Collision with Player
        if (playerShip.visible) {
            const laserSphere = new THREE.Sphere(); new THREE.Box3().setFromObject(laser).getBoundingSphere(laserSphere);
            const playerSphere = new THREE.Sphere(playerShip.position, PLAYER_HITBOX_SIZE);
            if (laserSphere.intersectsSphere(playerSphere)) {
                playerHealth--; // Decrease health
                updateHealthBarUI();
                triggerHitFlash(); // Trigger flash effect
                scene.remove(laser); enemyLasers.splice(i, 1); laserRemoved = true;
                if (playerHealth <= 0 && !gameOver) { // Check !gameOver to prevent multiple triggers
                    gameOver = true;
                    startExplosion(playerShip.position);
                    showWinMessage("GAME OVER - Shot Down!");
                    playerShip.visible = false;
                } else if (playerHealth > 0) {
                    // Don't necessarily explode on non-fatal hit, flash is enough
                    // startExplosion(laser.position); // Small explosion where hit occurred
                }
            }
        }
        // Remove enemy lasers far away or behind
        if (!laserRemoved && (laser.position.z > playerShip.position.z + TRENCH_DEPTH_LIMIT * 1.1 || laser.position.z < playerShip.position.z - 500)) {
            scene.remove(laser); enemyLasers.splice(i, 1);
        }
    }

    // --- Update Trench Segments ---
    if (stillGameActive) { // Use the state checked after wall collisions
        const currentSegmentZ = playerShip.position.z;
        while (trenchSegments.length > 0 && trenchSegments[0].z < currentSegmentZ - TRENCH_SEGMENT_LENGTH * 3) {
             const segmentMesh = trenchSegments[0].mesh;
             wallCannons = wallCannons.filter(cannon => {
                 if (cannon.parent === segmentMesh) { segmentMesh.remove(cannon); return false; } return true;
             });
            scene.remove(segmentMesh); trenchSegments.shift();
        }
        if (trenchSegments.length === 0 || trenchSegments[trenchSegments.length - 1].z < currentSegmentZ + TRENCH_DEPTH_LIMIT) {
            const nextZ = trenchSegments.length > 0 ? trenchSegments[trenchSegments.length - 1].z + TRENCH_SEGMENT_LENGTH : Math.floor(currentSegmentZ / TRENCH_SEGMENT_LENGTH) * TRENCH_SEGMENT_LENGTH + TRENCH_DEPTH_LIMIT;
            addTrenchSegment(nextZ);
        }
    }

    // --- Spawn and Update Obstacles (TIE Fighters) ---
    if (stillGameActive) { // Use the state checked after wall collisions
        if (elapsedTime - lastObstacleSpawnTime > OBSTACLE_SPAWN_RATE) {
             createTieFighter(playerShip.position.z + TRENCH_DEPTH_LIMIT * 0.95);
             lastObstacleSpawnTime = elapsedTime;
        }

        const playerBox = new THREE.Box3().setFromObject(playerShip);
        const playerPos = playerShip.position;

        for (let i = obstacles.length - 1; i >= 0; i--) {
            const obstacle = obstacles[i];
            if (!obstacle) { obstacles.splice(i, 1); continue; }

            // --- TIE Fighter AI ---
            const directionToPlayer = new THREE.Vector3().subVectors(playerPos, obstacle.position);
            const distanceToPlayer = directionToPlayer.length();
            directionToPlayer.normalize();

            // Target position slightly ahead of player for interception
            const interceptPos = calculateInterceptPoint(obstacle.position, playerPos, playerVelocity, ENEMY_LASER_SPEED); // Use predictive aiming for movement too
            const directionToIntercept = new THREE.Vector3().subVectors(interceptPos, obstacle.position).normalize();

            // Rotate towards intercept point
            const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), directionToIntercept);
            obstacle.quaternion.slerp(targetQuaternion, TIE_TURN_SPEED * deltaTime);

            // Move TIE forward along its current direction + towards player X/Y
            const forward = new THREE.Vector3(0, 0, -1); forward.applyQuaternion(obstacle.quaternion);
            obstacle.userData.speed = currentForwardSpeed * OBSTACLE_SPEED_FACTOR;
            // Base forward movement (relative to player's speed)
            obstacle.position.addScaledVector(forward, -(obstacle.userData.speed - currentForwardSpeed) * deltaTime); // Move relative to player forward speed
            // Add chasing movement towards player's predicted X/Y plane
            const chaseVel = new THREE.Vector3(directionToIntercept.x, directionToIntercept.y, 0).normalize(); // Use intercept direction for chase
            obstacle.position.addScaledVector(chaseVel, obstacle.userData.speed * TIE_CHASE_FACTOR * deltaTime);


            // Wall Avoidance
            if (obstacle.position.x < -TRENCH_WIDTH / 2 * 0.8) obstacle.position.x += 15 * deltaTime;
            if (obstacle.position.x > TRENCH_WIDTH / 2 * 0.8) obstacle.position.x -= 15 * deltaTime;
            if (obstacle.position.y < -TRENCH_HEIGHT / 2 * 0.8) obstacle.position.y += 15 * deltaTime;
            if (obstacle.position.y > TRENCH_HEIGHT / 2 * 0.8) obstacle.position.y -= 15 * deltaTime;

            // Firing Logic
            if (elapsedTime - obstacle.userData.lastFired > TIE_FIRE_RATE) {
                 const dot = directionToPlayer.dot(forward); // Check if player is generally in front
                 if (dot > 0.85 && distanceToPlayer < TRENCH_DEPTH_LIMIT * 0.7) {
                     fireEnemyLaser(obstacle, playerShip); // Pass playerShip object for predictive aim
                     obstacle.userData.lastFired = elapsedTime;
                 }
            }

            // Collision with player
            const obstacleBox = new THREE.Box3().setFromObject(obstacle);
            if (playerBox.intersectsBox(obstacleBox)) {
                playerHealth -= 1; // TIE collision damage
                updateHealthBarUI();
                triggerHitFlash(); // Flash on collision
                startExplosion(obstacle.position); // TIE explodes
                scene.remove(obstacle); obstacles.splice(i, 1); // Remove TIE
                if (playerHealth <= 0 && !gameOver) { // Check !gameOver
                    gameOver = true; startExplosion(playerShip.position); showWinMessage("GAME OVER - Collision!");
                    playerShip.visible = false; break;
                }
            }

            // Remove obstacles far behind
            if (obstacle.position.z < playerShip.position.z - 300) {
                scene.remove(obstacle); obstacles.splice(i, 1);
            }
        }
    }

     // --- Update Wall Cannons ---
     if (stillGameActive) { // Use the state checked after wall collisions
         const playerPos = playerShip.position;
         for (let i = wallCannons.length - 1; i >= 0; i--) {
             const cannon = wallCannons[i];
             if (!cannon) { wallCannons.splice(i, 1); continue; }

             // Firing Logic
             if (elapsedTime - cannon.userData.lastFired > CANNON_FIRE_RATE) { // Use updated rate
                 const cannonPos = new THREE.Vector3(); cannon.getWorldPosition(cannonPos);
                 const distanceToPlayer = playerPos.distanceTo(cannonPos);
                 // Fire only if player is within range and generally in front
                 if (distanceToPlayer < TRENCH_DEPTH_LIMIT * 0.6 && cannonPos.z > playerPos.z) {
                     fireEnemyLaser(cannon, playerShip); // Pass playerShip object for predictive aim
                     cannon.userData.lastFired = elapsedTime;
                 }
             }
         }
     }

    // --- Update Explosion, Distance Counter, Camera ---
    updateExplosion(deltaTime);
    updateDistanceCounter();
    updateCamera();
}

function updateExplosion(deltaTime) {
    // This function remains the same - handles particle animation
    if (explosionActive) { // Check flag still needed here
        explosionTimer += deltaTime;
        const progress = explosionTimer / EXPLOSION_DURATION;
        if (progress >= 1) {
            explosionActive = false; explosionTimer = 0;
            explosionParticles.forEach(p => scene.remove(p)); explosionParticles = [];
        } else {
            const speedFactor = deltaTime * EXPLOSION_SPEED * (1 - progress * 0.5);
            explosionParticles.forEach(p => {
                p.position.addScaledVector(p.userData.velocity, speedFactor);
                p.material.opacity = 1.0 - progress;
            });
        }
    }
}

function updateDistanceCounter() {
    if (playerShip) {
         if (gameOver) { distanceCounter.textContent = `Distance: ---`; }
         else if (targetHit) { distanceCounter.textContent = `Distance: 0 m`; }
         else {
             const distance = Math.max(0, Math.floor(TARGET_Z_POSITION - playerShip.position.z));
             distanceCounter.textContent = `Distance: ${distance} m`;
         }
    } else { distanceCounter.textContent = `Distance: ---`; }
}

function updateCamera() {
     if (playerShip && playerShip.visible) {
        const targetCamPos = new THREE.Vector3(0, CAMERA_HEIGHT, CAMERA_DISTANCE);
        targetCamPos.applyQuaternion(playerShip.quaternion);
        targetCamPos.add(playerShip.position);
        camera.position.lerp(targetCamPos, CAMERA_LAG);
        camera.lookAt(playerShip.position);
    }
}


function startExplosion(position) {
    // explosionActive = true; // Don't set flag here, let updateActiveExplosions handle it
    // explosionTimer = 0;

    const particleGeo = new THREE.SphereGeometry(5, 6, 6);
    // const tempParticles = []; // Not needed with separate update function

    for (let i = 0; i < EXPLOSION_PARTICLE_COUNT; i++) {
        const material = explosionMaterials[Math.floor(Math.random() * explosionMaterials.length)].clone();
        material.opacity = 1.0;
        const particle = new THREE.Mesh(particleGeo, material);
        particle.position.copy(position);
        const velocity = new THREE.Vector3(
            Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5
        ).normalize();
        particle.userData.velocity = velocity;
        particle.userData.startTime = clock.getElapsedTime(); // Store start time
        scene.add(particle);
        explosionParticles.push(particle); // Add to global list for update loop
        // tempParticles.push(particle);
    }
}

// Separate update function for explosion particles
function updateActiveExplosions(deltaTime) {
    const currentTime = clock.getElapsedTime();
    if (explosionParticles.length > 0) explosionActive = true; // Set flag if particles exist
    else explosionActive = false;

    for (let i = explosionParticles.length - 1; i >= 0; i--) {
        const particle = explosionParticles[i];
        const elapsedTime = currentTime - particle.userData.startTime;
        const progress = elapsedTime / EXPLOSION_DURATION;

        if (progress >= 1) {
            scene.remove(particle);
            explosionParticles.splice(i, 1);
        } else {
            const speedFactor = deltaTime * EXPLOSION_SPEED * (1 - progress * 0.5);
            particle.position.addScaledVector(particle.userData.velocity, speedFactor);
            particle.material.opacity = 1.0 - progress;
        }
    }
}


function showWinMessage(message) {
    messageBox.innerHTML = `${message}<br>(Press R to Reset)`;
    messageBox.style.display = 'block';
}

// --- Animation Loop ---
function animate() {
    animationFrameId = requestAnimationFrame(animate);
    const deltaTime = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // Handle input only if game is active
    if (!gameOver && !targetHit) {
        handleInput(deltaTime);
    }

    // Update game objects and camera
    updateGameObjects(deltaTime, elapsedTime);

    // Update explosion particles separately
    updateActiveExplosions(deltaTime);


    // Render the scene
    renderer.render(scene, camera);
}

// --- Start ---
document.addEventListener('DOMContentLoaded', (event) => { init(); });
