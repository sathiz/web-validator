"use strict";
var _ = require('underscore');
var async = require('async');

function isNumericArray(value) {
	if (!_.isArray(value)) return false;
	if (!value.length) return false;
	if (_.reject(value, isNumeric).length > 0) return false;
	return true;
}

function validate(validation, cb) {
	var that = this;
	if (!cb)
		return that.processResults(validateSync(validation));

	return validateAsync(validation, function (err, res) {
		return cb(err, that.processResults(res));
	});
}

function validateAsync(validation, cb) {
	if (!_.isArray(validation)) validation = [validation];

	async.map(
		validation,
		processValidationAsync,
		cb
	);
}

function processValidationAsync(validation, cb) {
	async.map(
		_.pairs(validation.validator),
		function (validatorItem, mCb) {
			var key = validatorItem[0];
			var required = validatorItem[1].required;
			var validator = validatorItem[1].validator;

			var itemToValidate = validation.source[key];
			var itemLacksValue = requiredItemMissing(itemToValidate);

			if (required && itemLacksValue)
				return mCb(null, key + ' is required');

			if (itemLacksValue || !validator) return mCb();

			if (!validator(itemToValidate))
				return mCb(null, itemToValidate + ' is not a valid value for ' + key);

			return mCb();

		}, function (err, results) {
			cb(null, _.reject(results || [], function (r) {
				return !r;
			}));
		}
	);
}

function validateSync(validation) {
	if (!_.isArray(validation)) validation = [validation];
	return _.chain(validation)
		.map(processValidationSync)
		.flatten()
		.value();
}

function processValidationSync(validation) {
	return _.chain(_.pairs(validation.validator))
		.map(function (validatorItem) {
			var key = validatorItem[0];
			var required = validatorItem[1].required;
			var validator = validatorItem[1].validator;

			var itemToValidate = validation.source[key];
			var itemLacksValue = requiredItemMissing(itemToValidate);

			if (required && itemLacksValue)
				return key + ' is required';

			if (itemLacksValue || !validator) return mCb();

			if (!validator(itemToValidate))
				return itemToValidate + ' is not a valid value for ' + key;
		})
		.reject(function (r) {
			return !r;
		})
		.value();
}

function requiredItemMissing(value) {
	if (_.isString(value))
		return _.isEmpty(value) || _.isNull(value);
	return !isNumeric(value);
}

function processResults(results, cb) {
	// results is currently an array
	if (this.errorsReturnedAs === 'string')
		results = results.join(', ');

	if (this.errorsReturnedAs === 'error') {
		var error = new Error();
		error.statusCode = 400;
		error.message = results ? results.join(', ') : 'Bad request';
		results = error;
	}

	if (!cb) return results;
	cb(results);
}

function isNumeric(value) {
	return !_.isNaN(parseFloat(value));
}

function isAlphaNumeric(value) {
	return /^\w+$/.test(value);
}

function isAlpha(value) {
	return /^[A-Za-z]+$/.test(value);
}

webValidator.prototype.isNumeric = isNumeric;
webValidator.prototype.isAlphaNumeric = isAlphaNumeric;
webValidator.prototype.isAlpha = isAlpha;
webValidator.prototype.isNumericArray = isNumericArray;
webValidator.prototype.validate = validate;
webValidator.prototype.processResults = processResults;

function webValidator(options) {
	options = options || {};
	var errorsReturnedAs = (options.errorsReturnedAs || 'string').toLowerCase();

	var validReturns = ['string', 'error', 'array'];
	if (validReturns.indexOf(errorsReturnedAs) == -1)
		throw new Error('Error: Unknown return-type "'+errorsReturnedAs+'", expected one of: ' + validReturns.join(', '));

	this.errorsReturnedAs = errorsReturnedAs;
}

module.exports = webValidator;
