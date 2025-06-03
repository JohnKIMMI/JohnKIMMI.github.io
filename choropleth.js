const svg = d3.select("#choropleth-map");
const width = +svg.attr("width");
const height = +svg.attr("height");

const projection = d3.geoEqualEarth()
  .scale(160)
  .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);
const tooltip = d3.select(".tooltip");

let geoData, nameData, featureData;
let rowById, countries;

Promise.all([
  d3.json("https://unpkg.com/world-atlas@1.1.4/world/110m.json"),
  d3.tsv("https://unpkg.com/world-atlas@1.1.4/world/110m.tsv"),
  d3.csv("country_avg_features.csv")
]).then(([world, names, data]) => {
  geoData = world;
  nameData = names;
  featureData = data;

  rowById = new Map(names.map(d => [d.iso_n3, d]));
  countries = topojson.feature(world, world.objects.countries).features;

  updateMap();

  d3.select("#main-feature").on("change", updateMap);
  d3.selectAll(".country-option").on("change", updateMap);
  d3.select("#select-all-countries").on("change", function () {
    const checked = this.checked;
    d3.selectAll(".country-option").property("checked", checked);
    updateMap();
  });
});

function updateMap() {
  const selectedFeature = d3.select("#main-feature").property("value");
  const selectedCountries = Array.from(d3.selectAll(".country-option").nodes())
    .filter(d => d.checked)
    .map(d => d.value);

  const values = featureData
    .filter(d => selectedCountries.length === 0 || selectedCountries.includes(d.id))
    .map(d => +d[selectedFeature])
    .filter(d => !isNaN(d));

  const minVal = d3.min(values);
  const maxVal = d3.max(values);

  const color = d3.scaleSequential()
    .domain([minVal, maxVal])
    .interpolator(d3.interpolateYlGnBu);

  const dataMap = new Map(
    featureData
      .filter(d => selectedCountries.length === 0 || selectedCountries.includes(d.id))
      .map(d => [d.id, +d[selectedFeature]])
  );

  svg.selectAll("path")
    .data(countries)
    .join("path")
    .attr("d", path)
    .attr("fill", d => {
      const row = rowById.get(d.id);
      const alpha3 = row?.iso_a3;
      const value = alpha3 ? dataMap.get(alpha3) : undefined;
      return value != null ? color(value) : "#ccc";
    })
    .attr("stroke", "#fff")
    .on("mouseover", (event, d) => {
      const row = rowById.get(d.id);
      const alpha3 = row?.iso_a3;
      const country = row?.admin;
      const value = alpha3 ? dataMap.get(alpha3) : undefined;

      tooltip.transition().duration(100).style("opacity", 0.9);
      tooltip.html(`
        Country: ${country ?? "Unknown"}<br>
        ${selectedFeature}: ${value != null ? value.toFixed(3) : "N/A"}
      `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", () => {
      tooltip.transition().duration(200).style("opacity", 0);
    });

  drawLegend(minVal, maxVal, color);
}

function drawLegend(min, max, color) {
  svg.select("#legend-gradient").remove();
  svg.select("#legend-axis").remove();
  svg.select("defs").remove();

  const legendWidth = 300;
  const legendHeight = 10;

  const defs = svg.append("defs");
  const linearGradient = defs.append("linearGradient")
    .attr("id", "legend-gradient");

  linearGradient.selectAll("stop")
    .data(d3.range(0, 1.01, 0.1))
    .join("stop")
    .attr("offset", d => `${d * 100}%`)
    .attr("stop-color", d => color(min + d * (max - min)));

  const legendSvg = svg.append("g")
    .attr("transform", `translate(${width - legendWidth - 40}, ${height - 40})`);

  legendSvg.append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#legend-gradient)");

  const legendScale = d3.scaleLinear()
    .domain([min, max])
    .range([0, legendWidth]);

  const legendAxis = d3.axisBottom(legendScale)
    .ticks(6)
    .tickFormat(d3.format(".2f"));

  legendSvg.append("g")
    .attr("transform", `translate(0, ${legendHeight})`)
    .attr("id", "legend-axis")
    .call(legendAxis)
    .attr("font-size", "10px")
    .attr("color", "#fff");
}
