d3.csv("data/output.csv").then((data) => {
  // convert strings to numbers
  data.forEach((d) => {
    d.GDP = +d.GDP.replace(/,/g, "");

    // Remove commas and then convert to a number
    d.Plastic_Waste = +d.Plastic_Waste.replace(/,/g, "");
    d.Inadequately_Managed = +d.Inadequately_Managed.replace(/,/g, "");
  });

  // // initialize chart
  bar = new BarChart(
    {
      parentElement: "#vis",
    },
    data
  );
  // render chart
  bar.updateVis();

  area = new AreaChart(
    {
      parentElement: "#area",
    },
    data
  );
  // render chart
  area.updateVis();
});

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
