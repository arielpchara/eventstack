/// atalho log
var l = console.log.bind(console);

var stack = function() {
	var self = this;
	_.extend(self,{
		locked: false,
		stack: [],
		hold: {},
		shcheduled: [],
		push: function(name,action,params) {
			name = name || String(self.stack.length);
			var sequence = _.chain(name.split('/')).without('');
			var name = sequence.without('^').value().join('/');
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
			data = data || {};
			_.extend(self,{
				step:-1,
				shcheduled: [],
				hold: {}
			})
			var scheduler = function(item){
				var prepends = _.where(self.stack,{ depend : '^/'+item.name });
				if( prepends.length > 0 ){
					_.map(prepends,function(item){
						scheduler(item);
					});
					self.shcheduled.concat(prepends);
				}
				self.shcheduled.push(item);
				var depends = _.where(self.stack,{ depend : item.name });
				self.shcheduled.concat(depends);
				_.map(depends,function(item){
					scheduler(item);
				});
			}
			_.each(self.stack,function(item){
				if( item.depend == '' ){
					scheduler(item);
				}
			});
			self.next(data);
			return data;
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
			if( self.shcheduled.length == self.step ){
				self.reset()
			}else if( !self.locked && self.shcheduled[self.step] && self.shcheduled[self.step].action(self,data) ){
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
			self.list[name].stackName = name;
		}
		return self.list[name];
	}
}

var eventStack = new eventStack();