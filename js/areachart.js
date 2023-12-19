class AreaChart {
  /**
   * Class constructor with initial configuration
   * @param {Object}
   */
  constructor(_config, data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 300,
      containerHeight: 2400,
      margin: {
        top: 150,
        right: 80,
        bottom: 100,
        left: 80,
      },
      tooltipPadding: 10,
    };
    this.data = data;
    this.initVis();
  }

  //  Create SVG area, initialize scales and axes
  initVis() {
    let vis = this;

    vis.data = vis.data.sort(function (a, b) {
      return a["Plastic_Waste"] - b["Plastic_Waste"];
    });

    vis.width =
      vis.config.containerWidth -
      vis.config.margin.left -
      vis.config.margin.right;
    vis.height =
      vis.config.containerHeight -
      vis.config.margin.top -
      vis.config.margin.bottom;

    vis.svg = d3
      .select(vis.config.parentElement)
      .append("svg")
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight)
      .attr("id", "area-chart");

    // create chart
    vis.chart = vis.svg
      .append("g")
      .attr(
        "transform",
        `translate(${vis.config.margin.left},${vis.config.margin.top})`
      );

    vis.line = vis.chart
      .append("line")
      .style("stroke", "white")
      .style("stroke-opacity", 0.2)
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", vis.height);

    vis.chart
      .append("text")
      .attr("x", 0)
      .attr("y", -50)
      .text("GDP per capita ($)")
      .style("text-anchor", "middle")
      .style("font-size", "12px");

    vis.yScale = d3.scaleBand().range([vis.height, 0]).padding(0.2);
    vis.radiusScale = d3.scaleSqrt().range([5, 35]);
  }

  updateVis() {
    let vis = this;

    vis.yScale.domain(vis.data.map((d) => d.Country));
    vis.radiusScale.domain([0, d3.max(vis.data, (d) => d.GDP)]);

    vis.renderVis();
  }

  renderVis() {
    let vis = this;

    const colorClass = (region) => {
      if (
        region === "Asia" ||
        region === "Europe" ||
        region === "Africa" ||
        region === "Oceania"
      ) {
        return region.toLowerCase();
      } else if (region === "South America") {
        return "south-america";
      } else if (region === "North America") {
        return "north-america";
      }
    };

    vis.circle = vis.chart
      .selectAll(".point")
      .data(vis.data)
      .join("circle")
      .attr("class", (d) => `point ${colorClass(d.Region)}`)
      .attr("cx", 0)
      .attr("cy", (d) => vis.yScale(d.Country) + vis.yScale.bandwidth() / 2)
      .attr("r", (d) => vis.radiusScale(d.GDP));

    vis.circle
      .on("mouseover", (event, d) => {
        d3
          .select("#tooltip")
          .style("display", "block")
          .style("left", event.pageX + vis.config.tooltipPadding + "px")
          .style("top", event.pageY + vis.config.tooltipPadding + "px").html(`
        <div>${d.Country}</div>
        <div>Total GDP: $${numberWithCommas(Math.round(d.GDP))} billions</div>
      `);
      })
      .on("mouseleave", () => {
        d3.select("#tooltip").style("display", "none");
      });
  }
}
