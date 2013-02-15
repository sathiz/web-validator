#web-validator

Helps with validating things.

## Installation:
```
npm install web-validator
```

## Usage:

### Async version
```javascript
var async = require('async');
var webValidator = require('web-validator');
var validator = new webValidator({errorsReturnedAs: 'error'});

module.exports = function (req, res) {
	async.series([
		validate,
		doWork
	], function(err) {
		if(err) return res.send(500);
		// etc
	})

	function validate(cb) {
		return validator.validate([{
			source: req.params,
			validator: {
				id: { required:true, validator: validator.isNumeric } // built in method
				// more keys from req.params here
			}
		},{
			source: req.body,
			validator: {
				// you can make your own validation functions too
				colour: { required:true, validator: function(value) {
					return ['blue','red','yellow'].indexOf(value.toLowerCase())) !== -1;
				}},
				name: { required:true, validator: validator.isAlpha }
			}
		}], cb);
	}

	function doWork() { ... }
};
```

### Sync version
```javascript
var webValidator = require('web-validator');
var validator = new webValidator();

module.exports = function (req, res) {
	var errors = validate();
	if (errors.length)
		return res.send(401);
	// etc

	function validate() {
		return validator.validate([{
			source: req.params,
			validator: {
				id: { required:true, validator: validator.isNumeric } // built in method
				// more keys from req.params here
			}
		},{
			source: req.body,
			validator: {
				// you can make your own validation functions too
				colour: { required:true, validator: function(value) {
					return ['blue','red','yellow'].indexOf(value.toLowerCase())) !== -1;
				}},
				name: { required:true, validator: validator.isAlpha }
			}
		}]);
	}
};
```

### Error return-types
* array - (default) returns an array of error message strings
* string - returns all errors in a comma-separated string
* error - returns a new Error object with a statusCode of 400 and a message containing all errors in a comma-separated string

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2012-2013 Max Nachlinger
