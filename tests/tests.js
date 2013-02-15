var util = require('util');
var _ = require('underscore');
var test = require('tap').test;
var webValidator = require('..');
validator = new webValidator();

test('isNumeric works', function (t) {
	t.notOk(validator.isNumeric(''), "an empty string is not numeric");
	t.ok(validator.isNumeric('123'), "a numeric string is numeric");
	t.ok(validator.isNumeric(123), "a number is numeric");
	t.notOk(validator.isNumeric('a123'), "a string with a letter and numbers is not numeric");
	t.notOk(validator.isNumeric('abc'), "a string with letters is not numeric");
	t.notOk(validator.isNumeric('!@#$'), "a string with all special characters is not numeric");
	t.end();
});

test('isNumericBool works', function (t) {
	t.notOk(validator.isNumericBool(''), "an empty string is not bool");
	t.notOk(validator.isNumericBool('123'), "a numeric string is not bool");
	t.notOk(validator.isNumericBool(123), "bunch of number is not bool");
	t.notOk(validator.isNumericBool('a123'), "a string with a letter and numbers is not bool");
	t.notOk(validator.isNumericBool('abc'), "a string with letters is not bool");
	t.notOk(validator.isNumericBool('!@#$'), "a string with all special characters is not bool");
	t.ok(validator.isNumericBool(0), "0 is a bool for false");
	t.ok(validator.isNumericBool(1), "1 is a bool for true");
	t.ok(validator.isNumericBool('1'), "1 string is a bool for true");
	t.ok(validator.isNumericBool('0'), "0 string is a bool for false");
	t.end();
});


test('isAlphaNumeric works', function (t) {
	t.notOk(validator.isAlphaNumeric(''), "an empty string is not alpha-numeric");
	t.ok(validator.isAlphaNumeric('123'), "a numeric string is alpha-numeric");
	t.ok(validator.isAlphaNumeric(123), "a number is alpha-numeric");
	t.ok(validator.isAlphaNumeric('a123'), "a string with a letter and numbers is alpha-numeric");
	t.ok(validator.isAlphaNumeric('abc'), "a string with letters is alpha-numeric");
	t.notOk(validator.isAlphaNumeric('!@#$'), "a string with all special characters is not alpha-numeric");
	t.end();
});

test('isAlpha works', function (t) {
	t.notOk(validator.isAlpha(''), "an empty string is not alpha");
	t.notOk(validator.isAlpha('123'), "a numeric string is not alpha");
	t.notOk(validator.isAlpha(123), "a number is not alpha");
	t.notOk(validator.isAlpha('a123'), "a string with a letter and numbers is not alpha");
	t.ok(validator.isAlpha('abc'), "a string with letters is alpha");
	t.notOk(validator.isAlphaNumeric('!@#$'), "a string with all special characters is not alpha");
	t.end();
});

test('isNumericArray works', function (t) {
	t.notOk(validator.isNumericArray([]), "an empty array is not a numeric array");
	t.notOk(validator.isNumericArray('123'), "a numeric string is not a numeric array");
	t.notOk(validator.isNumericArray(123), "a number is not a numeric array");
	t.ok(validator.isNumericArray([1,2,3]), "an array of numbers is considered a numeric array (a truly shocking tautology!)");
	t.ok(validator.isNumericArray(['1','2','3']), "an array of numeric strings is considered a numeric array");
	t.end();
});

test('validate works as expected', function (t) {
	var validation = {
		source: {key0:'test', key1:null, key2:'test2', key3:'test3' },
		validator: {
			key0:{required:true, validator: function(value) { return false; }},
			key1:{required:true, validator: function(value) { return true; }},
			key2:{required:false, validator: function(value) { return false; }}
		}
	};

	t.test('validate sync works as expected', function(t) {
		var res = validator.validate(validation);
		t.ok(res.indexOf('test is not a valid value for key0') !== -1, "Invokes key validation function");
		t.ok(res.indexOf('key1 is required') !== -1, "Honors required flag");
		t.ok(res.indexOf('test2 is not a valid value for key2') !== -1, "Fails on optional values which still fail the validation function");
		t.end();
	});

	t.test('validate async works as expected', function(t) {
		validator.validate(validation, function(err,res) {
			t.ok(res.indexOf('test is not a valid value for key0') !== -1, "Invokes key validation function");
			t.ok(res.indexOf('key1 is required') !== -1, "Honors required flag");
			t.ok(res.indexOf('test2 is not a valid value for key2') !== -1, "Fails on optional values which still fail the validation function");
			t.end();
		});
	});

	t.test('validate returns an array of errors when asked to do so', function(t) {
		var validator2 = new webValidator({errorsReturnedAs: 'array'});
		var res = validator2.validate(validation);
		t.ok(_.isArray(res), "Returns an array of errors");
		t.end();
	});

	t.test('validate returns an error string when asked to do so', function(t) {
		var validator2 = new webValidator({errorsReturnedAs: 'string'});
		var res = validator2.validate(validation);
		t.ok(_.isString(res), "Returns an error string");
		t.end();
	});

	t.test('validate returns an error object when asked to do so', function(t) {
		var validator2 = new webValidator({errorsReturnedAs: 'error'});
		var res = validator2.validate(validation);
		t.ok(util.isError(res), "Returns an error object");
		t.end();
	});

	t.test('throws a somewhat helpful exception on a bad return-type', function(t) {
		var error;
		try {
			new webValidator({errorsReturnedAs: 'fun'});
		}
		catch (e) {
			error = e;
		}
		finally {
			t.ok(error, 'Throws exception');
			t.end();
		}
	});
});
