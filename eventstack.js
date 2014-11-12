/// atalho log
var l = console.log.bind(console);

var stack = function() {
	var self = this;

	_.extend(self,{
		stoped: false,
		stack: [],
		hold: {},
		shcheduled: [],
		push: function(action, params) {
			params = params || {};
			_.extend(params,{
				'action': action
			})
			self.stack.push(params);
			return self;
		},
		run: function(data) {
			self.step = -1;
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
				if( !item.depend ){
					scheduler(item);
				}
			});
			self.next(data);
			return self;
		},
		next: function(data){
			self.step++;
			if( shcheduled[self.step] && shcheduled[self.step].action(self,data) ){
				self.next(data);
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