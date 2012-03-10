var InternalError = require('../errors').InternalError;
var Chain = require('../handlers/chain');
var MethodMapper = require('./method_mapper');


var Resource = function (path, handlers) {
	if (arguments.length == 1) // got all in one
	{
		handlers = path;
		path = handlers.path;
	}

	this.path = path;

	if (handlers.call != null)
	{
		if (handlers.get != null || handlers.update != null || handlers.del != null)
		{
			throw new InternalError('There must be no other handlers along with "call"');
		}

		this.handlers = {
			call: this.processHandlers(handlers.call)
		};
	}
	else
	{
		this.handlers = {
			get: this.processHandlers(handlers.get),
			update: this.processHandlers(handlers.update),
			del: this.processHandlers(handlers.del)
		};
	}

	this.methodMapper = new MethodMapper();
};

Resource.prototype.processHandlers = function (handlers) {
	if (handlers == null)
	{
		return null;
	}

	var chain = new Chain(this);

	for (var k in handlers)
	{
		chain.add(handlers[k]);
	}

	return chain;
};

Resource.prototype.resolve = function (ctx) {
	var result = null;

	if (this.path == ctx.path || !this.path && !ctx.path)
	{
		var logicalMethod = this.methodMapper.getLogicalMethod(ctx);
		for (var method in this.handlers)
		{
			if (method == logicalMethod)
			{
				result = this.handlers[method];
				break;
			}
		}
	}

	return result;
};

Resource.res = function (path, handlers) {
	if (arguments.length == 1)
	{
		handlers = path;
		path = null;
	}

	return new Resource(path, handlers);
};


module.exports = Resource;