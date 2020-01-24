import * as d3B from 'd3'
import * as topojson from 'topojson'
import * as geo from 'd3-geo-projection'
import { $ } from "./util"
import worldMap from '../assets/ne_10m_admin_0_countries.json'
import loadJson from '../components/load-json'

const d3 = Object.assign({}, d3B, topojson, geo);

const atomEl = $('.interactive-wrapper')

let isMobile = window.matchMedia('(max-width: 600px)').matches;

let width = atomEl.getBoundingClientRect().width;
let height =  isMobile ? width : width * 2.5 / 5;

let projection = d3.geoMiller()
.rotate([-160,0,0])

let path = d3.geoPath()
.projection(projection)

let radius = d3.scaleSqrt()
.range([0, 50]);

const world = topojson.feature(worldMap, worldMap.objects.ne_10m_admin_0_countries);

const america = topojson.feature(worldMap, {
	type: "GeometryCollection",
	geometries: worldMap.objects.ne_10m_admin_0_countries.geometries.filter(d => d.properties.CONTINENT == "South America" || d.properties.CONTINENT == "North America")
});

const rest = topojson.feature(worldMap, {
	type: "GeometryCollection",
	geometries: worldMap.objects.ne_10m_admin_0_countries.geometries.filter(d => d.properties.CONTINENT == "Africa" || d.properties.CONTINENT == "Europe" || d.properties.CONTINENT == "Asia" || d.properties.CONTINENT == "Oceania" || d.properties.CONTINENT == "Seven seas (open ocean)")
});

let map;
let east;
let west;



const fillFurniture = (furniture) => {

	console.log(furniture[0].text)
	d3.select('.headline').html(furniture[0].text)
	d3.select('.timestamp').html(furniture[2].text)
	d3.select('.source').html(furniture[1].text)
}

const makeMaps = () => {

	if(!isMobile)
	{
		map = d3.select('.interactive-wrapper').append('svg').attr('width', width).attr('height', height);
		map.append('g').attr('class', 'base-map')
		map.append('g').attr('class', 'countries')
		map.append('g').attr('class', 'bubbles')
		map.append('g').attr('class', 'labels')

		projection.fitExtent([[0, 0], [width, height]], world);

		map.select('.base-map').selectAll('path')
		.data(world.features)
		.enter()
		.append("path")
		.attr("d", path)
		.attr('class', d => 'country ' + d.properties.ISO_A3)
	}
	else{
		east = d3.select('.interactive-wrapper').append('svg').attr('class', 'east').attr('width', width).attr('height', height );
		east.append('g').attr('class', 'base-map')
		east.append('g').attr('class', 'countries')
		east.append('g').attr('class', 'bubbles')
		east.append('g').attr('class', 'labels')

		west = d3.select('.interactive-wrapper').append('svg').attr('class', 'west').attr('width', width).attr('height', height );
		west.append('g').attr('class', 'base-map')
		west.append('g').attr('class', 'countries')
		west.append('g').attr('class', 'bubbles')
		west.append('g').attr('class', 'labels')

		projection.rotate([0,0,0]).fitExtent([[0, 0], [width, height]], america);
		
		west.select('.base-map').selectAll('path')
		.data(america.features)
		.enter()
		.append('path')
		.attr('d', path)
		.attr('class', d => 'country ' + d.properties.ISO_A3)

		projection.fitExtent([[0, 0], [width, height]], rest);
		
		east.select('.base-map').selectAll('path')
		.data(rest.features)
		.enter()
		.append('path')
		.attr('d', path)
		.attr('class', d => 'country ' + d.properties.ISO_A3)
	}

}

const parseData = (sheet) => {

	//let cases = sheet.data.filter( c => +c.cases > 0 )
	let max = d3.max(sheet.data, d => +d.cases );

	radius.domain([0, max])

	sheet.data.map( d => {

		let feature = topojson.feature(worldMap, worldMap.objects.ne_10m_admin_0_countries).features.filter( s => s.properties.ISO_A3 === d.ISO_A3)
		let centroid = path.centroid(feature[0])

		if(d.lat) centroid = projection([d.lon, d.lat])

		if(!isMobile){

			map.select('.countries')
			.append('g')
			.selectAll('path')
			.data(feature)
			.enter()
			.append("path")
			.attr("d", path)

			map.select('.bubbles')
			.append('circle')
			.attr("class", "bubble")
			.attr("r", radius(d.cases))
			.attr("cx", centroid[0])
			.attr("cy", centroid[1])
			.style("stroke-opacity", 1)
			.style("stroke", '#f5be2c')
			.style("fill-opacity", .3)
			.style("fill", '#f5be2c')

			if(d.display != 'none')
			{

				let label = map.select('.labels').append('text')
				.attr('transform', 'translate(' + centroid[0] + ',' + centroid[1] + ')')
				.attr('width', '20px')
				.attr('height', '20px')
				.style('border', '1px')

				label
				.append("tspan")
				.attr('class','country-label')
				.text(d.NAME)
				.attr('x', d.offset)

				label
				.append('tspan')
				.attr('class','country-cases')
				.text(d.text)
				.attr('x', d.offset)
				.attr('dy', "15")
			}
			

		}
		else{

			projection.fitExtent([[0, 0], [width, height]], rest);

			if(d.lat) centroid = projection([d.lon, d.lat])
			else centroid = path.centroid(feature[0])

			east.select('.countries')
			.append('g')
			.selectAll('path')
			.data(feature)
			.enter()
			.append("path")
			.attr("d", path)

			east.select('.bubbles')
			.append('circle')
			.attr("class", "bubble")
			.attr("r", radius(d.cases))
			.attr("cx", centroid[0])
			.attr("cy", centroid[1])
			.style("stroke-opacity", 1)
			.style("stroke", '#f5be2c')
			.style("fill-opacity", .3)
			.style("fill", '#f5be2c')

			if(d.display != 'none')
			{

					let label = east.select('.labels').append('text')
					.attr('transform', 'translate(' + path.centroid(feature[0])[0] + ',' + path.centroid(feature[0])[1] + ')')
					.attr('width', '20px')
					.attr('height', '20px')
					.style('border', '1px')

					label
					.append("tspan")
					.attr('class','country-label')
					.text(d.NAME)
					.attr('x', d.offset)

					label
					.append('tspan')
					.attr('class','country-cases')
					.text(d.text)
					.attr('x', d.offset)
					.attr('dy', "15")
			}

			projection.fitExtent([[0, 0], [width, height]], america);

			if(d.lat) centroid = projection([d.lon, d.lat])
			else centroid = path.centroid(feature[0])

			west.select('.countries')
			.append('g')
			.selectAll('path')
			.data(feature)
			.enter()
			.append("path")
			.attr("d", path)

			west.select('.bubbles')
			.append('circle')
			.attr("class", "bubble")
			.attr("r", radius(d.cases))
			.attr("cx", centroid[0])
			.attr("cy", centroid[1])
			.style("stroke-opacity", 1)
			.style("stroke", '#f5be2c')
			.style("fill-opacity", .3)
			.style("fill", '#f5be2c')

			if(d.display != 'none')
			{
				let label = west.select('.labels').append('text')
				.attr('transform', 'translate(' + centroid[0] + ',' + centroid[1] + ')')
				.attr('width', '20px')
				.attr('height', '20px')
				.style('border', '1px')

				label
				.append("tspan")
				.attr('class','country-label')
				.text(d.NAME)
				.attr('x', d.offset)

				label
				.append('tspan')
				.attr('class','country-cases')
				.text(d.text)
				.attr('x', d.offset)
				.attr('dy', "15")
			}

		}

	})

	sheet.style.filter(s => s.feature === "selected-country").map(s => {

		if(!isMobile)
		{
			map
			.selectAll('.countries g path')
			.style(s.style, s.value)
		}
		else
		{
			east
			.selectAll('.countries g path')
			.style(s.style, s.value)

			west
			.selectAll('.countries g path')
			.style(s.style, s.value)
		}
		
	})

	sheet.style.filter(s => s.feature === "bubble").map(s => {

		if(!isMobile)
		{
			map
			.selectAll('circle')
			.style(s.style, s.value)
		}
		else
		{
			east
			.selectAll('circle')
			.style(s.style, s.value)

			west
			.selectAll('circle')
			.style(s.style, s.value)
		}
	})

	sheet.cities.map(c => {

		if(!isMobile){

			if(c.display != "none")
			{
				map
				.append('rect')
				.attr('width', 5)
				.attr('height', 5)
				.attr('x', projection([c.lon, c.lat])[0])
				.attr('y', projection([c.lon, c.lat])[1])
				.style('fill', '#333333')
				.style('stroke', '#FFFFFF')

				map
				.append('text')
				.attr('x', projection([c.lon, c.lat])[0] + 5)
				.attr('y', projection([c.lon, c.lat])[1] + 5)
				.attr('class',c.type)
				.text(c.city)
			}
		}
		else{

			projection.fitExtent([[0, 0], [width, height]], rest);


			if(c.display != "none")
			{
				if(d3.geoContains(rest, [c.lon, c.lat]))
				{
					east
					.append('rect')
					.attr('width', 5)
					.attr('height', 5)
					.attr('x', projection([c.lon, c.lat])[0])
					.attr('y', projection([c.lon, c.lat])[1])
					.style('fill', '#333333')
					.style('stroke', '#FFFFFF')

					east
					.append('text')
					.attr('x', projection([c.lon, c.lat])[0] + 5)
					.attr('y', projection([c.lon, c.lat])[1] + 5)
					.attr('class',c.type)
					.text(c.city)
				}

				projection.fitExtent([[0, 0], [width, height]], america);

				if(d3.geoContains(america, [c.lon, c.lat]))
				{
					west
					.append('rect')
					.attr('width', 5)
					.attr('height', 5)
					.attr('x', projection([c.lon, c.lat])[0])
					.attr('y', projection([c.lon, c.lat])[1])
					.style('fill', '#333333')
					.style('stroke', '#FFFFFF')

					west
					.append('text')
					.attr('x', projection([c.lon, c.lat])[0] + 5)
					.attr('y', projection([c.lon, c.lat])[1] + 5)
					.attr('class',c.type)
					.text(c.city)
				}
			}
		}


	})
}


loadJson('https://interactive.guim.co.uk/docsdata-test/1mspXyy089HhJmEiydttWWVt7knyg8k9nmSGNajTyQDw.json')
.then( fileRaw => {
	fillFurniture(fileRaw.sheets.furniture);
	makeMaps();
	parseData (fileRaw.sheets);
	window.resize();
})