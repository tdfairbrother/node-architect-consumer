test:
	@NODE_ENV=test ./node_modules/.bin/mocha ./test/*.js -R spec

test-coveralls:
	@NODE_ENV=test ./node_modules/.bin/istanbul cover ./node_modules/mocha/bin/_mocha ./test/*.js --report lcovonly -- -R spec

.PHONY: test