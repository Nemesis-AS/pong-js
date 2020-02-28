const config = {
	type : Phaser.AUTO,
	width: 640,
	height: 512,
	scene: {
		preload: preload,
		create: create,
		update: update
	},
	physics: {
		default: 'arcade',
		arcade: {
			debug: false
		}
	},
	background: 'black',
	parent: 'game',
	pixelart: true
};

const game = new Phaser.Game(config);

var cursors;
var ballVelocity = 100;
var score = {
	p1: 0,
	p2: 0
};
var ball;
var started = false;
var pointer;
var sceneSound;

function preload() {
	this.load.image('paddle', 'assets/paddle.png');
	this.load.image('ball', 'assets/ball.png');
	this.load.image('bg', 'assets/bg.png');
	this.load.image('logo', 'assets/logo.png');
	this.load.image('start', 'assets/startBtn.png');

	// Audio Files
	this.load.audio('collision', 'assets/collision.wav');
	this.load.audio('point', 'assets/Point.wav');
}

function create() {
	sceneSound = this.sound;

	// Create Groups
	paddleGroup = this.physics.add.group();

	// Create Sprites
	this.add.image(320, 256, 'bg');
	player1 = paddleGroup.create(8, 256, 'paddle').setCollideWorldBounds(true);
	player2 = paddleGroup.create(632, 256, 'paddle').setCollideWorldBounds(true);
	ball = this.physics.add.image(320, 256, 'ball').setCollideWorldBounds(true).setBounceY(1);

	// Create UI
	logo = this.add.image(320, 128,'logo');
	startBtn = this.add.image(320, 320, 'start');

	// Create Sound Instance
	collisionSnd = this.sound.add('collision');
	pointSnd = this.sound.add('point');

	// Input
	pointer = this.input.activePointer;
	cursors = this.input.keyboard.createCursorKeys();
	keyW = this.input.keyboard.addKey('W');
	keyS = this.input.keyboard.addKey('S');

	this.physics.add.collider(player1, ball, reverse);
	this.physics.add.collider(player2, ball, reverse);

	this.physics.world.setBoundsCollision(false, false, true, true);
	let randomNum = Phaser.Math.Between(1, 2);

	if (randomNum === 1) {
		ball.setVelocityX(ballVelocity);
	} else {
		ball.setVelocityX(-ballVelocity)
	}

	textConfig = {
		fontSize: "32px",
		fontFamily: 'Night Machine',
		stroke: '#000000',
		backgroundColor: '#000000'
	};

	scoreTextP1 = this.add.text(320, 0, '0', textConfig);
	scoreTextP1.x = 312 - scoreTextP1.displayWidth;
	scoreTextP2 = this.add.text(328, 0, '0', textConfig);

	winText = this.add.text(100, 384, '', {
		fontFamily: 'Night Machine',
		fontSize: '32px',
		stroke: '#000000',
		backgroundColor: '#000000'
	});
	
}

function update() {	

	if (started) {
		// P1 Controls
		if (keyW.isDown && player2.y - (player2.displayHeight/2) > 0) {
			player1.setVelocityY(-75)
		} else if (keyS.isDown && player2.y + (player2.displayHeight/2) < 512) {
			player1.setVelocityY(75);
		} else {
			player1.setVelocityY(0);
		}

		// P2 Controls
		if (cursors.up.isDown && player1.y - (player1.displayHeight/2) > 0) {
			player2.setVelocityY(-75);
		} else if (cursors.down.isDown && player1.y + (player1.displayHeight/2) < 512) {
			player2.setVelocityY(75);
		} else {
			player2.setVelocityY(0);
		}
	}
	

	// Stop the paddles from going offscreen after hit
	if (player1.x < 8) {
		player1.setVelocityX(0);
		player1.x = 8;
	}
	if (player2.x > 632) {
		player2.setVelocityX(0);
		player2.x = 632;
	}

	// Check if the ball has gone off-screen
	if (ball.x > 632) {
		ball.setVisible(false);
		ball.setVelocity(0, 0);
		ball.x = 320;
		ball.y = 256;
		updateScore(player1);
	} else if (ball.x < 0) {
		ball.setVisible(false);
		ball.setVelocity(0, 0);
		ball.x = 320;
		ball.y = 256;
		updateScore(player2);
	}

	scoreTextP1.setText(score.p1, this);
	scoreTextP2.setText(score.p2, this);

	// Victory Checker
	if (score.p1 >= 5) {
		win('Player 1');
	} else if (score.p2 >= 5) {
		win('Player 2');
	}

	startBtn.setInteractive().on('pointerdown', function(pointer, localX, localY, event){
   		started = true; 
   		startBtn.setVisible(false);
	 	logo.setVisible(false);
	 	startBtn.disableInteractive();
	 	winText.setText('');

	 	player1.y = 256;
	 	player2.y = 256;
	 	ball.x = 320;
	 	ball.y = 256;

	 	let randomNum = Phaser.Math.Between(1, 2);
		if (randomNum === 1) {
			ball.setVelocityX(ballVelocity);
		} else {
			ball.setVelocityX(-ballVelocity)
		}
	});

}

function reverse(object1, object2) {
	ballVelocity = ballVelocity * -1;
	// Object1 - Paddle
	object2.setVelocityX(ballVelocity);

	let distance = object1.y - object2.y;

	object1.setVelocityX(0);
	sceneSound.play('collision');

	if (distance < -20) {
		object2.setVelocityY(50);
	} else if (distance > -20 && distance < 20) {
		object2.setVelocityY(0);
	} else {
		object2.setVelocityY(-50);
	}
}

function updateScore(scorer, scene) {
	// Scorer - The player who will gain point.
	if (scorer === player1) {
		score.p1 += 1;
	} else if (scorer === player2) {
		score.p2 += 1;
	}
	sceneSound.play('point');

	let randomNum = Phaser.Math.Between(1, 2);

	ball.setVisible(true);

	if (randomNum === 1) {
		ball.setVelocityX(-100);
	} else {
		ball.setVelocityX(100);
	}
}

function win(player) {
	score.p1 = 0;
	score.p2 = 0;
	started = false;
	logo.setVisible(true);
	startBtn.setVisible(true);

	ball.setVelocity(0, 0);

	let winner = player+ ' Wins!';
	winText.setText(winner);
	winText.x = 320 - (winText.displayWidth/2)
}