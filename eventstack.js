/// atalho log
var l = console.log.bind(console);

var routes = function() {
	var self = this;
	self.list = {}
	return function(route) {
		if ( !self.list[route] ) {
			self.list[route] = new stack();
		}
		return self.list[route];
	}
}
var routes = new routes;

var stack = function() {
	var self = this;
	self.stoped = false;
	self.sequence = [];
	self.params = {};
	self.step = 0;

	self.push = function(action) {
		self.sequence.push(action);
		return self;
	}
	self.prep = function(action) {
		if (!action) return false;
		self.sequence = [action].concat(self.sequence);
		return self;
	}
	self.stop = function() {
		self.stoped = true;
		return self;
	}
	self.run = function(params,step) {
		self.params = params || self.params;
		self.step = step || self.step;
		if (!self.stoped && self.sequence.length > self.step && self.sequence[self.step](self,self.params)) {
			self.step++;
			self.run();
		}
		return self;
	}
	self.reset = function(){
		self.step = 0;
		self.run();
		return self;
	}
	self.next = function(){
		self.step++;
		self.run();
	}
	return self.step;
}

var s = routes('main');

s.push(function(stk,data){
	l(stk.step,'delay',data);
	setTimeout(function(){
		stk.next();
	},1000);
})

s.push(function(stk,data){
	data.name = data.name.toUpperCase();
	l(stk.step,data);
})

s.prep(function(stk,data){
	l(stk.step);
	return true;
})

routes('main').run({
	name: 'paulo'
});

/*
var stack = function() {
	var self = this;
	self.stoped = false;
	self.sequences = {};

	self.push = function(name, action) {
		if (!action)
			return false;
		var s = self.sequences[name] = self.sequences[name] || [];
		s.push(action);
	}

	self.prep = function(name, action) {
		if (!action)
			return false;
		var s = self.sequences[name] = self.sequences[name] || [];
		self.sequences[name] = [action].concat(s);
	}
	self.stop = function() {
		self.stoped = true;
	}
	self.run = function(name, params, step) {
		params = params || {};
		step = step || 0;
		if (!self.stoped && self.sequences[name] && self.sequences[name].length > step && self.sequences[name][step](self, params)) {
			self.run(name, params, step + 1);
		}
	}
}

var s = new stack;


s.push('main', function(seq, params) {
	console.log('1');
	return true;
})
s.push('main', function(seq, params) {
	console.log('2');
	return true;
})
s.push('main', function(seq, params) {
	console.log('3');
	return true;
})
s.prep('main', function(seq, params) {
	console.log('pre');
	seq.stop();
	s.push('main.reload', function() {
		seq.run('main');
	});
})

s.run('main');
*/