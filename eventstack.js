/// atalho log
var l = console.log.bind(console);

var stack = function() {
	var self = this;
	_.extend(self,{
		locked: false,
		stack: [],
		hold: {},
		shcheduled: [],
		push: function(name,action, params) {
			var sequence = _.chain(name.split('/')).without('')
			var name = sequence.value().join('/');
			var depend =  sequence.initial().value().join('/');
			params = params || {};
			_.extend(params,{
				'action': action,
				'name':name,
				'depend':depend
			})
			self.stack.push(params);
			return self;
		},
		run: function(data) {
			_.extend(self,{
				step:-1,
				shcheduled: [],
				hold: {}
			})
			shcheduled = self.shcheduled;
			var scheduler = function(item){
				self.shcheduled.push(item);
				if(item.name){
					var depends = _.where(self.stack,{ depend : item.name });
					self.shcheduled.concat(depends);
					_.map(depends,function(item){
						scheduler(item);
					});
				}
			}
			_.each(self.stack,function(item){
				if( item.depend == '' ){
					scheduler(item);
				}
			});
			self.next(data);
			return self;
		},
		lock: function(){
			self.locked = true;
		},
		reset: function(step){
			_.extend(self,{
				step:(step || 0)-1
			})
		},
		next: function(data,step){
			self.step = step || self.step;
			self.step++;
			if( !self.locked && shcheduled[self.step] && shcheduled[self.step].action(self,data) ){
				self.next(data);
			}
			if( shcheduled.length == self.step ){
				self.reset()
			}
		}
	});
}


var eventStack = function() {
	var self = this;
	self.list = {}
	return function(name) {
		if (!self.list[name]) {
			self.list[name] = new stack();
		}
		return self.list[name];
	}
}

var eventStack = new eventStack();