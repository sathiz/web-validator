"use strict";
var _ = require('underscore');
var async = require('async');
var errorsReturnedAs = 'error';

module.exports.isNumericArray = function(value) {
	if (!_.isArray(value)) return false;
	if (!value.length) return false;
	if (_.reject(value, exports.isNumeric).length > 0) return false;
	return true;
};

module.exports.isNumeric = function(value) {
	return !_.isNaN(parseFloat(value));
};

module.exports.isAlphaNumeric = function(value) {
	return /^\w+$/.test(value);
};

module.exports.isAlpha = function(value) {
	return /^[A-Za-z]+$/.test(value);
};

module.exports.setErrorsReturnedAs = function(value) {
	var validReturns = ['string', 'error', 'array'];
	if (validReturns.indexOf(value) == -1)
		throw new Error('Error: Unknown return-type "'+value+'", expected: ' + validReturns.join(', '));
	errorsReturnedAs = value;
};

module.exports.validate = function(validation, cb) {
	if (!cb)
		return processResults(validateSync(validation));

	return validateAsync(validation, function (err, res) {
		return cb(err, processResults(res));
	});
};

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
	return !exports.isNumeric(value);
}

function processResults(results, cb) {
	// results is currently an array
	if (errorsReturnedAs === 'string')
		results = results.join(', ');

	if (errorsReturnedAs === 'error') {
		var error = new Error();
		error.statusCode = 400;
		error.message = results ? results.join(', ') : 'Bad request';
		results = error;
	}

	if (!cb) return results;
	cb(results);
}
