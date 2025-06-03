d3.csv("country_avg_features.csv").then(data => {
    const container = d3.select("#country-checkboxes");
    const selectAllBox = d3.select("#select-all-countries");
  
    const countries = [...new Set(data.map(d => d.id))];
  
    countries.forEach(country => {
      const wrapper = container.append("div").style("margin-bottom", "4px");
  
      wrapper.append("input")
        .attr("type", "checkbox")
        .attr("class", "country-option")
        .attr("id", `chk-${country}`)
        .attr("value", country)
        .property("checked", true);
  
      wrapper.append("label")
        .attr("for", `chk-${country}`)
        .style("margin-left", "4px")
        .style("font-size", "13px")
        .style("color", "#fff")
        .text(country);
    });
  
    selectAllBox.property("checked", true);
  
    selectAllBox.on("change", function () {
      const checked = this.checked;
      d3.selectAll(".country-option").property("checked", checked);
    });
  });
  