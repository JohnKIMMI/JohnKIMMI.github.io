d3.csv("Top-50-musicality-global.csv").then(data => {
    const margin = { top: 20, right: 40, bottom: 50, left: 60 },
          width = 1000 - margin.left - margin.right,
          height = 600 - margin.top - margin.bottom;
  
    const svg = d3.select("#scatterplot")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    const tooltip = d3.select(".tooltip");
  
    const xScale = d3.scaleLinear().range([0, width]);
    const yScale = d3.scaleLinear().range([height, 0]);
  
    const xAxisG = svg.append("g").attr("transform", `translate(0, ${height})`);
    const yAxisG = svg.append("g");
  
    const xAxisLabel = svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .style("fill", "white")
      .style("font-size", "14px");
  
    const yAxisLabel = svg.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", `rotate(-90)`)
      .attr("x", -height / 2)
      .attr("y", -40)
      .style("fill", "white")
      .style("font-size", "14px");
  
    const color = d3.scaleOrdinal(d3.schemeTableau10);
  
    const brush = d3.brush()
      .extent([[0, 0], [width, height]])
      .on("start brush end", brushed);
  
    svg.append("g")
      .attr("class", "brush")
      .call(brush);
  
    updatePlot();
  
    d3.select("#x-axis-feature").on("change", updatePlot);
    d3.select("#y-axis-feature").on("change", updatePlot);
    d3.selectAll(".country-option").on("change", updatePlot);
    d3.select("#select-all-countries").on("change", function () {
      const checked = this.checked;
      d3.selectAll(".country-option").property("checked", checked);
      updatePlot();
    });
  
    function updatePlot() {
      const xFeature = d3.select("#x-axis-feature").property("value");
      const yFeature = d3.select("#y-axis-feature").property("value");
  
      const selectedCountries = Array.from(d3.selectAll(".country-option").nodes())
        .filter(d => d.checked)
        .map(d => d.value);
  
      const filtered = data.filter(d =>
        d.Country === "Global" ||
        selectedCountries.includes(d.Country)
      );
  
      xScale.domain([0, d3.max(filtered, d => +d[xFeature]) || 1]);
      yScale.domain([0, d3.max(filtered, d => +d[yFeature]) || 1]);
  
      xAxisG.call(d3.axisBottom(xScale));
      yAxisG.call(d3.axisLeft(yScale));
  
      xAxisLabel.text(xFeature);
      yAxisLabel.text(yFeature);
  
      const circles = svg.selectAll("circle")
        .data(filtered, d => d["Track Name"] + d.Country);
  
      circles.enter()
        .append("circle")
        .attr("r", 4)
        .attr("opacity", 0.7)
        .merge(circles)
        .attr("cx", d => xScale(+d[xFeature]))
        .attr("cy", d => yScale(+d[yFeature]))
        .attr("fill", d => color(d.Country))
        .on("mouseover", (event, d) => {
          tooltip.transition().duration(100).style("opacity", 0.9);
          tooltip.html(`
            <strong>${d["Track Name"]}</strong><br>
            ${d["Artist Name"]}<br>
            Country: ${d.Country}<br>
            ${xFeature}: ${d[xFeature]}<br>
            ${yFeature}: ${d[yFeature]}
          `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
          tooltip.transition().duration(200).style("opacity", 0);
        });
  
      circles.exit().remove();
  
      const legendContainer = d3.select("#scatter-legend");
      legendContainer.html("");
      const legendCountries = [...new Set(filtered.map(d => d.Country))];
      legendCountries.forEach(country => {
        const row = legendContainer.append("div").style("margin-bottom", "6px");
        row.append("span")
          .style("display", "inline-block")
          .style("width", "12px")
          .style("height", "12px")
          .style("background-color", color(country))
          .style("margin-right", "6px");
        row.append("span").text(country);
      });
    }
  
    function brushed({ selection }) {
      if (!selection) {
        svg.selectAll("circle").attr("stroke", null);
        return;
      }
      const [[x0, y0], [x1, y1]] = selection;
      const xFeature = d3.select("#x-axis-feature").property("value");
      const yFeature = d3.select("#y-axis-feature").property("value");
  
      svg.selectAll("circle")
        .attr("stroke", d =>
          xScale(+d[xFeature]) >= x0 &&
          xScale(+d[xFeature]) <= x1 &&
          yScale(+d[yFeature]) >= y0 &&
          yScale(+d[yFeature]) <= y1 ? "black" : null
        )
        .attr("stroke-width", 2);
    }
  });
  