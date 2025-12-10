// ===== ANIMACIÓN DE NIEVE =====
const snowCanvas = document.getElementById('snowCanvas');
const snowCtx = snowCanvas.getContext('2d');

snowCanvas.width = window.innerWidth;
snowCanvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    snowCanvas.width = window.innerWidth;
    snowCanvas.height = window.innerHeight;
});

class Snowflake {
    constructor() {
        this.x = Math.random() * snowCanvas.width;
        this.y = Math.random() * snowCanvas.height - snowCanvas.height;
        this.size = Math.random() * 4 + 1;
        this.speed = Math.random() * 1 + 0.5;
        this.wind = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.6 + 0.4;
    }

    update() {
        this.y += this.speed;
        this.x += this.wind;

        if (this.y > snowCanvas.height) {
            this.y = -10;
            this.x = Math.random() * snowCanvas.width;
        }

        if (this.x > snowCanvas.width) this.x = 0;
        if (this.x < 0) this.x = snowCanvas.width;
    }

    draw() {
        snowCtx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        snowCtx.beginPath();
        snowCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        snowCtx.fill();
        
        snowCtx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.3})`;
        snowCtx.beginPath();
        snowCtx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
        snowCtx.fill();
    }
}

const snowflakes = [];
for (let i = 0; i < 200; i++) {
    snowflakes.push(new Snowflake());
}

function animateSnow() {
    snowCtx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);
    
    snowflakes.forEach(snowflake => {
        snowflake.update();
        snowflake.draw();
    });
    
    requestAnimationFrame(animateSnow);
}

animateSnow();

// ===== ANIMACIÓN DE EMOJIS CAYENDO =====
const emojiCanvas = document.getElementById('emojiCanvas');
const emojiCtx = emojiCanvas.getContext('2d');

emojiCanvas.width = window.innerWidth;
emojiCanvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    emojiCanvas.width = window.innerWidth;
    emojiCanvas.height = window.innerHeight;
});

class FallingEmoji {
    constructor(emoji) {
        this.emoji = emoji;
        this.x = Math.random() * emojiCanvas.width;
        this.y = -50;
        this.size = Math.random() * 30 + 40;
        this.speed = Math.random() * 3 + 2;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        this.opacity = 1;
    }

    update() {
        this.y += this.speed;
        this.rotation += this.rotationSpeed;
        
        if (this.y > emojiCanvas.height + 50) {
            return false;
        }
        return true;
    }

    draw() {
        emojiCtx.save();
        emojiCtx.globalAlpha = this.opacity;
        emojiCtx.translate(this.x, this.y);
        emojiCtx.rotate(this.rotation);
        emojiCtx.font = `${this.size}px Arial`;
        emojiCtx.textAlign = 'center';
        emojiCtx.textBaseline = 'middle';
        emojiCtx.fillText(this.emoji, 0, 0);
        emojiCtx.restore();
    }
}

let fallingEmojis = [];
let isAnimatingEmojis = false;

function animateEmojis() {
    if (!isAnimatingEmojis) {
        emojiCanvas.classList.remove('active');
        return;
    }
    
    emojiCtx.clearRect(0, 0, emojiCanvas.width, emojiCanvas.height);
    
    fallingEmojis = fallingEmojis.filter(emoji => {
        const stillActive = emoji.update();
        emoji.draw();
        return stillActive;
    });
    
    if (fallingEmojis.length > 0) {
        requestAnimationFrame(animateEmojis);
    } else {
        isAnimatingEmojis = false;
        emojiCanvas.classList.remove('active');
    }
}

function startSadEmojis() {
    const sadEmojis = ['😢', '😭', '😥', '🥺', '😞', '😔', '☹️'];
    fallingEmojis = [];
    isAnimatingEmojis = false;
    
    emojiCanvas.classList.add('active');
    
    for (let i = 0; i < 50; i++) {
        const emoji = sadEmojis[Math.floor(Math.random() * sadEmojis.length)];
        setTimeout(() => {
            fallingEmojis.push(new FallingEmoji(emoji));
            if (!isAnimatingEmojis) {
                isAnimatingEmojis = true;
                animateEmojis();
            }
        }, i * 100);
    }
}

function startHappyEmojis() {
    const happyEmojis = ['🎉', '🎊', '✨', '⭐', '🌟', '💫', '🎆', '🎇', '🏆', '👑'];
    fallingEmojis = [];
    isAnimatingEmojis = false;
    
    emojiCanvas.classList.add('active');
    
    for (let i = 0; i < 60; i++) {
        const emoji = happyEmojis[Math.floor(Math.random() * happyEmojis.length)];
        setTimeout(() => {
            fallingEmojis.push(new FallingEmoji(emoji));
            if (!isAnimatingEmojis) {
                isAnimatingEmojis = true;
                animateEmojis();
            }
        }, i * 80);
    }
}

// ===== SORTEO 3D CON THREE.JS =====
const COLORS = [
    0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12, 
    0x9b59b6, 0x1abc9c, 0xe67e22, 0x34495e,
    0xc0392b, 0x2980b9, 0x27ae60, 0xf1c40f
];

let scene, camera, renderer;
let sphereGroup;
let balls = [];
let isAnimating = false;
let rotationSpeed = 0;
let selectedBall = null;
let arrow = null;
let selectionMode = null;

// ===== NUEVO: CONTADOR DE GANADORES =====
let winnerCount = 0;
const PREDEFINED_WINNERS = [124, 68, 73];

const ballCountInput = document.getElementById('ballCount');
const initButton = document.getElementById('initButton');
const mixButton = document.getElementById('mixButton');
const grabButton = document.getElementById('grabButton');
const statusMessage = document.getElementById('statusMessage');
const sphereContainer = document.querySelector('.sphere-container');
const threeContainer = document.getElementById('threeContainer');
const winnerAnnouncement = document.getElementById('winnerAnnouncement');
const winnerBall = document.getElementById('winnerBall');
const winnerNumber = document.getElementById('winnerNumber');
const closeWinner = document.getElementById('closeWinner');
const announcementTitle = document.getElementById('announcementTitle');

const selectionModal = document.getElementById('selectionModal');
const eliminateBtn = document.getElementById('eliminateBtn');
const winnerBtn = document.getElementById('winnerBtn');

function initThreeJS() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f2027);

    camera = new THREE.PerspectiveCamera(
        60,
        threeContainer.clientWidth / threeContainer.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(threeContainer.clientWidth, threeContainer.clientHeight);
    renderer.shadowMap.enabled = true;
    threeContainer.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0xffd700, 0.6);
    pointLight1.position.set(-5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff4a9e, 0.5);
    pointLight2.position.set(5, -5, 5);
    scene.add(pointLight2);

    sphereGroup = new THREE.Group();
    scene.add(sphereGroup);

    const sphereGeometry = new THREE.SphereGeometry(3, 64, 64);
    const sphereMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.15,
        roughness: 0,
        metalness: 0.1,
        transmission: 0.9,
        thickness: 0.5,
        side: THREE.DoubleSide
    });
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphereGroup.add(sphereMesh);

    const edgesGeometry = new THREE.EdgesGeometry(sphereGeometry);
    const edgesMaterial = new THREE.LineBasicMaterial({ 
        color: 0xffd700, 
        transparent: true, 
        opacity: 0.4 
    });
    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    sphereGroup.add(edges);

    animate();

    window.addEventListener('resize', handleResize);
}

function createBalls(count) {
    balls.forEach(ball => {
        sphereGroup.remove(ball.mesh);
    });
    balls = [];

    const ballGeometry = new THREE.SphereGeometry(0.18, 32, 32);

    for (let i = 1; i <= count; i++) {
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        
        const ballMaterial = new THREE.MeshPhysicalMaterial({
            color: color,
            roughness: 0.3,
            metalness: 0.6,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1
        });

        const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);

        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const r = Math.random() * 2.5;

        ballMesh.position.x = r * Math.sin(phi) * Math.cos(theta);
        ballMesh.position.y = r * Math.sin(phi) * Math.sin(theta);
        ballMesh.position.z = r * Math.cos(phi);

        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const context = canvas.getContext('2d');
        
        context.fillStyle = 'white';
        context.font = 'bold 70px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(i.toString(), 64, 64);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(0.4, 0.4, 1);
        ballMesh.add(sprite);

        const ballData = {
            mesh: ballMesh,
            number: i,
            color: '#' + color.toString(16).padStart(6, '0'),
            velocity: new THREE.Vector3(0, 0, 0),
            atRest: false
        };

        sphereGroup.add(ballMesh);
        balls.push(ballData);
    }
}

function checkCollision(ball1, ball2) {
    const distance = ball1.mesh.position.distanceTo(ball2.mesh.position);
    const minDistance = 0.36;
    return distance < minDistance;
}

function separateBalls(ball1, ball2) {
    const direction = new THREE.Vector3()
        .subVectors(ball1.mesh.position, ball2.mesh.position)
        .normalize();
    
    const overlap = 0.36 - ball1.mesh.position.distanceTo(ball2.mesh.position);
    
    ball1.mesh.position.add(direction.multiplyScalar(overlap * 0.5));
    ball2.mesh.position.sub(direction.multiplyScalar(overlap * 0.5));
}

function createArrow() {
    if (arrow) {
        scene.remove(arrow);
    }

    arrow = new THREE.Group();

    const shaftGeometry = new THREE.CylinderGeometry(0.08, 0.08, 2.5, 32);
    const shaftMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xff0844,
        roughness: 0.2,
        metalness: 0.8,
        emissive: 0xff0844,
        emissiveIntensity: 0.5
    });
    const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
    shaft.rotation.z = Math.PI / 2;
    shaft.position.x = 0;
    arrow.add(shaft);

    const tipGeometry = new THREE.ConeGeometry(0.25, 0.6, 32);
    const tipMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xff3838,
        roughness: 0.1,
        metalness: 0.9,
        emissive: 0xff3838,
        emissiveIntensity: 0.7
    });
    const tip = new THREE.Mesh(tipGeometry, tipMaterial);
    tip.rotation.z = -Math.PI / 2;
    tip.position.x = 1.55;
    arrow.add(tip);

    const featherGeometry = new THREE.ConeGeometry(0.15, 0.4, 3);
    const featherMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffd700,
        roughness: 0.3,
        metalness: 0.6,
        emissive: 0xffd700,
        emissiveIntensity: 0.4
    });
    
    for (let i = 0; i < 3; i++) {
        const feather = new THREE.Mesh(featherGeometry, featherMaterial);
        feather.rotation.z = Math.PI / 2;
        feather.position.x = -1.4;
        feather.position.y = Math.cos((i * Math.PI * 2) / 3) * 0.15;
        feather.position.z = Math.sin((i * Math.PI * 2) / 3) * 0.15;
        arrow.add(feather);
    }

    const arrowLight = new THREE.PointLight(0xff0844, 1, 5);
    arrowLight.position.set(0, 0, 0);
    arrow.add(arrowLight);

    arrow.position.set(-15, 0, 0);
    
    scene.add(arrow);
}

async function animateArrowThrough(targetBall) {
    const startX = -15;
    const ballX = targetBall.mesh.position.x;
    const ballY = targetBall.mesh.position.y;
    const ballZ = targetBall.mesh.position.z;
    const endX = 20;
    const steps = 70;
    
    for (let i = 0; i <= steps; i++) {
        const progress = i / steps;
        const easeProgress = progress;
        
        arrow.position.x = startX + ((ballX - startX) * easeProgress);
        arrow.position.y = ballY * easeProgress;
        arrow.position.z = ballZ * easeProgress;
        
        arrow.rotation.y += 0.02;
        
        await sleep(15);
    }
    
    await sleep(300);
    
    for (let i = 0; i <= steps; i++) {
        const progress = i / steps;
        const easeProgress = Math.pow(progress, 0.9);
        
        arrow.position.x = ballX + ((endX - ballX) * easeProgress);
        arrow.rotation.y += 0.03;
        
        targetBall.mesh.position.x = arrow.position.x + 1.8;
        targetBall.mesh.position.y = arrow.position.y;
        targetBall.mesh.position.z = arrow.position.z;
        
        targetBall.mesh.rotation.x += 0.1;
        targetBall.mesh.rotation.y += 0.15;
        
        targetBall.mesh.material.emissive = new THREE.Color(0xffd700);
        targetBall.mesh.material.emissiveIntensity = 1.5;
        
        await sleep(15);
    }
    
    await sleep(500);
    
    for (let i = 0; i < 25; i++) {
        const fade = 1 - (i / 25);
        
        targetBall.mesh.material.opacity = fade;
        targetBall.mesh.material.transparent = true;
        
        arrow.position.x += 0.4;
        targetBall.mesh.position.x = arrow.position.x + 1.8;
        targetBall.mesh.position.y = arrow.position.y;
        targetBall.mesh.position.z = arrow.position.z;
        
        targetBall.mesh.rotation.y += 0.2;
        
        await sleep(25);
    }
    
    scene.remove(arrow);
    arrow = null;
}

function animate() {
    requestAnimationFrame(animate);

    if (isAnimating) {
        rotationSpeed = Math.min(rotationSpeed + 0.001, 0.03);
        sphereGroup.rotation.y += rotationSpeed;
        sphereGroup.rotation.x += rotationSpeed * 0.5;

        balls.forEach(ball => {
            ball.atRest = false;
            ball.mesh.position.add(ball.velocity);

            const distance = ball.mesh.position.length();
            const maxDistance = 2.7;

            if (distance > maxDistance) {
                const normal = ball.mesh.position.clone().normalize();
                const dot = ball.velocity.dot(normal);
                ball.velocity.sub(normal.multiplyScalar(2 * dot));
                ball.velocity.multiplyScalar(0.9);
                ball.mesh.position.normalize().multiplyScalar(maxDistance);
            }

            ball.velocity.x += (Math.random() - 0.5) * 0.002;
            ball.velocity.y += (Math.random() - 0.5) * 0.002;
            ball.velocity.z += (Math.random() - 0.5) * 0.002;
            ball.velocity.y -= 0.001;

            const speed = ball.velocity.length();
            if (speed > 0.15) {
                ball.velocity.normalize().multiplyScalar(0.15);
            }

            ball.mesh.rotation.x += 0.02;
            ball.mesh.rotation.y += 0.02;
        });
    } else {
        rotationSpeed *= 0.95;
        if (rotationSpeed > 0.001) {
            sphereGroup.rotation.y += rotationSpeed;
            sphereGroup.rotation.x += rotationSpeed * 0.5;
        }

        balls.forEach(ball => {
            if (!ball.atRest) {
                const distance = ball.mesh.position.length();
                const maxDistance = 2.7;

                if (distance >= maxDistance - 0.01 && Math.abs(ball.velocity.length()) < 0.005) {
                    ball.atRest = true;
                    ball.velocity.set(0, 0, 0);
                    ball.mesh.position.normalize().multiplyScalar(maxDistance);
                } else {
                    const gravity = ball.mesh.position.clone().normalize().multiplyScalar(-0.002);
                    ball.velocity.add(gravity);
                    ball.mesh.position.add(ball.velocity);

                    if (distance > maxDistance) {
                        const normal = ball.mesh.position.clone().normalize();
                        const dot = ball.velocity.dot(normal);
                        ball.velocity.sub(normal.multiplyScalar(2 * dot));
                        ball.velocity.multiplyScalar(0.6);
                        ball.mesh.position.normalize().multiplyScalar(maxDistance);
                    }

                    ball.velocity.multiplyScalar(0.95);
                }
            }
        });

        for (let i = 0; i < balls.length; i++) {
            for (let j = i + 1; j < balls.length; j++) {
                if (checkCollision(balls[i], balls[j])) {
                    separateBalls(balls[i], balls[j]);
                    balls[i].mesh.position.normalize().multiplyScalar(2.7);
                    balls[j].mesh.position.normalize().multiplyScalar(2.7);
                }
            }
        }
    }

    renderer.render(scene, camera);
}

function handleResize() {
    camera.aspect = threeContainer.clientWidth / threeContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(threeContainer.clientWidth, threeContainer.clientHeight);
}

function initBalls() {
    const count = parseInt(ballCountInput.value);
    
    if (count < 10 || count > 200) {
        showStatus('Por favor ingresa un número entre 10 y 200', 'error');
        return;
    }

    // Verificar si es la primera vez que se presiona el botón
    const isFirstLoad = sessionStorage.getItem('hasInitialized');
    
    if (!isFirstLoad) {
        // Primera vez: marcar como inicializado y recargar la página
        sessionStorage.setItem('hasInitialized', 'true');
        sessionStorage.setItem('ballCount', count);
        location.reload();
        return;
    }

    // Si ya se recargó, continuar normalmente
    if (!renderer) {
        initThreeJS();
    }

    createBalls(count);
    
    // ===== NUEVO: RESETEAR CONTADOR DE GANADORES =====
    winnerCount = 0;
    
    mixButton.disabled = false;
    grabButton.disabled = true;
    winnerAnnouncement.classList.remove('show');
    
    showStatus(`${count} bolitas inicializadas correctamente 🎄`, 'success');
}

async function mixBalls() {
    if (isAnimating) return;
    
    isAnimating = true;
    mixButton.disabled = true;
    grabButton.disabled = true;
    winnerAnnouncement.classList.remove('show');
    
    sphereContainer.classList.add('mixing');
    showStatus('Mezclando bolitas navideñas... ❄️', 'info');
    
    balls.forEach(ball => {
        ball.velocity.x += (Math.random() - 0.5) * 0.35;
        ball.velocity.y += (Math.random() - 0.5) * 0.35;
        ball.velocity.z += (Math.random() - 0.5) * 0.35;
        ball.atRest = false;
    });
    
    await sleep(4000);
    
    isAnimating = false;
    sphereContainer.classList.remove('mixing');
    showStatus('¡Listo para seleccionar! 🎁', 'success');
    
    mixButton.disabled = false;
    grabButton.disabled = false;
}

function showSelectionModal() {
    if (isAnimating || balls.length === 0) return;
    
    selectionModal.classList.add('show');
}

// ===== NUEVA FUNCIÓN: SELECCIONAR BOLITA CON LÓGICA ESPECIAL =====
function selectBall(mode) {
    let selectedNumber;
    
    if (mode === 'winner') {
        // Para ganador: usar números predefinidos
        if (winnerCount < PREDEFINED_WINNERS.length) {
            selectedNumber = PREDEFINED_WINNERS[winnerCount];
            winnerCount++;
            
            // Verificar si el número predefinido existe en las bolitas
            const ball = balls.find(b => b.number === selectedNumber);
            if (!ball) {
                showStatus(`Error: El número ${selectedNumber} no está disponible`, 'error');
                return null;
            }
            return ball;
        } else {
            // Si ya se usaron todos los predefinidos, seleccionar aleatorio
            if (balls.length === 0) return null;
            return balls[Math.floor(Math.random() * balls.length)];
        }
    } else {
        // Para eliminar: NO usar los números predefinidos que aún no han salido
        const availableBalls = balls.filter(ball => {
            // Excluir los números ganadores que aún no han sido seleccionados
            const remainingWinners = PREDEFINED_WINNERS.slice(winnerCount);
            return !remainingWinners.includes(ball.number);
        });
        
        if (availableBalls.length === 0) {
            showStatus('Solo quedan números ganadores. ¡Usa la opción GANADOR! 🏆', 'warning');
            return null;
        }
        
        return availableBalls[Math.floor(Math.random() * availableBalls.length)];
    }
}

async function grabBall(mode) {
    if (isAnimating || balls.length === 0) return;
    
    selectionMode = mode;
    selectionModal.classList.remove('show');
    
    isAnimating = true;
    mixButton.disabled = true;
    grabButton.disabled = true;
    
    showStatus('¡Mezclando! ❄️', 'info');
    
    const movementDuration = 3000;
    const movementStart = Date.now();
    
    const chaosInterval = setInterval(() => {
        balls.forEach(ball => {
            ball.velocity.x += (Math.random() - 0.5) * 0.2;
            ball.velocity.y += (Math.random() - 0.5) * 0.2;
            ball.velocity.z += (Math.random() - 0.5) * 0.2;
            ball.atRest = false;
            
            const speed = ball.velocity.length();
            if (speed > 0.25) {
                ball.velocity.normalize().multiplyScalar(0.25);
            }
        });
        
        if (Date.now() - movementStart > movementDuration) {
            clearInterval(chaosInterval);
        }
    }, 50);
    
    await sleep(movementDuration);
    
    // ===== USAR LA NUEVA LÓGICA DE SELECCIÓN =====
    selectedBall = selectBall(mode);
    
    if (!selectedBall) {
        isAnimating = false;
        mixButton.disabled = false;
        grabButton.disabled = false;
        return;
    }
    
    showStatus('¡La flecha mágica viene! 🎯', 'info');
    
    createArrow();
    
    await sleep(500);
    
    selectedBall.mesh.material.emissive = new THREE.Color(0xffd700);
    selectedBall.mesh.material.emissiveIntensity = 1.5;
    
    showStatus('¡Seleccionando! ✨', 'info');
    
    await animateArrowThrough(selectedBall);
    
    winnerBall.style.backgroundColor = selectedBall.color;
    winnerBall.textContent = selectedBall.number;
    winnerNumber.textContent = selectedBall.number;
    
    const winnerContent = document.querySelector('.winner-content');
    
    if (mode === 'eliminate') {
        announcementTitle.textContent = '❌ BOLITA ELIMINADA ❌';
        winnerContent.classList.add('sad');
        winnerContent.classList.remove('happy');
        startSadEmojis();
        showStatus(`Bolita #${selectedBall.number} eliminada 😢`, 'warning');
    } else {
        announcementTitle.innerHTML = '🏆 ¡ES EL NÚMERO GANADOR! 🏆<br><span style="font-size: 0.6em; animation: none;">✨ ¡FELICIDADES! ✨</span>';
        winnerContent.classList.add('happy');
        winnerContent.classList.remove('sad');
        startHappyEmojis();
        showStatus(`¡GANADOR #${selectedBall.number}! 🎉🎊`, 'success');
    }
    
    winnerAnnouncement.classList.add('show');
    
    // ===== ELIMINAR LA BOLITA DE LA ESFERA =====
    sphereGroup.remove(selectedBall.mesh);
    balls = balls.filter(b => b.number !== selectedBall.number);
    
    isAnimating = false;
}

function showStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message show';
    
    switch(type) {
        case 'success':
            statusMessage.style.background = 'rgba(46, 204, 113, 0.8)';
            statusMessage.style.borderColor = 'rgba(46, 204, 113, 1)';
            break;
        case 'error':
            statusMessage.style.background = 'rgba(231, 76, 60, 0.8)';
            statusMessage.style.borderColor = 'rgba(231, 76, 60, 1)';
            break;
        case 'warning':
            statusMessage.style.background = 'rgba(243, 156, 18, 0.8)';
            statusMessage.style.borderColor = 'rgba(243, 156, 18, 1)';
            break;
        default:
            statusMessage.style.background = 'rgba(15, 32, 39, 0.8)';
            statusMessage.style.borderColor = 'rgba(255, 215, 0, 0.4)';
    }
    
    setTimeout(() => {
        statusMessage.classList.remove('show');
    }, 3000);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

initButton.addEventListener('click', initBalls);
mixButton.addEventListener('click', mixBalls);
grabButton.addEventListener('click', showSelectionModal);

eliminateBtn.addEventListener('click', () => grabBall('eliminate'));
winnerBtn.addEventListener('click', () => grabBall('winner'));

closeWinner.addEventListener('click', () => {
    winnerAnnouncement.classList.remove('show');
    
    fallingEmojis = [];
    isAnimatingEmojis = false;
    emojiCanvas.classList.remove('active');
    emojiCtx.clearRect(0, 0, emojiCanvas.width, emojiCanvas.height);
    
    if (balls.length > 0) {
        mixButton.disabled = false;
        grabButton.disabled = false;
    } else {
        showStatus('No quedan más bolitas. Inicializa nuevamente. 🎄', 'warning');
    }
});

// Al cargar la página, verificar si venimos de una recarga del botón
window.addEventListener('load', () => {
    const savedCount = sessionStorage.getItem('ballCount');
    
    if (savedCount) {
        // Si hay un valor guardado, significa que venimos de una recarga
        ballCountInput.value = savedCount;
        sessionStorage.removeItem('ballCount');
        
        // Inicializar automáticamente después de la recarga
        if (!renderer) {
            initThreeJS();
        }
        createBalls(parseInt(savedCount));
        mixButton.disabled = false;
        grabButton.disabled = true;
        showStatus(`${savedCount} bolitas inicializadas correctamente 🎄`, 'success');
    } else {
        showStatus('¡Bienvenido al sorteo navideño! ❄️ Ingresa la cantidad de bolitas', 'info');
    }
});