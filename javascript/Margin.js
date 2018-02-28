class Margin {
	constructor(top, bottom, left, right) {
		this.top = top;
		this.bottom = bottom;
		this.left = left;
		this.right = right;
	}

	getAdjustedDimension(width, height) {
		return [width - this.left - this.right, height - this.top - this.bottom];
	}

	getAdjustedTopLeft() {
		return [this.left, this.top];
	}
}