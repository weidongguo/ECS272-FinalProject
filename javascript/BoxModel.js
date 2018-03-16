class BoxModel {
	constructor(
		dimension = [500, 500],
		margin = [25, 25, 80, 25], 
		border = [0, 0, 0, 0] , 
		padding = [0, 0, 0, 0]
	) {
		[this.width, this.height] = dimension;
		var [mTop, mBottom, mLeft, mRight] = margin;
		var [bTop, bBottom, bLeft, bRight] = border;
		var [pTop, pBottom, pLeft, pRight] = padding;
		this.contentWidth =  this.width - mLeft - mRight - bLeft - bRight - pLeft - pRight;
		this.contentHeight = this.height - mTop - mBottom - bTop - bBottom - pTop - pBottom;
		this.contentDimension = [this.contentWidth, this.contentHeight];
		this.contentOriginX =  mLeft + bLeft + pLeft;
		this.contentOriginY =  mTop + bTop + pTop;
	}
}