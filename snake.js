/**
 *
 * @source: https://github.com/alexluecke/snake-js
 *
 */

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
			'canvas': '#282828',
			'snake': '#eeeeee',
			'fruit': '#ff4444',
		},
		key: {
			LEFT: '37',
			UP: '38',
			RIGHT: '39',
			DOWN: '40',
			SPACE: '32',
		},
	}
})(Snake);

(function(core) {

	var self = core;

	self.dir = 'right';
	self.score = 0;
	self.context = {};
	self.keys = [],

	self.objs = {
		'food': null,
		'canvas': null,
		'snake': [],
	}

	// Just using this as an alias of sorts
	self.speed_up = function() {
		self.timer.decrease_interval()
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
		self.timer.set_timee(function() {
			if (self.paused)
				return;
			self.update_objects();
			self.env.render();
		});
		self.timer.start();
	}

	self.reset = function() {
		self.score = 0;
		self.dir = 'right';
		self.timer.reset();
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
		if (key == self.options.key.LEFT && self.dir != 'right') {
			self.dir = 'left';
			self.update_objects();
			self.env.render();
		} else if (key == self.options.key.UP && self.dir != 'down') {
			self.dir = 'up';
			self.update_objects();
			self.env.render();
		} else if (key == self.options.key.RIGHT && self.dir != 'left') {
			self.dir = 'right';
			self.update_objects();
			self.env.render();
		} else if (key == self.options.key.DOWN && self.dir != 'up') {
			self.dir = 'down';
			self.update_objects();
			self.env.render();
		} else if (key == self.options.key.SPACE) {
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
			self.timer.restart();
			return;
		}

		// If the snake eats a food, it grows.
		self.objs.snake.unshift({ x: nx, y: ny });
		if (nx == self.objs.food.x && ny == self.objs.food.y) {
			self.create_food();
			self.speed_up();
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

	this.paused = false;
	this.loop = null;

	this.options = {
		'interval': 100,
		'default': 100,
		'delta': 5,
		'min': 20,
		'func': null,
	}

	this.set_timee = function(f) {
		self.options.func = f;
	}

	this.start = function()  {
		self.stop();
		if (typeof self.options.func === "function")
			self.loop = setInterval(self.options.func, self.options.interval);
		else
			throw("NoTimeeFunctionSet");
	}

	this.restart = function(value) {
		self.stop();
		self.start();
	}

	this.stop = function() {
		if (typeof self.loop != "undefined")
			clearInterval(self.loop);
	}

	this.reset = function() {
		self.options.interval = self.options.default;
	}

	this.is_paused = function() {
		return this.paused;
	}

	this.decrease_interval = function() {
		var t = self.options.interval;
		self.options.interval = (t <= self.options.min) ? t : t-self.options.delta;
		self.restart();
	}

	this.toggle_pause = function() {
		if (self.is_paused()) {
			self.paused = false;
			self.start();
		} else {
			self.paused = true;
			self.stop();
		}
	}

	return {
		'set_timee': this.set_timee,
		'start': this.start,
		'restart': this.restart,
		'stop': this.stop,
		'reset': this.reset,
		'is_paused': this.is_paused,
		'decrease_interval': this.decrease_interval,
		'toggle_pause': this.toggle_pause
	}

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

