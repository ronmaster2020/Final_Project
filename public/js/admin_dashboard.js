let zoomedData = false;

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

    const response = await fetchData({ dateUnit: "yearMonth" }, '/order/grouped/date', 'GET', $('#graph-sales'));
    const dataset = await response.map(groupOfOrders => {
        if (groupOfOrders._id) {
            const year = groupOfOrders._id.year;
            const month = groupOfOrders._id.month - 1; // month is zero-based in JavaScript Date object
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
    let dateRange = { startDate: dataset[0]._id, endDate: new Date() };
    let filteredDataset = await fetchingFilteredDataset(dataset, dateRange, dateUnit);

    drawLinearGraph(filteredDataset, $('#graph-sales'), dateUnit);

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

    $('#applyDateRange').on('click', async function() {
        dateRange.startDate = $('#startDate').val() ? new Date($('#startDate').val()) : dateRange.startDate;
        dateRange.endDate = $('#endDate').val() ? new Date($('#endDate').val()) : dateRange.endDate;
        filteredDataset = await fetchingFilteredDataset(dataset, dateRange, dateUnit);
        $('#graph-sales').empty();
        drawLinearGraph(filteredDataset, $('#graph-sales'), dateUnit);
    });

    $(window).resize(function() {
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
                if (dateUnit === "yearWeek") {
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
        });
        let filteredDataset = zoomedDataset.filter(item => item._id >= dateRange.startDate && item._id <= dateRange.endDate);
        filteredDataset = await fillEmptyDates(filteredDataset, dateRange, dateUnit);
        filteredDataset = filteredDataset.sort((a, b) => a._id - b._id);
        return filteredDataset;
    } else {
        let filteredDataset = dataset.filter(item => item._id >= dateRange.startDate && item._id <= dateRange.endDate);
        filteredDataset = await fillEmptyDates(filteredDataset, dateRange, dateUnit);
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
    if (dateUnit === "yearMonth") {
        dateRange.startDate = new Date(dateRange.startDate.getFullYear(), dateRange.startDate.getMonth());
        dateRange.endDate = new Date(dateRange.endDate.getFullYear(), dateRange.endDate.getMonth(), 1);
    } else if (dateUnit === "yearWeek") {
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        const startDay = startDate.getDay();
        const endDay = endDate.getDay();

        dateRange.startDate = new Date(startDate.setDate(startDate.getDate() - startDay));
        dateRange.endDate = new Date(endDate.setDate(endDate.getDate() + (6 - endDay)));
    } else {
        dateRange.startDate = new Date(dateRange.startDate.getFullYear(), dateRange.startDate.getMonth(), dateRange.startDate.getDate());
        dateRange.endDate = new Date(dateRange.endDate.getFullYear(), dateRange.endDate.getMonth(), dateRange.endDate.getDate());
    }
    return dateRange;
}

function drawLinearGraph(dataset, container, dateUnit) {
    const labels = dataset.map(item => item._id.toISOString().split('T')[0]);
    const data = dataset.map(item => item.total_income);

    const ctx = container[0].getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Income',
                data: data,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: dateUnit === 'yearWeek' ? 'week' : (dateUnit === 'yearMonth' ? 'month' : 'day'),
                        tooltipFormat: 'yyyy-MM-dd'
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Total Income'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

function fetchData(params, url, method, container) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: url,
            method: method,
            data: params,
            beforeSend: function() {
                container.html('<p>Loading...</p>');
            },
            success: function(data) {
                resolve(data);
            },
            error: function(err) {
                reject(err);
            }
        });
    });
}
