let limit = 10;
let page = 1;

async function loadUsers(users, totalUsers) {
    $('#users').empty();
    $('#searchResult').text(totalUsers + ' users found');

    let isAdmin = await fetchData({}, '/getAccessLevel', 'GET', null);
    users.forEach((s) => {
        let staffCard = $('<div class="col-12 col-xl-6"></div>');
        let adminCard = $('<div class="admin-card"></div>');
        let img = $('<img src="https://cdn-icons-png.freepik.com/512/3135/3135715.png" alt="Profile Image">');
        let adminInfo = $('<div class="admin-info"></div>');
        let h2 = $('<h2>' + s.firstName + ' ' + s.lastName + '</h2>');
        let email = $('<div><p class="label">Email:</p><p id="email">' + s.email + '</p></div>');
        let address = $('<div><p class="label">Address:</p><p id="address">' + s.address + '</p></div>');
        let bio = $('<div><p class="label">Bio:</p><p id="bio">' + s.bio + '</p></div>');
        let access = $('<div><p class="label">Access:</p><p id="access">' + s.access + '</p></div>');
        if (s.access === 'admin') {
            access.find('#access').css({ 'color': 'rgb(204, 0, 0)' });
        } else if (s.access === 'staff') {
            access.find('#access').css({ 'color': 'rgb(0, 102, 255)' });
        }

        if (isAdmin === 'admin') {
            let cardBtn = $('<button class="cardBtn">Change Access</button>');
            cardBtn.click(() => {
                let newAccess = '';
                if (s.access === 'admin') {
                    newAccess = 'staff';
                } else if (s.access === 'staff') {
                    newAccess = 'user';
                } else {
                    newAccess = 'admin';
                }
                changeAccess(s.email, newAccess, adminCard);
            });
            adminCard.append(cardBtn);
        }
        
        adminInfo.append(h2, email, access, address, bio);
        adminCard.append(img, adminInfo);
        staffCard.append(adminCard);
        $('#users').append(staffCard);
    });
}

$(document).ready(async function() {
    $('#searchResult').text('fetching data...');
    filterUsers();

    $('#searchForm').submit((e) => {
        e.preventDefault();
        filterUsers();
    });

    $('#access').change(() => {
        page = 1;
        filterUsers();
    });

    $('#resetBtn').click(() => {
        $('input[name="fname"]').val('');
        $('input[name="lname"]').val('');
        $('input[name="email"]').val('');
        $('#access').val('all');
        filterUsers();
    });

    $('#paginationControls').on('click', 'a', function(event) {
        event.preventDefault();
        const newPage = parseInt($(this).text(), 10);
        changePage(newPage);
    });
});

async function filterUsers() {
    // Construct the query from form inputs
    const firstName = $('input[name="fname"]').val();
    const lastName = $('input[name="lname"]').val();
    const email = $('input[name="email"]').val();
    const access = $('#access').val() === 'all' ? '' : $('#access').val();

    const query = {
        firstName,
        lastName,
        email,
        access,
        limit: limit,
        page: page
    };

    // Log the constructed query
    console.log('Constructed query:', query);

    $('#paginationControls').addClass('d-none');

    try {
        const data = await fetchData(query, '/user/search', 'GET', $('#users'));

        // Log the response data
        console.log('Response data:', data);

        loadUsers(data.users, data.totalUsers);
        generatePagination(data.totalUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
    }

    $('#paginationControls').removeClass('d-none');
}
function generatePagination(totalUsers) {
    const totalPages = Math.ceil(totalUsers / limit);
    $('#paginationControls').empty();
    for (let i = 1; i <= totalPages; i++) {
        $('#paginationControls').append(`
            <li class="page-item ${i === page ? 'active' : ''}">
                <a class="page-link" href="#">${i}</a>
            </li>
        `);
    }
}
function changePage(newPage) {
    page = newPage;
    filterUsers();
}


async function changeAccess(email, access, card) {
    let data = { email: email, access: access };
    const d = await fetchData(data, '/updateAccessLevel', 'POST', null);
    console.log('data:', d);
    if (d) {
        $('#searchForm').submit();
    } else {
        alert('Error updating access level');
    }
}