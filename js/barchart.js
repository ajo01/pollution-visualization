class BarChart {
  /**
   * Class constructor with initial configuration
   * @param {Object}
   */
  constructor(_config, data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 1100,
      containerHeight: 2400,
      margin: {
        top: 150,
        right: 50,
        bottom: 100,
        left: 200,
      },
      tooltipPadding: 15,
    };
    this.data = data;
    this.initVis();
  }

  //  Create SVG area, initialize scales and axes
  initVis() {
    let vis = this;

    vis.data = vis.data.sort(function (a, b) {
      return b["Plastic_Waste"] - a["Plastic_Waste"];
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
      .attr("id", "bar-chart");

    // create chart
    vis.chart = vis.svg
      .append("g")
      .attr(
        "transform",
        `translate(${vis.config.margin.left},${vis.config.margin.top})`
      );

    vis.xScale = d3.scaleLinear().range([0, vis.width]);
    vis.yScale = d3.scaleBand().range([0, vis.height]).padding(0.2);

    vis.yAxis = d3
      .axisLeft(vis.yScale)
      .ticks(100)
      .tickSize(vis.width)
      .tickPadding(10);
    vis.xAxis = d3
      .axisBottom(vis.xScale)
      .tickSize(vis.height)
      .ticks(5)
      .tickPadding(10)
      .tickFormat((d, i) => {
        return `${d}%`;
      });
    vis.xAxisTop = d3
      .axisTop(vis.xScale)
      .tickSize(0)
      .tickPadding(10)
      .ticks(5)
      .tickFormat((d, i) => {
        return `${d}%`;
      });

    // append x and y axis element to chart
    vis.xAxisG = vis.chart
      .append("g")
      .attr("transform", `translate(0,0)`)
      .attr("class", "bar-x-axis");
    vis.xAxisTopG = vis.chart
      .append("g")
      .attr("transform", `translate(0,0)`)
      .attr("class", "bar-x-axis");
    vis.yAxisG = vis.chart
      .append("g")
      .attr("transform", `translate(${vis.width},0)`)
      .attr("class", "bar-y-axis");

    vis.chart
      .append("text")
      .attr("x", vis.width / 2)
      .attr("y", -70)
      .text("Share of plastic inadequately managed (%)")
      .style("text-anchor", "middle")
      .style("font-size", "12px");
  }

  // Prepare data and scales
  updateVis() {
    let vis = this;

    vis.yScale.domain(vis.data.map((d) => d.Country));
    vis.xScale.domain([0, 100]);

    vis.renderVis();
  }

  //Bind data to visual elements, update axes
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

    vis.barShadows = vis.chart
      .selectAll(".bar-shadow")
      .data(vis.data)
      .join("rect")
      .attr("class", (d) => colorClass(d.Region))
      .attr("x", 0)
      .attr("y", (d) => vis.yScale(d["Country"]))
      .attr("width", vis.width)
      .attr("height", vis.yScale.bandwidth())
      .style("fill-opacity", 0.1);

    vis.bar = vis.chart
      .selectAll(".bar")
      .data(vis.data)
      .join("rect")
      .attr("class", (d) => `bar ${colorClass(d.Region)}`)
      .attr("x", 0)
      .attr("y", (d) => vis.yScale(d["Country"]))
      .attr("width", (d) => vis.xScale(d["Inadequately_Managed"]))
      .attr("height", vis.yScale.bandwidth());

    vis.chart
      .selectAll(".tick-label")
      .data(vis.data)
      .enter()
      .append("text")
      .attr("class", "tick-label")
      .attr("x", function (d) {
        return vis.xScale(d["Inadequately_Managed"]) + 15;
      })
      .attr("y", function (d) {
        return vis.yScale(d["Country"]) + vis.yScale.bandwidth() - 4;
      })
      .text(function (d) {
        return `${d["Inadequately_Managed"]}%`;
      })
      .style("text-anchor", "middle")
      .style("font-size", "10px");

    const handleTooltip = (el) =>
      el.each(function (d, i) {
        d3.select(this)
          .on("mouseover", (event, d) => {
            d3
              .select("#tooltip")
              .style("display", "block")
              .style("left", event.pageX + vis.config.tooltipPadding + "px")
              .style("top", event.pageY + vis.config.tooltipPadding + "px")
              .html(`
              <div>${d.Country}</div>
            <div>${numberWithCommas(
              Math.round(d.Plastic_Waste / 100)
            )} tonnes of plastic waste generated / day</div>
            <div class="tooltip-cost">Rank ${i + 1}/105</div>
          `);
          })
          .on("mouseleave", () => {
            d3.select("#tooltip").style("display", "none");
          });
      });
    handleTooltip(vis.barShadows);
    handleTooltip(vis.bar);

    vis.xAxisG.call(vis.xAxis);
    vis.xAxisTopG.call(vis.xAxisTop);
    vis.yAxisG.call(vis.yAxis);
  }
}
