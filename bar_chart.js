const margin = { top: 20, right: 40, bottom: 20, left: 150 },
      innerWidth = 1000,
      barHeight = 30,
      barPadding = 5;

let barSvg;

d3.csv("country_avg_features.csv").then(data => {
  barSvg = d3.select("#bar-chart")
    .append("svg")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  d3.select("#main-feature").on("change", () => updateBarChart(data));
  d3.selectAll(".country-option").on("change", () => updateBarChart(data));
  d3.select("#select-all-countries").on("change", function () {
    const checked = this.checked;
    d3.selectAll(".country-option").property("checked", checked);
    updateBarChart(data);
  });

  updateBarChart(data);
});

function updateBarChart(data) {
    const selectedFeature = d3.select("#main-feature").property("value");
    const selectedCountries = Array.from(d3.selectAll(".country-option").nodes())
      .filter(d => d.checked)
      .map(d => d.value);
  
    const global = data.find(d => d.id === "Global");
  
    const rest = data
      .filter(d =>
        d.id !== "Global" &&
        selectedCountries.includes(d.id)
      )
      .sort((a, b) => +b[selectedFeature] - +a[selectedFeature]);
  
    const fullData = global ? [global, ...rest] : rest;
    const innerHeight = fullData.length * (barHeight + barPadding);
  
    const svg = d3.select("#bar-chart svg")
      .attr("width", innerWidth + margin.left + margin.right)
      .attr("height", innerHeight + margin.top + margin.bottom);
  
    const g = svg.select("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    const x = d3.scaleLinear()
      .domain([0, d3.max(fullData, d => +d[selectedFeature])])
      .nice()
      .range([0, innerWidth]);
  
    const y = d3.scaleBand()
      .domain(fullData.map(d => d.id))
      .range([0, innerHeight])
      .padding(0.2);
  
    g.selectAll(".y-axis").remove();
    g.selectAll(".x-axis").remove();
  
    g.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("fill", "white")
      .style("font-size", "14px");
  
    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("fill", "white");
  
    const bars = g.selectAll("rect")
      .data(fullData, d => d.id);
  
    bars.join(
      enter => enter.append("rect")
        .attr("x", 0)
        .attr("y", d => y(d.id))
        .attr("height", y.bandwidth())
        .attr("width", d => x(+d[selectedFeature]))
        .attr("fill", d => d.id === "Global" ? "#ffa500" : "#69b3a2"),
      update => update
        .transition()
        .duration(400)
        .attr("y", d => y(d.id))
        .attr("height", y.bandwidth())
        .attr("width", d => x(+d[selectedFeature]))
        .attr("fill", d => d.id === "Global" ? "#ffa500" : "#69b3a2"),
      exit => exit.remove()
    );
  }
  