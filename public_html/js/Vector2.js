/**
 * Two dimensional vector
 * @param {Number|Vector2} x
 * @param {Number} y If x is vector2, this param is ignored
 */
var Vector2 = function(x,y) {
	if(x instanceof Vector2) {
		this.x = x.x;
		this.y = x.y;
	}
	else {
		this.x = Number(x);
		this.y = Number(y);
	}
};

/**
 * Calculate intersection of two lines formed by four vectors
 * @param {Vector2} vec1Start
 * @param {Vector2} vec1End
 * @param {Vector2} vec2Start
 * @param {Vector2} vec2End
 * @return {Point|Boolean}
 */
Vector2.intersection = function(vec1Start, vec1End, vec2Start, vec2End) {
	var vec1t = (vec2End.x - vec2Start.x) * (vec1Start.y - vec2Start.y) - (vec2End.y - vec2Start.y) * (vec1Start.x - vec2Start.x);
	var vec2t = (vec1End.x - vec1Start.x) * (vec1Start.y - vec2Start.y) - (vec1End.y - vec1Start.y) * (vec1Start.x - vec2Start.x);

	var intersect = (vec2End.y - vec2Start.y) * (vec1End.x - vec1Start.x) - (vec2End.x - vec2Start.x) * (vec1End.y - vec1Start.y);

	//Do the lines intersect?
	if(intersect != 0) {
		var vec1intersect = vec1t / intersect;
		var vec2intersect = vec2t / intersect;

		if(0 <= vec1intersect && vec1intersect <= 1 && 0 <= vec2intersect && vec2intersect <= 1) {	
			return new Point(
				vec1Start.x + vec1intersect * (vec1End.x - vec1Start.x),
				vec1Start.y + vec1intersect * (vec1End.y - vec1Start.y)
			);
		}
	}
	else {
		//Lines are parallel
		return true;
	}

	return false;
};

Vector2.prototype = {
	normalize: function() {
		var len = this.getLength();
		return new Vector2( (this.x / len), (this.y / len) );
	},

	getLength: function() {
		return Math.sqrt( Math.pow(this.x,2) + Math.pow(this.y,2) );
	},

	setLength: function(n) {
		var oldLength = this.getLength();
		if(oldLength != 0)
		{
			return this.scalarMultiply(n/oldLength);
		}
		return this;
	},

	scalarMultiply: function(n) {
		return new Vector2( (this.x * n), (this.y * n) );
	},

	dotProduct: function(v) {
		return (this.x*v.x) + (this.y*v.y);
	},

	crossProduct: function(v) {
		var len = this.getLength();
		var vlen = v.getLength();

		var result = new Vector2(0,0);
		result.x = this.y * vlen - len * v.y;
		result.y = len * v.x - this.x * vlen;
		//result.w=p1.x*p2.y-p1.y*p2.x;
		result.z = this.x * v.y - this.y * v.x;
		return result;
	},

	sum: function(v) {
		return new Vector2( (this.x+v.x), (this.y+v.y) );
	},

	subtract: function(v) {
		return new Vector2( (this.x-v.x), (this.y-v.y) );
	},

	distanceTo: function(v) {
		return this.subtract(v).getLength();
	},

	toString: function() {
		return this.x+','+this.y;
	}
};