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
webValidator.setErrorsReturnedAs('error'); // or 'string', or 'array'

module.exports = function (req, res) {
	async.series([
		validate,
		doWork
	], function(err) {
		if(err) return res.send(500);
		// etc
	})

	function validate(cb) {
		return webValidator.validate([{
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

module.exports = function (req, res) {
	var errors = validate();
	if (errors.length)
		return res.send(401);
	// etc

	function validate() {
		return webValidator.validate([{
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
```javascript
var webValidator = require('web-validator');
webValidator.setErrorsReturnedAs('error'); // or 'string', or 'array'
```
* error - (default) returns a new Error object with a statusCode of 400 and a message containing all errors in a comma-separated string
* array - returns an array of error message strings
* string - returns all errors in a comma-separated string

## License

(The MIT License)

Copyright (c) 2012-2013 Max Nachlinger

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
