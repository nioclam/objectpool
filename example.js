class TestA {
	constructor() {
	}

	init() {
	}

	term() {
	}
};

let pool = ObjectPoolMaker.makePool(TestA),
	size = 10000000,
	test = pool.make();

function elapsedInPool(size) {
	let s = Date.now();
	for (let i = 0; i < size; ++i) {
		let x = pool.make();
		x.free();
	}
	let e = Date.now();

	return e - s;
}

test.free();
console.log(`Create in Pool: ${elapsedInPool(size)}`);
console.log(`${ObjectPoolMaker}`);

