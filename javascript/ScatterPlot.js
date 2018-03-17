var colormap = d3.scaleOrdinal(d3.schemeCategory20);
class ScatterPlot {
	constructor(id, boxModel, data, radius, zoomable=true, onClick=null) {
		this.id = id;
		this.boxModel = boxModel;
		this.data = data;
		this.mapX = d3.scaleLinear().domain(data.x.range).range([0+radius, boxModel.contentWidth-radius]);
		this.mapY = d3.scaleLinear().domain(data.y.range).range([boxModel.contentHeight-radius, 0+radius]);		
		this.mapClass = colormap;
		//this.mapClass = d3.scaleOrdinal(["rgb(34, 95,172)", "rgb(248, 159, 50)", "rgb(174, 57,68)"]);
		// Attach svg to element with given id 
		this.svg = d3.select('#' + id).append("svg")
			.attr('class', 'canvas-' + id)
			.attr("width", boxModel.width)
			.attr("height", boxModel.height)
			.style("margin", "1px");
		
		this.g = this.svg.append("g")
			.attr("transform", `translate(${boxModel.contentOriginX}, ${boxModel.contentOriginY})`);
		
		// Draw axes on the svg canvs.
		var g_YAxis = this.g.append("g");
		var yAxis = this.drawYAxis(g_YAxis);

		var g_XAxis = this.g.append("g");
		var xAxis = this.drawXAxis(g_XAxis);

		// Draw Points on canvas.
		var g_Points = this.g
			.append("svg")
			.attr("width", boxModel.contentWidth)
			.attr("height", boxModel.contentHeight)
			.append('g').attr("class", "points")
		
		this.plot(g_Points, radius);

		// Enable Zoom
		if(zoomable){
			var zoom = d3.zoom()
				.scaleExtent([1, 1000])
				.translateExtent([[0, 0], [boxModel.width, boxModel.height]])
				.on("zoom", () => {
				  g_Points.attr("transform", d3.event.transform);
			  g_XAxis.call(xAxis.scale(d3.event.transform.rescaleX(this.mapX)));
			  g_YAxis.call(yAxis.scale(d3.event.transform.rescaleY(this.mapY)));
			  d3.select('#' + id).selectAll('.dots').attr('r', radius/d3.event.transform.k)
			  // console.log(d3.event.transform);
				});
		  this.svg.call(zoom);
  	}

  	// The entire plot useds for selection.
  	if(onClick != null) {
			this.svg.on('click', function(){
					onClick();
					var isSelected = d3.select(this).classed("selected");
					d3.select(this).classed("selected", !isSelected);
			});
		} else {
			EnablePopOver('#' + this.id);
		}
	}

	drawYAxis(g) {
		// Draw axis and tick marks.
		var axis = d3.axisLeft().scale(this.mapY).ticks(this.boxModel.height / 100);
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
		var axis = d3.axisBottom().scale(this.mapX).ticks(this.boxModel.width / 150);
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
		this.data.content.map((group)=> {
			group.map((entry) => {
				var x = entry[this.data.x.label];
				var y = entry[this.data.y.label];
				var cl = entry[this.data.class.label];
				var tStr = entry[this.data.detail.time_label]
				g.append("circle")
					.attr('class', 'dots')
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
						<div>${this.data.detail.time_label + ": " + tStr.slice(0, tStr.indexOf('T'))}</div>
						${this.data.detail.other_labels.map((label)=> {
							return '<div>' + label.replace('_', ' ') + ': ' + entry[label] + '</div>'	
						}).join("")}
					`);
		})})
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

function groupByClass(data, classLabel) {
	var groups = {};
	data.forEach((entry)=> {
		var className = entry[classLabel]
		if(groups[className] == undefined)
			groups[className] = [entry];
		else
			groups[className].push(entry)
	});

	return groups
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
function EnablePopOver(parent = '') {
	$(function () {
	  $(`${parent} [data-toggle="popover"]`).popover({
	  	placement: 'auto',
	  	//trigger: 'click',
	  	html: true
	  })
	})
}

var groups = d3.nest().key(function(d){
	return d['category_id']
}).entries(usvideo);

var selectedGroups = new Set();

// Create a empty scatter plot.
new ScatterPlot(
	"main-interface", 
	new BoxModel([600, 600]), 
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
			time_label: 'publish_time',
			other_labels: [
				"channel_title",
				"comment_count",
				"likes" 
			]
		},
		// Array of groups of points.
		content: []
	},
	4
);

// Create tiny scatter plots for selection.
groups.forEach((group, i)=>{
	new ScatterPlot(
		"class-list", 
		new BoxModel([150, 150]), 
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
				time_label: 'publish_time',
				other_labels: [
					"channel_title",
					"comment_count",
					"likes" 
				]
			},
			// Array of groups of points.
			content: [group.values]
		},
		4,
		false,
		() => {
			if(selectedGroups.has(i))
				selectedGroups.delete(i);
			else
				selectedGroups.add(i);

			d3.select('.canvas-main-interface').remove();
			new ScatterPlot(
				"main-interface", 
				new BoxModel([600, 600]), 
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
						time_label: 'publish_time',
						other_labels: [
							"channel_title",
							"comment_count",
							"likes" 
						]
					},
					// Array of groups of points.
					content: [...selectedGroups].map((gIndex)=> {
						return groups[gIndex].values;
					})
					//[groups[0].values, groups[1].values]
				},
				4
			);
		}
	);

});
