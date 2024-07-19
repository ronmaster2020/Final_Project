$(document).ready(async function() {
    const today = new Date();
    
    const lastWeek = (new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7)).toISOString();
    const lastMonth = (new Date(today.getFullYear(), today.getMonth() - 1, today.getDate() + 1)).toISOString();
    const lastQuarter = (new Date(today.getFullYear(), today.getMonth() - 3, today.getDate())).toISOString();
    const lastHalfYear = (new Date(today.getFullYear(), today.getMonth() - 6, today.getDate())).toISOString();
    const lastYear = (new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())).toISOString();
    const last2Years = (new Date(today.getFullYear() - 2, today.getMonth(), today.getDate())).toISOString();

    $('#lastWeek').attr('startDate', lastWeek);
    $('#lastMonth').attr('startDate', lastMonth);
    $('#lastQuarter').attr('startDate', lastQuarter);
    $('#lastHalfYear').attr('startDate', lastHalfYear);
    $('#lastYear').attr('startDate', lastYear);
    $('#last2Years').attr('startDate', last2Years);

    const response = await fetchData({ dateUnit: "yearMonth"}, '/order/grouped/date', 'GET', $('#graph-sales'));
    const dataset = await response.map(groupOfOrders => {
        if (groupOfOrders._id) {
            const year = groupOfOrders._id.year;
            const month = groupOfOrders._id.month - 1;
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

    let dateUnit = "yearMonth";
    let dateRange = {startDate: dataset[0]._id, endDate: new Date()};
    let filteredDataset = await fetchingFilteredDataset(dataset, dateRange, dateUnit);

    drawLinearGraph(dataset, $('#graph-sales'), dateRange, dateUnit);

    $('#dateRange').on('change', async function() {
        const selectedDateRange = $('#dateRange option:selected');
        if (selectedDateRange.attr('id') === 'custom') {
            $('#customDateRange').removeClass('d-none');
            const startDate = new Date(dateRange.startDate);
            startDate.setDate(startDate.getDate() + 1);
            $('#startDate').val(startDate.toISOString().split('T')[0]);
            $('#endDate').val(dateRange.endDate.toISOString().split('T')[0]);
            return;
        } else {
            $('#customDateRange').addClass('d-none');
        }

        let startDate = selectedDateRange.attr('startDate') || null;
        let endDate = selectedDateRange.attr('endDate') || null;
        dateUnit = selectedDateRange.attr('dateUnit') || "yearMonth";
        $('#dateUnit').val(dateUnit);

        if (startDate) {
            dateRange.startDate = new Date(startDate);
        }
        if (endDate) {
            dateRange.endDate = new Date(endDate);
        } else {
            dateRange.endDate = new Date();
        }
        if (selectedDateRange.attr('id') === 'allTime') {
            dateRange.startDate = dataset[0]._id;
            dateRange.endDate = new Date();
        }

        filteredDataset = await fetchingFilteredDataset(dataset, dateRange, dateUnit);
        $('#graph-sales').empty();
        drawLinearGraph(filteredDataset, $('#graph-sales'), dateUnit);
    });

    $('#dateUnit').on('change', async function() {
        const selectedDateRange = $('#dateRange option:selected');
        let startDate = selectedDateRange.attr('startDate') || null;
        let endDate = selectedDateRange.attr('endDate') || null;

        if (startDate) {
            dateRange.startDate = new Date(startDate);
        }
        if (endDate) {
            dateRange.endDate = new Date(endDate);
        } else {
            dateRange.endDate = new Date();
        }
        if (selectedDateRange.attr('id') === 'allTime') {
            dateRange.startDate = dataset[0]._id;
            dateRange.endDate = new Date();
        }
        dateRange.startDate = $('#startDate').val() ? new Date($('#startDate').val()) : dateRange.startDate;
        dateRange.endDate = $('#endDate').val() ? new Date($('#endDate').val()) : dateRange.endDate;
        
        dateUnit = $('#dateUnit option:selected').val();
        filteredDataset = await fetchingFilteredDataset(dataset, dateRange, dateUnit);
        $('#graph-sales').empty();
        drawLinearGraph(filteredDataset, $('#graph-sales'), dateUnit);
    });

    $(window).resize(function() {
        $('#graph-sales').empty();
        drawLinearGraph(filteredDataset, $('#graph-sales'), dateUnit);
    });

    $('#applyDateRange').on('click', async function() {
        dateRange.startDate = $('#startDate').val() ? new Date($('#startDate').val()) : dateRange.startDate;
        dateRange.endDate = $('#endDate').val() ? new Date($('#endDate').val()) : dateRange.endDate;
        filteredDataset = await fetchingFilteredDataset(dataset, dateRange, dateUnit);
        $('#graph-sales').empty();
        drawLinearGraph(filteredDataset, $('#graph-sales'), dateUnit);
    });
});

async function fetchingFilteredDataset(dataset, dateRange, dateUnit) {
    dateRange = adjustDateRange(dateRange, dateUnit);
    
    if (dateUnit === "yearWeek" || dateUnit === "yearMonthDay") {
        const response = await fetchData({ dateUnit: dateUnit, startDate: dateRange.startDate, endDate: dateRange.endDate }, '/order/grouped/date', 'GET', $('#graph-sales'));
        const zoomedDataset = await response.map(groupOfOrders => {
            if (groupOfOrders._id) {
                let date = null;
                if (dateUnit==="yearWeek") {
                    const dateParts = groupOfOrders._id;
                    const year = dateParts.year;
                    const week = dateParts.week;
                    date = new Date(year, 0, week * 7 + 6);
                } else {
                    const dateParts = groupOfOrders._id;
                    const year = dateParts.year;
                    const month = dateParts.month - 1;
                    const day = dateParts.day;
                    date = new Date(year, month, day);
                }
                return {
                    _id: date,
                    total_income: groupOfOrders.totalIncome
                };
            } else {
                console.error('Invalid _id:', groupOfOrders);
                return null;
            }
        })
        let filteredDataset = zoomedDataset.filter(item => item._id >= dateRange.startDate && item._id <= dateRange.endDate);
        filteredDataset = await fillEmptyDates( filteredDataset, dateRange, dateUnit);
        filteredDataset = filteredDataset.sort((a, b) => a._id - b._id);
        return filteredDataset;
    } else {
        let filteredDataset = dataset.filter(item => item._id >= dateRange.startDate && item._id <= dateRange.endDate);
        filteredDataset = await fillEmptyDates( filteredDataset, dateRange, dateUnit)
        filteredDataset = filteredDataset.sort((a, b) => a._id - b._id);
        return filteredDataset;
    }
}

async function fillEmptyDates(dataset, dateRange, dateUnit) {
    let currentDate = new Date(dateRange.startDate); // Clone the start date

    if (dateUnit === "yearWeek") {
        while (currentDate <= dateRange.endDate) {
            if (!dataset.find(item => item._id.getFullYear() === currentDate.getFullYear() && item._id.getWeek() === currentDate.getWeek())) {
                dataset.push({ _id: new Date(currentDate.setDate(currentDate.getDate() + 6)), total_income: 0 }); // Clone the date
            } else {
                currentDate.setDate(currentDate.getDate() + 7);
            }
            
        }
    } else if (dateUnit === "yearMonth") {
        while (currentDate <= dateRange.endDate) {
            if (!dataset.find(item => item._id.getFullYear() === currentDate.getFullYear() && item._id.getMonth() === currentDate.getMonth())) {
                dataset.push({ _id: new Date(currentDate), total_income: 0 }); // Clone the date
            }
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
    } else {
        while (currentDate <= dateRange.endDate) {
            if (!dataset.find(item => item._id.getFullYear() === currentDate.getFullYear() && item._id.getMonth() === currentDate.getMonth() && item._id.getDate() === currentDate.getDate())) {
                dataset.push({ _id: new Date(currentDate), total_income: 0 }); // Clone the date
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }
    return dataset;
}

function adjustDateRange(dateRange, dateUnit) {
    let startDate = new Date(dateRange.startDate);
    let endDate = new Date(dateRange.endDate);

    console.log(startDate, endDate);

    if (dateUnit === "yearWeek") {
        startDate.setDate(startDate.getDate() - startDate.getDay());
        endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    } else if (dateUnit === "yearMonth") {
        startDate.setDate(1);
        if (endDate.getDate() !== 0) {
            endDate.setDate(0);
            endDate.setMonth(endDate.getMonth() + 1);
        }
    }
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    console.log(startDate, endDate);

    return { startDate, endDate };
}

// function that draws a linear graph
function drawLinearGraph(dataset, container, dateUnit) {
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
        .domain([dataset[0]._id, dataset[dataset.length - 1]._id])
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(dataset, d => d.total_income)])
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
        .datum(dataset)
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
        .data(dataset)
        .enter().append("circle")
        .attr("cx", d => x(d._id))
        .attr("cy", d => y(d.total_income))
        .on("mouseover", function(event, d) {
            $(this).css("stroke", "rgb(189, 225, 255)");
            tooltip.transition()
                .duration(100)
                .style("opacity", .9);
            tooltip.style("display", "block");

            function getMonthString(month) {
                const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                return months[month - 1];
            }

            const formattedTotal = d.total_income.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

            const dateMinus6Days = new Date(d._id);
            dateMinus6Days.setDate(dateMinus6Days.getDate() - 6);
            
          if (dateUnit === "yearWeek") {
                tooltip.html(`${d._id.getFullYear()}<br>${dateMinus6Days.getDate()} ${getMonthString(dateMinus6Days.getMonth() + 1)}-${d._id.getDate()} ${getMonthString(d._id.getMonth() + 1)}<br>Total: ${formattedTotal}$`)
                    .style("left", (event.pageX + 5) + "px")                  .style("top", (event.pageY - 28) + "px");
            } else if (dateUnit === "yearMonthDay") {
                tooltip.html(`${d._id.getDate()} ${getMonthString(d._id.getMonth() + 1)} ${d._id.getFullYear()}<br>Total: ${formattedTotal}$`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            } else {
                tooltip.html(`${getMonthString(d._id.getMonth() + 1)} ${d._id.getFullYear()}<br>Total: ${formattedTotal}$`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            }
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            $(this).css("stroke", "white");
            tooltip.transition()
                .duration(100)
                .style("opacity", 0)
            tooltip.style("display", "none");
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