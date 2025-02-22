class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.audioManager = new AudioManager();

        // Set initial scale based on screen size
        this.scale = Math.min(window.innerWidth / 800, window.innerHeight / 600);
        this.resizeCanvas();
        window.addEventListener('resize', () => {
            this.scale = Math.min(window.innerWidth / 800, window.innerHeight / 600);
            this.resizeCanvas();
        });

        this.bird = {
            x: this.canvas.width * 0.2,
            y: this.canvas.height / 2,
            velocity: 0,
            gravity: 0.05,  // Reduced from 0.25
            lift: -3,      // Reduced from -6
            size: 30
        };

        this.obstacles = [];
        this.score = 0;
        this.gameOver = false;
        this.spacing = 450;  // Increased from 200
        this.gap = 150;


        this.setupControls();
        this.reset();
        this.loop();
    }

    resizeCanvas() {
        const maxWidth = Math.min(800, window.innerWidth - 40);
        const maxHeight = Math.min(600, window.innerHeight - 100);

        this.canvas.width = maxWidth;
        this.canvas.height = maxHeight;

        // Update bird position on resize
        if (this.bird) {
            this.bird.x = this.canvas.width * 0.2;
            this.bird.size = 30 * this.scale;
        }
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') this.jump();
        });

        this.canvas.addEventListener('click', () => this.jump());
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.jump();
        });
    }

    jump() {
        if (this.gameOver) return;
        this.bird.velocity = this.bird.lift;
        const phrase = this.audioManager.playRandomPhrase();
        this.showPhrase(phrase);
        document.getElementById('phrase').textContent = this.currentPhrase;
    }

    showPhrase(phrase) {
        this.currentPhrase = phrase;
        this.phraseTimer = 30;
    }

    reset() {
        this.bird.y = this.canvas.height / 2;
        this.bird.velocity = 0;
        this.obstacles = [];
        this.score = 0;
        this.gameOver = false;
        document.getElementById('gameOver').classList.add('d-none');
        document.getElementById('score').textContent = this.score;
    }

    addObstacle() {
        let centerY = Math.random() * (this.canvas.height - this.gap) + this.gap/2;
        this.obstacles.push({
            x: this.canvas.width,
            centerY: centerY,
            counted: false
        });
    }

    update() {
        if (this.gameOver) return;

        // Update bird
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;

        // Add new obstacles
        if (this.obstacles.length === 0 || 
            this.canvas.width - this.obstacles[this.obstacles.length-1].x > this.spacing) {
            this.addObstacle();
        }

        // Update obstacles
        for (let i = this.obstacles.length-1; i >= 0; i--) {
            let obs = this.obstacles[i];
            obs.x -= 1;  // Reduced from 1.5 to make movement even slower

            // Score points
            if (!obs.counted && obs.x < this.bird.x) {
                this.score++;
                obs.counted = true;
                document.getElementById('score').textContent = this.score;
            }

            // Remove off-screen obstacles
            if (obs.x < -40) {
                this.obstacles.splice(i, 1);
            }

            // Check collision
            if (this.bird.y < 0 || this.bird.y > this.canvas.height ||
                (Math.abs(obs.x - this.bird.x) < (40 * this.scale) && 
                 Math.abs(obs.centerY - this.bird.y) > this.gap/2)) {
                this.endGame();
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw bird
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.beginPath();
        this.ctx.arc(this.bird.x, this.bird.y, this.bird.size/2, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw obstacles
        this.ctx.fillStyle = '#795548';
        this.obstacles.forEach(obs => {
            const obstacleWidth = 40 * this.scale;
            this.ctx.fillRect(obs.x - obstacleWidth/2, 0, obstacleWidth, obs.centerY - this.gap/2);
            this.ctx.fillRect(obs.x - obstacleWidth/2, obs.centerY + this.gap/2, obstacleWidth, this.canvas.height);
        });

        // Draw phrase
        if (this.phraseTimer > 0) {
            this.ctx.fillStyle = 'white';
            this.ctx.font = `${24 * this.scale}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.currentPhrase, this.canvas.width/2, 50 * this.scale);
            this.phraseTimer--;
        }
    }

    endGame() {
        this.gameOver = true;
        this.audioManager.playGameOver();
        document.getElementById('gameOver').classList.remove('d-none');
        document.getElementById('finalScore').textContent = this.score;
    }

    loop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }
}

function restartGame() {
    window.game = new Game();
}

// Start the game when the page loads
window.addEventListener('load', () => {
    window.game = new Game();
});