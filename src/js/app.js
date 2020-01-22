import * as d3B from 'd3'
import * as topojson from 'topojson'
import * as geo from 'd3-geo-projection'
import { $ } from "./util"
import worldMap from '../assets/ne_10m_admin_0_countries.json'
import loadJson from '../components/load-json'

const d3 = Object.assign({}, d3B, topojson, geo);

const atomEl = $('.interactive-wrapper')

let isMobile = window.matchMedia('(max-width: 620px)').matches;

let width = atomEl.getBoundingClientRect().width;
let height =  width * 2.5 / 5;

let svg = d3.select('.interactive-wrapper')
.append('svg')
.attr('width', width)
.attr('height', height);



let projection = d3.geoMiller()
.rotate([-160,0,0]);

let path = d3.geoPath()
.projection(projection)

projection.fitExtent([[0, 0], [width, height]], topojson.feature(worldMap, worldMap.objects.ne_10m_admin_0_countries));

let map = svg.selectAll('path')
.data(topojson.feature(worldMap, worldMap.objects.ne_10m_admin_0_countries).features)
.enter()
.append("path")
.attr("d", path)
.attr('class', d => 'country ' + d.properties.ISO_A3)

let radius = d3.scaleSqrt()
.domain([0, 10])
.range([0, 50]);




loadJson('https://interactive.guim.co.uk/docsdata-test/1mspXyy089HhJmEiydttWWVt7knyg8k9nmSGNajTyQDw.json')
.then( fileRaw => {
	parseData (fileRaw.sheets.data)
})


const parseData = (data) => {
	data.map( d => {

		let feature = topojson.feature(worldMap, worldMap.objects.ne_10m_admin_0_countries).features.filter( s => s.properties.ISO_A3 === d.ISO_A3)

		let selected = svg.append('g');

		selected.selectAll('path')
		.data(feature)
		.enter()
		.append("path")
		.attr("d", path)
		.attr('class', 'selected')


		selected.append('circle')
     	.attr("class", "bubble")
     	.attr("r", radius(d.cases))
     	.attr("cx", path.centroid(feature[0])[0])
      	.attr("cy", path.centroid(feature[0])[1]);
		
	})
}
