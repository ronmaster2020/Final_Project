$(document).ready(async function() {
    const today = new Date();
    
    const lastMonth = (new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())).toISOString();
    const lastWeek = (new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7)).toISOString();
    const lastHalfYear = (new Date(today.getFullYear(), today.getMonth() - 6, today.getDate())).toISOString();
    const lastYear = (new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())).toISOString();
    const last2Years = (new Date(today.getFullYear() - 2, today.getMonth(), today.getDate())).toISOString();

    $('#lastMonth').attr('startDate', lastMonth);
    $('#lastWeek').attr('startDate', lastWeek);
    $('#lastHalfYear').attr('startDate', lastHalfYear);
    $('#lastYear').attr('startDate', lastYear);
    $('#last2Years').attr('startDate', last2Years);

    const response = await fetchData({ dateUnit: "yearMonth"}, '/order/grouped/date', 'GET', $('#graph-sales'));
    const dataset = await response.map(groupOfOrders => {
        if (groupOfOrders._id) {
            const dateParts = groupOfOrders._id.split('-');
            const year = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1; // month is zero-based in JavaScript Date object
            const date = new Date(year, month);
            return {
                _id: date,
                total_income: groupOfOrders.totalIncome
            };
        } else {
            console.error('Invalid _id:', groupOfOrders);
            return null;
        }
    }).filter(item => item !== null).sort((a, b) => a._id - b._id);

    let dateRange = { startDate: dataset[0]._id.toISOString(), endDate: (new Date()).toISOString() }

    drawLinearGraph(dataset, $('#graph-sales'), dateRange);

    $('#dateRange').on('change', function() {
        const selectedDateRange = $('#dateRange option:selected');
        const startDate = selectedDateRange.attr('startDate') || null;
        const endDate = selectedDateRange.attr('endDate') || null;
        if (startDate) {
            dateRange = { ...dateRange, startDate: startDate };
        }
        if (endDate) {
            dateRange = { ...dateRange, endDate: endDate };
        }
        if (selectedDateRange.attr('id') === 'allTime') {
            dateRange.startDate = dataset[0]._id.toISOString();
        }
        const datasetStartRange = new Date(dateRange.startDate);
        const datasetEndRange = new Date(dateRange.endDate);
        const filteredDataset = dataset.filter(item => item._id >= datasetStartRange && item._id <= datasetEndRange);
        
        $('#graph-sales').empty();

        drawLinearGraph(filteredDataset, $('#graph-sales'), dateRange);
        // const response = await fetchData({ dateUnit: "yearMonth"}, '/order/grouped/date', 'GET', $('#graph-sales'));
        // const dataset = await response.map(groupOfOrders => {
        //     const dateParts = groupOfOrders._id.split('-');
        //     const year = parseInt(dateParts[0]);
        //     const month = parseInt(dateParts[1]) - 1; // month is zero-based in JavaScript Date object
        //     const date = new Date(year, month);
        //     return {
        //         _id: date,
        //         total_income: groupOfOrders.totalIncome
        //     };
        // }).sort((a, b) => a._id - b._id);
    });

    $(window).resize(function() {
        $('#graph-sales').empty();
        drawLinearGraph(dataset, $('#graph-sales'), dateRange);
    });
});



// function that draws a linear graph
function drawLinearGraph(data, container, dateRange) {
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

    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);

    const x = d3.scaleTime()
        .domain([startDate, endDate])
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