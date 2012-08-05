
SRC = lib/keys.js \
	  lib/stores/memory.js \
	  lib/stores/nstore.js \
	  lib/stores/redis.js

TESTS = test/*.test.js

index.html: $(SRC)
	dox $(SRC) \
		--title "Keys" \
		--desc "Unified interface for [node](http://nodejs.org) key/value stores." \
		--ribbon "http://github.com/visionmedia/keys" \
		> index.html

test:
	@./support/expresso/bin/expresso $(TEST_FLAGS) \
		--serial \
		-I lib \
		-I support/nstore/lib \
		-I support/microdb/lib \
		-I support/redis/lib \
		$(TESTS)

test-cov:
	@$(MAKE) TEST_FLAGS=--cov

.PHONY: test test-cov