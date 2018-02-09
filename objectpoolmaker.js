/**
 * MIT License
 * Copyright (C) 2018, Coin Lam.
 */
let ObjectPoolMaker = {
	_debug : true,
	_maked : [],

	toString() {
		let string = "[ObjectPoolMaker]\n";

		for (let pool of this._maked) {
			string += '\t' + pool.toString() + '\n';
		}

		return string;
	},

	makeMakeDebug(type, pool) {

		return function() {
			let object = null;

			if (0 == pool.length) {
				object      = new type(...arguments);
				object._use = true;
			}
			else {
				object      = pool.pop();
				object._use = true;
				object.init(...arguments);
			}

			++pool._totalmake;
			return object;
		}
	},

	makeMake(type, pool) {

		if (this._debug) {
			return this.makeMakeDebug(type, pool);
		}

		return function() {
			let object = null;

			if (0 == pool.length) {
				object = new type(...arguments);
			}
			else {
				object = pool.pop();
				object.init(...arguments);
			}

			return object;
		}
	},

	makeFreeDebug(type, pool) {

		return function() {
			if (this._use) {
				this._use = false;
				this.term();
				pool.push(this);
				++pool._totalfree;
			}
			else {
				console.log("[ObjectPoolMaker] double free!");
			}
		}
	},

	makeFree(type, pool) {

		if (this._debug) {
			return this.makeFreeDebug(type, pool);
		}

		return function() {
			this.term();
			pool.push(this);
		}
	},

	makeLoss() {
		return function() {
			if (this._totalmake != this._totalfree) {
				return "*";
			}
			return "";
		}
	},

	makeToStringDebug(type) {
		return function() {
			return `[${this.loss()}${type.name}] used:${this.length}, make:${this._totalmake}, free:${this._totalfree}`;
		};
	},

	makeToString(type) {
		if (this._debug) {
			return this.makeToStringDebug(type);
		}

		return function() {
			return `[${this.loss()}${type.name}] used:${this.length}`;
		}
	},

	makePool(type) {
		let pool = [];

		if (this._debug) {
			pool._totalmake     = 0;
			pool._totalfree     = 0;
			type.prototype._use = false;
		}

		pool.make           = ObjectPoolMaker.makeMake(type, pool);
		type.prototype.free = ObjectPoolMaker.makeFree(type, pool);
		pool.loss           = ObjectPoolMaker.makeLoss();
		pool.toString       = ObjectPoolMaker.makeToString(type);

		this._maked.push(pool);
		return pool;
	}
}

