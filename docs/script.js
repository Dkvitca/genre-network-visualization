d3.json("data/cleaned_genres_network.json")
  .then((data) => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const svg = d3
      .select("#network")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .call(
        d3.zoom().on("zoom", function (event) {
          svg.attr("transform", event.transform);
        })
      )
      .append("g");

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const nodes = [];
    const links = [];

    function traverse(node, depth = 0) {
      node.depth = depth;
      nodes.push(node);
      if (node.subgenres) {
        node.subgenres.forEach((subgenre) => {
          links.push({ source: node.name, target: subgenre.name });
          traverse(subgenre, depth + 1);
        });
      }
    }

    traverse(data);

    const depthColorScale = d3
      .scaleSequential(d3.interpolateRainbow)
      .domain([0, d3.max(nodes, (d) => d.depth)]);

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3.forceLink(links).id((d) => d.name)
      )
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("class", "link");

    const node = svg
      .append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node");

    node
      .append("circle")
      .attr("r", 5)
      .attr("fill", (d) => depthColorScale(d.depth));

    node
      .append("text")
      .attr("dy", -10)
      .text((d) => d.name)
      .attr("fill", "#000"); // Set text color to black

    simulation.nodes(nodes).on("tick", ticked);

    simulation.force("link").links(links);

    function ticked() {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    }
  })
  .catch((error) => {
    console.error("Error loading the data:", error);
  });
