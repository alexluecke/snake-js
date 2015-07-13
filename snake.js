var Snake = Snake || {};

Snake.options = (function(core) {
	return {
		size: 10,
		slen: 5,
		font: {
			'regular': 'normal 12px monospace',
			'large': 'normal 24px monospace'
		},
		colors: {
			'canvas': '#444444',
			'snake': '#eeeeee',
			'fruit': '#ff4444',
		},
	}
})(Snake);

(function(core) {

	var self = core;

	self.dir = 'right';
	self.score = 0;
	self.context = {};

	self.key = {
		LEFT: '37',
		UP: '38',
		RIGHT: '39',
		DOWN: '40',
		SPACE: '32',
	}

	self.keys = [],

	self.objs = {
		'food': null,
		'canvas': null,
		'snake': [],
	}

	self.init = function(args) {
		self.make_canvas();
		self.context = self.objs.canvas.getContext("2d");
		self.context.font = self.options.font.regular;
		self.w = self.objs.canvas.width || window.innerWidth;
		self.h = self.objs.canvas.height || window.innerHeight;
		$.extend(true, self.options, args);
		self.setup_key_events();
		self.reset();
	}

	self.run = function() {
		self.timer.clear();
		self.timer.start(function() {
			if (self.paused)
				return;
			self.update_objects();
			self.env.render();
		});
	}

	self.reset = function() {
		self.score = 0;
		self.dir = 'right';
		self.timer.clear();
		self.timer.interval = self.timer.default;
		self.create_snake();
		self.create_food();
	}

	self.make_canvas = function() {
		$('body').text('');
		var el = document.createElement('canvas');
		el.setAttribute('id', 'canvas');
		el.setAttribute('width', '512');
		el.setAttribute('height', '288');
		document.body.appendChild(el);
		self.objs.canvas = $('#canvas')[0];
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
			self.timer.toggle_pause();
		}
	}

	self.create_food = function() {
		var sz = self.options.size;
		self.objs.food = {
			x: Math.round(Math.random()*(self.w-sz)/sz),
			y: Math.round(Math.random()*(self.h-sz)/sz),
		};
	}

	self.create_snake = function() {
		// Each snake part has an x,y coordinate
		self.objs.snake = [];
		for (var i=self.options.slen-1; i >= 0; i--) {
			self.objs.snake.push({x: i, y: 2});
		}
	}

	self.update_objects = function() {

		var head = self.objs.snake[0];
		var nx = head.x
			, ny = head.y;

		// Increment the head position
		if (self.dir === 'up') ny--;
		else if (self.dir === 'right') nx++;
		else if (self.dir === 'down') ny++;
		else if (self.dir === 'left') nx--;

		// If snake body is off the canvas, restart.
		if (nx < 0 || nx >= self.w/self.options.size
				|| ny < 0 || ny >= self.h/self.options.size
				|| self.env.check_collision(nx, ny, self.objs.snake)) {
			self.reset();
			self.run();
			return;
		}

		// If the snake eats a food, it grows.
		self.objs.snake.unshift({ x: nx, y: ny });
		if (nx == self.objs.food.x && ny == self.objs.food.y) {
			var t = self.timer.interval;
			self.create_food();
			self.timer.interval = (t <= 20) ? t : t-self.timer.speed_up;
			self.timer.restart();
			self.score++;
		} else {
			self.objs.snake.pop();
		}

		// TODO: Change this to only render changed cells rather than reflowing the
		// entire canvas. I don't quite know how I want to do this yet so I am
		// deferring for now.
		self.env.render();
	}

})(Snake);

var Snake = Snake || {};
Snake.env = (function(core) {

	var self = this;

	this.check_collision = function(x, y, arr) {
		for (var i = 0; i < arr.length; i++) {
			if (arr[i].x == x && arr[i].y == y)
				return true;
		}
		return false;
	}

	this.render = function() {
		var sz = core.options.size;
		core.context.fillStyle = core.options.colors.canvas;
		core.context.fillRect(0, 0, core.w, core.h);
		core.context.strokeStyle = "black";
		core.context.strokeRect(0, 0, core.w, core.h);

		// Draw the snake and food
		self.draw_snake();
		self.draw_square(core.objs.food.x, core.objs.food.y, '#ff4444');

		// Show the score
		core.context.fillStyle = core.options.colors.text;
		core.context.fillText(core.score, sz/2, sz);
	}

	this.draw_snake = function() {
		var len = core.objs.snake.length
			, s = core.objs.snake;
		for (var i=0; i <  len; i++) {
			self.draw_square(s[i].x, s[i].y, core.options.colors.snake);
		}
	}

	this.draw_circle = function(x, y, radius, color) {
		core.context.beginPath();
		core.context.arc(x, y, radius, 0, 2*Math.PI);
		core.context.fill();
	}

	this.draw_square = function(x, y, color) {
		var sz = core.options.size;
		core.context.fillStyle = color;
		core.context.fillRect(x*sz, y*sz, sz, sz);
	}

	return this;

})(Snake);

Snake = Snake || {}
Snake.timer = (function(core) {

	var self = this;

	self.interval = 100;
	self.default = 100;
	self.speed_up = 5;
	self.paused = false;
	self.loop = null;

	self.start = function(f)  {
		if (typeof f === "function")
			self.loop = setInterval(f, self.interval);
		else
			throw("ExpectedTimerFunction");
	}

	self.restart = function(value) {
		self.clear();
		core.run();
	}

	self.clear = function() {
		if (typeof self.loop != "undefined")
			clearInterval(self.loop);
	}

	self.toggle_pause = function() {
		if (self.paused === true) {
			self.paused = false;
			self.run();
		} else {
			core.context.fillStyle = core.options.colors.text;
			core.context.font = core.options.font.large;
			core.context.fillStyle = 'white';
			core.context.fillText('Paused', core.w/2-3*20, core.h/2);
			core.context.font = core.options.font.regular;
			core.paused = true;
			core.timer.clear();
		}
	}

	return this;

})(Snake);

$(document).ready(function(){
	$('#StartSnake').on('click', function() {
		Snake.init();
		var style_str = 'height: 100%; width: 100%; padding: 0; margin: 0;';
		$('body').attr('style', style_str);
		$('html').attr('style', style_str);
		$(this).remove();
		Snake.run();
	});
})
