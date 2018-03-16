class ScatterPlot {
	constructor(id, boxModel, data) {
		this.boxModel = boxModel;
		this.data = data;
		this.mapX = d3.scaleLinear().domain(data.x.range).range([0, boxModel.contentWidth]);
		this.mapY = d3.scaleLinear().domain(data.y.range).range([boxModel.contentHeight, 0]);		
		this.mapClass = d3.scaleOrdinal(d3.schemeCategory10);
		// Attach svg to element with given id 
		this.svg = d3.select(id).append("svg")
			.attr("width", boxModel.width)
			.attr("height", boxModel.height);
		
		this.g = this.svg.append("g")
			.attr("transform", `translate(${boxModel.contentOriginX}, ${boxModel.contentOriginY})`);
		
		// Draw axes on the svg canvs.
		var g_YAxis = this.g.append("g").attr('class', 'yAxis');
		var yAxis = this.drawYAxis(g_YAxis);

		var g_XAxis = this.g.append("g").attr('class', 'xAxis');
		var xAxis = this.drawXAxis(g_XAxis);

		// Draw Points on canvas.
		var g_Points = this.g.append("g").attr("class", "points");
		this.plot(g_Points);

		// Enable Zoom
		var zoom = d3.zoom()
			.scaleExtent([1, 10])
			.translateExtent([[0, 0], [boxModel.width, boxModel.height]])
    		.on("zoom", () => {
    		  g_Points.attr("transform", d3.event.transform);
			  g_XAxis.call(xAxis.scale(d3.event.transform.rescaleX(this.mapX)));
			  g_YAxis.call(yAxis.scale(d3.event.transform.rescaleY(this.mapY)));
			  console.log(d3.event.transform);

    		});
    	this.svg.call(zoom);
	}

	drawYAxis(g) {
		// Draw axis and tick marks.
		var axis = d3.axisLeft().scale(this.mapY).ticks(5);
		g.attr("class", "yAxis").call(axis);
		
		// Draw Label for the axis.
		g.append("text")
			.text(this.data.y.label)
			.attr("fill", "black")
			//.attr("x", this.boxModel.contentOriginX)
			//.attr("y", this.boxModel.contentHeight / 2)
			.attr("text-anchor", "middle");
		return axis;
	}

	drawXAxis(g) {
		// Draw axis and tick marks
		var axis = d3.axisBottom().scale(this.mapX).ticks(5);
		g.attr("class", "xAxis").call(axis)
			.attr("transform", `translate(0, ${this.boxModel.contentHeight})`);
		
		// Draw Label for the axis.
		g.append("text")
			.text(this.data.x.label)
			.attr("fill", "black")
			//.attr("y", this.boxModel.contentOriginY)
			.attr("x", this.boxModel.contentWidth)
			.attr("text-anchor", "middle");
		return axis;
	}

	plot(g, r=2) {
		this.data.content.map((entry) => {
			var x = entry[this.data.x.label];
			var y = entry[this.data.y.label];
			var cl = entry[this.data.class.label];
			g.append("circle")
				.attr('cx', this.mapX(x))
				.attr('cy', this.mapY(y))
				.attr('fill', this.mapClass(cl))
				.attr('r', r)
				.attr('data-toggle', 'popover')
				.attr('data-trigger', 'focus')
				.attr('tabindex', '0')
				.attr('title', entry[this.data.detail.title_label])
				.attr('data-content', `
					<img src = ${entry[this.data.detail.image_label]} />
					${this.data.detail.other_labels.map((label)=> {
						return '<div>' + entry[label] + '</div>'	
					}).join("")}
				`);
		})
	}
}

function labelRange(data, label) {
	var max = data[0][label];
	var min = max;
	data.forEach((entry) => {
		if(entry[label] > max)
			max = entry[label];
		if(entry[label] < min)
			min = entry[label];
	});

	return [min, max];
}
/*
function randint(start, end) {
	var diff = end - start;
	return Math.floor(Math.random() * diff + start)
}

var content = [];
for(var i = 0 ; i < 1000; i++) {
	content.push(
		{"views" : randint(0, 100), "likes" : randint(0, 50), "category_id": randint(0,10)},
	);
}*/

// enable popover
function EnablePopOver() {
	$(function () {
	  $('[data-toggle="popover"]').popover({
	  	placement: 'auto',
	  	//trigger: 'focus',
	  	html: true
	  })
	})
}

new ScatterPlot(
	"#scatterplot", 
	new BoxModel, 
	{
		x: {
			label: 'likes',
			range: labelRange(usvideo, 'likes')
		},
		y: {
			label: 'comment_count',
			range: labelRange(usvideo, 'comment_count')
		},
		class: {
			label: 'category_id',
		},
		detail: {
			title_label: 'title',
			image_label: 'img_link',
			description_label: 'description',
			other_labels: [
				"channel_title",
				"publish_time" 
			]
		},
		content: usvideo
	}
);

EnablePopOver();
