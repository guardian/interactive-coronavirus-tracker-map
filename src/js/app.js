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
.domain([0, 10])
.range([0, 10]);

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

loadJson('https://interactive.guim.co.uk/docsdata-test/1mspXyy089HhJmEiydttWWVt7knyg8k9nmSGNajTyQDw.json')
.then( fileRaw => {
	makeMaps()
	parseData (fileRaw.sheets)
})

const makeMaps = () => {

	if(!isMobile)
	{
		map = d3.select('.interactive-wrapper').append('svg').attr('width', width).attr('height', height);

		projection.fitExtent([[0, 0], [width, height]], world);

		map.selectAll('path')
		.data(world.features)
		.enter()
		.append("path")
		.attr("d", path)
		.attr('class', d => 'country ' + d.properties.ISO_A3)
	}
	else{
		east = d3.select('.interactive-wrapper').append('svg').attr('class', 'east').attr('width', width).attr('height', height );
		west = d3.select('.interactive-wrapper').append('svg').attr('class', 'west').attr('width', width).attr('height', height );

		projection.rotate([0,0,0]).fitExtent([[0, 0], [width, height]], america);
		
		west.selectAll('path')
		.data(america.features)
		.enter()
		.append('path')
		.attr('d', path)
		.attr('class', d => 'country ' + d.properties.ISO_A3)

		projection.fitExtent([[0, 0], [width, height]], rest);
		
		east.selectAll('path')
		.data(rest.features)
		.enter()
		.append('path')
		.attr('d', path)
		.attr('class', d => 'country ' + d.properties.ISO_A3)
	}

}

const parseData = (sheet) => {

	sheet.data.map( d => {

		let feature = topojson.feature(worldMap, worldMap.objects.ne_10m_admin_0_countries).features.filter( s => s.properties.ISO_A3 === d.ISO_A3)

		if(!isMobile){

			map
			.append('g')
			.selectAll('path')
			.data(feature)
			.enter()
			.append("path")
			.attr("d", path)

			map
			.append('circle')
			.attr("class", "bubble")
			.attr("r", radius(d.cases))
			.attr("cx", path.centroid(feature[0])[0])
			.attr("cy", path.centroid(feature[0])[1])
			.style("stroke-opacity", 1)
			.style("stroke", '#f5be2c')
			.style("fill-opacity", .3)
			.style("fill", '#f5be2c')

		}
		else{

			projection.fitExtent([[0, 0], [width, height]], rest);

			east
			.append('g')
			.selectAll('path')
			.data(feature)
			.enter()
			.append("path")
			.attr("d", path)

			projection.fitExtent([[0, 0], [width, height]], america);

			west
			.append('g')
			.selectAll('path')
			.data(feature)
			.enter()
			.append("path")
			.attr("d", path)

		}

	})


	sheet.style.filter(s => s.feature === "selected-country").map(s => {

		if(!isMobile)
		{
			map
			.selectAll('g path')
			.style(s.style, s.value)
		}
		else
		{
			east
			.selectAll('g path')
			.style(s.style, s.value)

			west
			.selectAll('g path')
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
		else{


			console.log(c, "paso por aqui")

			projection.fitExtent([[0, 0], [width, height]], rest);

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


			projection.fitExtent([[0, 0], [width, height]], america);


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


	})
}
