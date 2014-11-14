/// atalho log
var l = console.log.bind(console);

var stack = function() {
	var self = this;
	_.extend(self, {
		locked: false,
		stack: [],
		hold: {},
		shcheduled: [],
		data: {},
		onDone: function(){ return false; },
		onErro: function(){ return false; },
		// include event on stack
		// name can determine where event is scheduled
		// ex: /main/something ('something' run after 'main' is included)
		// prefix '^' put 'something' before 'main'
		push: function(name, action, params) {
			action = action || function(){ return true; };
			name = name || String(self.stack.length);
			name = _.chain(name.split('/')).without('').value();
			params = params || {};
			_.extend(params, {
				'action': action,
				'name': name.join('/'),
				'tree': name
			});
			self.stack.push(params);
			return self;
		},
		done: function(done){
			if( typeof done == 'function'){
				self.onDone = done;
			}else{
				return self.onDone(self,done);
			}
			return self;
		},
		erro: function(erro){
			if( typeof erro == 'function'){
				self.onErro = erro;
			}else{
				return self.onErro(self,erro);
			}
			return self;
		},
		// start process stack
		run: function(data) {
			data = data || {};
			_.extend(self, {
				step: -1,
				shcheduled: [],
				hold: {}
			});
			var tree = function(depth,namespace){
				namespace = namespace || "";
				_.chain(self.stack).filter(function(stack){
					return (stack.tree.length-1 === depth && _.first(stack.tree,depth).join('/') ===  namespace);
				}).map(function(stack){
					self.shcheduled.push(stack);
					var next = _.first(stack.tree,depth+1);
					if( next ){
						tree(depth+1,next.join('/'));
					}
				});
			};
			tree(0);
			self.next(data);
			return data;
		},
		// lock de carrier
		lock: function() {
			self.locked = true;
			return self;
		},
		// reset carrier
		reset: function(step) {
			_.extend(self, {
				step: (step || 0) - 1
			});
			return self;
		},
		// execute next event on stack
		next: function(data, step) {
			self.step = step || self.step;
			self.step++;
			l(self.shcheduled.length,self.step);
			var response =  (!self.locked && self.shcheduled[self.step] && self.shcheduled[self.step].action(self, data));
			if (self.shcheduled.length == self.step ) {
				self.onDone(self,data);
				self.reset();
			} else if ( response ) {
				self.next(data);
			}else if( response === false ){
				self.onErro(self,data);
			}
			return self;
		},
		// helpers
		getStakNames: function() {
			return _.pluck(self.stack, 'name');
		},
		getScheduledNames: function() {
			return _.pluck(self.shcheduled, 'name');
		},
	});
};

var eventStackClass = function() {
	var self = this;
	self.list = {};
	return function(name) {
		if (!self.list[name]) {
			self.list[name] = new stack();
			self.list[name].stackName = name;
		}
		return self.list[name];
	};
};

var eventStack = new eventStackClass();