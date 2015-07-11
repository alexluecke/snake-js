
var Snake = function() {

	var self = this;
	self.dir = 'right';
	self.score = 0;
	self.loop = null;
	self.paused = false;

	self.keys = [],
	self.key = {
		LEFT: '37',
		UP: '38',
		RIGHT: '39',
		DOWN: '40',
		SPACE: '32',
	};

	self.objs = {
		food: null,
		snake: [],
		canvas: $("#canvas")[0],
	};

	self.parms = {
		font: {
			regular: 'normal 12px monospace',
			large: 'normal 24px monospace'
		},
		size: 10,
		slen: 5,
		scolor: '#eeeeee',
		ccolor: '#444444',
		tcolor: '#ffffff',
		time: {
			interval: 100,
			default: 100,
			speed_up: 5,
		}
	}

	self.context = self.objs.canvas.getContext("2d");
	self.context.font = self.parms.font.regular;
	self.w = self.objs.canvas.width || window.innerWidth;
	self.h = self.objs.canvas.height || window.innerHeight;

	self.init = function() {
		self.setup_key_events();
		self.reset();
		self.run();
	}

	self.run = function() {
		self.clear_timer();
		self.loop = setInterval(function() {
			self.update_objects();
			self.env.render();
		}, self.parms.time.interval);
	}

	self.reset = function() {
		self.clear_timer();
		self.score = 0;
		self.dir = 'right';
		self.parms.time.interval = self.parms.time.default;
		self.create_snake();
		self.create_food();
	}

	self.setup_key_events = function() {
		window.addEventListener('keydown', function(e) {
			self.keys[e.keyCode] = true;
			self.check_keys(e);
		}, false);
		window.addEventListener('keyup', function(e) {
			self.keys[e.keyCode] = false;
		}, false);
	}

	self.check_keys = function(e) {
		var key = e.keyCode;
		if (key == self.key.LEFT && self.dir != 'right') {
			self.dir = 'left';
			self.update_objects();
			self.env.render();
		} else if (key == self.key.UP && self.dir != 'down') {
			self.dir = 'up';
			self.update_objects();
			self.env.render();
		} else if (key == self.key.RIGHT && self.dir != 'left') {
			self.dir = 'right';
			self.update_objects();
			self.env.render();
		} else if (key == self.key.DOWN && self.dir != 'up') {
			self.dir = 'down';
			self.update_objects();
			self.env.render();
		} else if (key == self.key.SPACE) {
			self.toggle_pause();
		}
	}

	self.create_food = function() {
		var sz = self.parms.size;
		self.objs.food = {
			x: Math.round(Math.random()*(self.w-sz)/sz),
			y: Math.round(Math.random()*(self.h-sz)/sz),
		};
	}

	self.create_snake = function() {
		// Each snake part has an x,y coordinate
		self.objs.snake = [];
		for (var i=self.parms.slen-1; i >= 0; i--) {
			self.objs.snake.push({x: i, y: 2});
		}
	}

	self.update_timer = function() {
		self.clear_timer();
		self.run();
	}

	self.clear_timer = function() {
		if (typeof self.loop != "undefined")
			clearInterval(self.loop);
	}

	self.toggle_pause = function() {
		if (self.paused === true) {
			self.paused = false;
			self.run();
		} else {
			self.context.fillStyle = self.parms.tcolor;
			self.context.font = self.parms.font.large;
			self.context.fillStyle = 'white';
			self.context.fillText('Paused', self.w/2-3*20, self.h/2);
			self.context.font = self.parms.font.regular;
			self.paused = true;
			self.clear_timer();
		}
	}

	self.update_objects = function() {

		if (self.paused)
			return;

		var head = self.objs.snake[0];
		var nx = head.x
			, ny = head.y;

		// Increment the head position
		if (self.dir === 'up') ny--;
		else if (self.dir === 'right') nx++;
		else if (self.dir === 'down') ny++;
		else if (self.dir === 'left') nx--;

		// If snake body is off the canvas, restart.
		if (nx < 0 || nx >= self.w/self.parms.size
				|| ny < 0 || ny >= self.h/self.parms.size
				|| self.env.check_collision(nx, ny, self.objs.snake)) {
			self.reset();
			self.run();
			return;
		}

		// If the snake eats a food, it grows.
		self.objs.snake.unshift({ x: nx, y: ny });
		if (nx == self.objs.food.x && ny == self.objs.food.y) {
			var t = self.parms.time.interval;
			self.create_food();
			self.parms.time.interval = (t <= 20) ? t : t-self.parms.time.speed_up;
			self.update_timer();
			self.score++;
		} else {
			self.objs.snake.pop();
		}

		// TODO: Change this to only render changed cells rather than reflowing the
		// entire canvas. I don't quite know how I want to do this yet so I am
		// defering for now.
		self.env.render();
	}

	self.env = {

		check_collision: function(x, y, arr) {
			for (var i = 0; i < arr.length; i++) {
				if (arr[i].x == x && arr[i].y == y)
					return true;
			}
			return false;
		},

		render: function() {
			var sz = self.parms.size;
			self.context.fillStyle = self.parms.ccolor;
			self.context.fillRect(0, 0, self.w, self.h);
			self.context.strokeStyle = "black";
			self.context.strokeRect(0, 0, self.w, self.h);

			// Draw the snake and food
			self.env.draw_snake();
			self.env.draw_square(self.objs.food.x, self.objs.food.y, '#ff4444');

			// Show the score
			self.context.fillStyle = self.parms.tcolor;
			self.context.fillText(self.score, sz/2, sz);
		},

		draw_snake: function() {
			var len = self.objs.snake.length
				, s = self.objs.snake;
			for (var i=0; i <  len; i++) {
				self.env.draw_square(s[i].x, s[i].y, self.parms.scolor);
			}
		},

		draw_circle: function(x, y, radius, color) {
			self.context.beginPath();
			self.context.arc(x, y, radius, 0, 2*Math.PI);
			self.context.fill();
		},

		draw_square: function(x, y, color) {
			var sz = self.parms.size;
			self.context.fillStyle = color;
			self.context.fillRect(x*sz, y*sz, sz, sz);
		},

		draw_barriers: function() {
		}

	}

	return { init: self.init, start: self.run }

};

$(document).ready(function(){
	var g = new Snake();
	g.init();
})
