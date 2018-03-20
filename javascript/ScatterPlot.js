var colormap = d3.scaleOrdinal(d3.schemeCategory20);

function getTransformMatrixByElement(ele) {
	/*var style = window.getComputedStyle(ele);
	return new WebKitCSSMatrix(style.transform)*/
	var consolidate = ele.transform.baseVal.consolidate();
	if(consolidate != null)
		return ele.transform.baseVal.consolidate().matrix;
	else
		return {a: 1, b: 0, c: 0, d: 1, e: 0, f: 0};
}

function applyTransformMatrix(m, p) {
	// p.x, p.y
	var [x, y] = p;
	return [
		m.a * x + m.c * y + m.e,
		m.b * x + m.d * y + m.f
	]
}

// =================================================================
// Borrowed from a D3 extension: https://github.com/wbkd/d3-extended
// Didn't find myself using the entire extensions but only two of its functions
// So, paste them here.

// handy function to make a SVG element becoming the last child of its parent. Hence, bring it to the top of the view.
d3.selection.prototype.moveToFront = function() {  
  return this.each(function(){
    this.parentNode.appendChild(this); // no need to remove the child from its parent if the child is an existing node. It will jsut be moved to the end.
  });
};

// Borrowed from https://github.com/wbkd/d3-extended
// handy function to move a SVG element to be the first child of its parent. Hence bring it to the bottom of the view.
d3.selection.prototype.moveToBack = function() {  
    return this.each(function() { 
        var firstChild = this.parentNode.firstChild; 
        if (firstChild) { 
            this.parentNode.insertBefore(this, firstChild); 
        } 
    });
};
// ==================================================================

class ScatterPlot {
	constructor(id, boxModel, data, radius, zoomable=true, brushable=true, onClick=null) {
		this.id = id;
		this.boxModel = boxModel;
		this.data = data;
		this.mapX = d3.scaleLinear().domain(data.x.range).range([0+radius, boxModel.contentWidth-radius]);
		this.mapY = d3.scaleLinear().domain(data.y.range).range([boxModel.contentHeight-radius, 0+radius]);		
		this.mapClass = colormap;
		//this.mapClass = d3.scaleOrdinal(["rgb(34, 95,172)", "rgb(248, 159, 50)", "rgb(174, 57,68)"]);
		
		// Find the element to attach the plot.
		var view = d3.select('#' + id);

		// Generate a id for the new svg.
		var svgid = id + (view.node().childElementCount + 1);

		// Attach svg to element with given id 
		this.svg = view.append("svg")
			.attr('class', 'canvas-' + id)
			.attr('id', svgid)
			.attr("width", boxModel.width)
			.attr("height", boxModel.height)
			.style("margin", "1px");
		
		this.g = this.svg.append("g")
			.attr("transform", `translate(${boxModel.contentOriginX}, ${boxModel.contentOriginY})`);
		
		// Draw title
		var g_Title = this.svg.append("g")
			.attr("transform", `translate(${boxModel.width / 2}, ${boxModel.contentOriginY / 2})`);
		this.drawLabel(g_Title, data.name);

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
				  d3.select('#' + svgid).selectAll('.dots').attr('r', radius/d3.event.transform.k)
				  // console.log(d3.event.transform);
				});
		  this.svg.call(zoom);
  	}

  	if(brushable){
  		var brush = d3.brush()
  			.extent([[0, 0], [boxModel.contentWidth, boxModel.contentHeight]])
  			.on("brush", function() {
  				var brushingRegion = this;
  				var [[xMin, yMin], [xMax, yMax]] = d3.event.selection;
  				g_Points.selectAll('.dots')
  					.style("mix-blend-mode", function() {
  						// Need to apply transformation on the coord of the selected circle
  						// because there's a transformation of its container, namely 'g'. 
  						// O.w. the brushing will not select he correct points.
  						var matrix = getTransformMatrixByElement(g_Points.node());
  						var cir = d3.select(this);
  						var [cx, cy] = applyTransformMatrix(matrix, [parseFloat(cir.attr('cx')), parseFloat(cir.attr('cy'))]);
  						if(xMin <= cx && cx <= xMax && yMin <= cy && cy <= yMax) {
  							return ScatterPlot.mixBlendMode;
  						} else {
  							return 'normal';
  						}
  					});

  				console.log("brush");
  			}).on("end", ()=> {
  				if(!d3.event.selection) {
  					console.log("end");
  					g_Points.selectAll(".dots")
  						.classed("brushed", false);
  				}
  				
  			});
  		this.g.append("g")
  			.attr("id", "brushing-region")
  			.call(brush).moveToBack();

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

	drawLabel(g, label) {
		g.append('text')
			.attr("text-anchor", 'middle')
			.attr("font-size", '14px')
			.attr("font-weight", 'bold')
			.text(label);
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
		this.data.content.map((group, i)=> {
			group.map((entry, j) => {
				var x = entry[this.data.x.label];
				var y = entry[this.data.y.label];
				var cl = entry[this.data.class.label];
				var tStr = entry[this.data.detail.time_label]
				var mediaHTML = '';

				var image_url = entry[this.data.detail.image_label];
				if(image_url != null)
					mediaHTML = `<img src = ${image_url} />`

				var video_id = entry[this.data.detail.video_id_label]
				if(video_id != null)
					mediaHTML = `<iframe width='100%', hight='100%' src="https://www.youtube.com/embed/${video_id}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
				
				var titleStr = entry[this.data.detail.title_label] + `</span><span class="close" onclick='ScatterPlot.hidePopover.call(this)'>&times;</span>`

				var description = entry[this.data.detail.description_label];
				var descriptionHTML = '';
				if(description != null)
					descriptionHTML = 'description: <br>' + description;

				g.append("circle")
					.attr('id', `cir-${i}-${j}`)
					.attr('class', 'dots')
					.attr('cx', this.mapX(x))
					.attr('cy', this.mapY(y))
					.attr('fill', this.mapClass(cl))
					.attr('r', r)
					.attr('data-toggle', 'popover')
					//.attr('data-trigger', 'focus')
					//.attr('tabindex', '0')
					.attr('title', titleStr)
					.attr('data-content', `
						${mediaHTML}
						<div>${this.data.detail.time_label + ": " + tStr.slice(0, tStr.indexOf('T'))}</div>
						${this.data.detail.other_labels.map((label)=> {
							return '<div>' + label.replace('_', ' ') + ': ' + entry[label] + '</div>'	
						}).join("")}
						<p>${descriptionHTML}</p>
					`);
		})})
	}

	static colorBlending(mode) {
		ScatterPlot.mixBlendMode = mode;
	}

	static hidePopover() {
		// Remove popove rmanually.
		$(this.parentElement.parentElement).trigger('hide.bs.popover');
		d3.select(this.parentElement.parentElement).remove()
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

// enable popover
function EnablePopOver(parent = '') {
	$(function () {
	  $(`${parent} [data-toggle="popover"]`).popover({
	  	placement: 'auto',
	  	trigger: 'click',
	  	html: true
	  })
	})
}


function main(content, content_metadata, category, sampled_indices = null) {
	d3.select('#class-list').selectAll("*").remove();
	d3.select('#main-interface').selectAll("*").remove();

	var data_content = content;
	if(sampled_indices != null) {
		data_content = sampled_indices.map(function(i){
			return content[i];
		});
	}
	

	var data_category = category;

	var r = 2;

	var groups = d3.nest().key(function(d){
		return d[content_metadata.class.label]
	}).sortKeys(d3.ascending).entries(data_content);

	var selectedGroups = new Set();

	var param = {
		x: {
			label: content_metadata.x.label,
			range: labelRange(content, content_metadata.x.label)
		},
		y: {
			label: content_metadata.y.label,
			range: labelRange(content, content_metadata.y.label)
		},
		class: {
			label: content_metadata.class.label,
		},
		detail: {
			title_label: content_metadata.detail.title_label,
			image_label: content_metadata.detail.image_label,
			video_id_label: content_metadata.detail.video_id_label,
			description_label: content_metadata.detail.description_label,
			time_label: content_metadata.detail.time_label,
			other_labels: content_metadata.detail.other_labels
		},
		// Array of groups of points.
		content: []
	};

	// Create a empty scatter plot.
	new ScatterPlot(
		"main-interface", 
		new BoxModel([600, 580]), 
		param,
		r
	);

	// Create tiny scatter plots for selection.

	groups.forEach((group, i)=>{
		param.content = [group.values];
		param.name = [data_category[group.key]];

		new ScatterPlot(
			"class-list", 
			new BoxModel([150, 140]), 
			param,
			r,
			false,
			false,
			() => {
				if(selectedGroups.has(i))
					selectedGroups.delete(i);
				else
					selectedGroups.add(i);

				d3.select('.canvas-main-interface').remove();
				param.content = [...selectedGroups].map((gIndex)=> {
							return groups[gIndex].values;
				});
				param.name = null;

				new ScatterPlot(
					"main-interface", 
					new BoxModel([600, 580]), 
					param,
					r
				);
			}
		);

	});
}

function switchdata(data, metadata, cateogry, sampled_indices) {
	main(data, metadata, cateogry);

	d3.select('#subtitle').text(metadata.name)
	d3.selectAll('.dropdown-item-extended').remove();
	d3.select('#sampling-dropdown').selectAll('.dropdown-item-extended').data(sampled_indices).enter().append('a')
		.attr('class', 'dropdown-item dropdown-item-extended')
		.text((d) => 'r: ' + d.r)
		.on('click', (d) => {
				d3.select('#sampling-option-display').text('r: ' + d.r);
				main(data, metadata, cateogry, d.indices);
		});

	d3.select('#sampling-default-option').on('click', () => {
		d3.select('#sampling-option-display').text('No sampling');
		main(data, metadata, cateogry);
	})
}

switchdata(sfhealthscore, sfhealthscore_metadata, sfhealthscore_category, sfhealthscore_sampled_indices);