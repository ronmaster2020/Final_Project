$(document).ready(async function() {
    const response = await fetchData({ dateUnit: "yearMonth"}, '/order/grouped/date', 'GET', $('#graph-sales'));
    const dataset = await response.map(groupOfOrders => {
        const dateParts = groupOfOrders._id.split('-');
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1; // month is zero-based in JavaScript Date object
        const date = new Date(year, month);
        return {
            _id: date,
            total_income: groupOfOrders.totalIncome
        };
    }).sort((a, b) => a._id - b._id);

    drawLinearGraph(dataset, $('#graph-sales'));

    $(window).resize(function() {
        $('#graph-sales').empty();
        drawLinearGraph(dataset, $('#graph-sales'));
    });
});

function drawLinearGraph(data, container) {
    const containerElement = container[0];
    // D3.js Line Chart
    const margin = { top: 20, right: 30, bottom: 50, left: 70 };
    const width = Math.max(containerElement.clientWidth - margin.left - margin.right, 500);
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(containerElement)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
        .domain([d3.min(data, d => d._id), d3.max(data, d => d._id)])
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.total_income)])
        .range([height, 0]);

    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

    svg.append("g")
        .call(yAxis);

    const line = d3.line()
        .x(d => x(d._id))
        .y(d => y(d.total_income));

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", line);

    // Tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px");

    // Add circles for data points
    svg.selectAll("dot")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => x(d._id))
        .attr("cy", d => y(d.total_income))
        .on("mouseover", function(event, d) {
            $(this).css("stroke", "rgb(189, 225, 255)");
            tooltip.transition()
                .duration(100)
                .style("opacity", .9);

            function getMonthString(month) {
                const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                return months[month - 1];
            }
            const formattedTotal = d.total_income.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            
            tooltip.html(`${getMonthString(d._id.getMonth() + 1)} ${d._id.getFullYear()}<br>Total: ${formattedTotal}$`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            $(this).css("stroke", "white");
            tooltip.transition()
                .duration(100)
                .style("opacity", 0);
        })
        .on("click", function(event, d) {
            window.location.href = `/orders?year=${d._id.getFullYear()}&month=${d._id.getMonth() + 1}`;
        });

    // Add X Axis Label
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)

    // Add Y Axis Label
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)
}