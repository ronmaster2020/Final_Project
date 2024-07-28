let limit = 10;
let page = 1;

async function loadUsers(users, totalUsers) {
    $('#users').empty();
    $('#searchResult').text(totalUsers + ' users found');

    let isAdmin = await fetchData({}, '/getAccessLevel', 'GET', null);
    users.forEach((s) => {
        let staffCard = $('<div class="col-12 col-xl-6"></div>');
        let adminCard = $('<div class="user-card"></div>');
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

        if (isAdmin.access === 'admin') {
            let changeBtn = $('<button class="btn btn-outline-primary" style="position:absolute; top:10px; right:10px;">Change Access</button>');
            let cancelBtn = $('<button class="btn btn-outline-danger" style="position:absolute; top:10px; right:10px; display: none;">Cancel</button>');
            let saveBtn = $('<button class="btn btn-outline-success" style="position:absolute; top:10px; right:110px; display: none;">Save</button>');
        
            changeBtn.on('click', (e) => {
                e.preventDefault();
                changeBtn.css('display', 'none');
                let originalAccess = s.access;
                let select = $('<select class="form-select" style="max-width: 10rem"><option value="admin" style="color: rgb(204, 0, 0)">Admin</option><option value="staff" style="color: rgb(0, 102, 255)">Staff</option><option value="user">User</option></select>');
                select.val(s.access);
                access.find('#access').replaceWith(select);
                cancelBtn.show();
                saveBtn.show();
        
                saveBtn.on('click', (e) => {
                    e.preventDefault();
                    let newAccess = select.val();
                    changeAccess(s.email, newAccess, adminCard);
                    select.replaceWith($('<p id="access">' + newAccess + '</p>'));
                    changeBtn.text('Change Access');
                    changeBtn.show();
                    cancelBtn.hide();
                    saveBtn.hide();
                });
        
                cancelBtn.on('click', (e) => {
                    e.preventDefault();
                    select.replaceWith($('<p id="access">' + originalAccess + '</p>'));
                    changeBtn.text('Change Access');
                    changeBtn.show();
                    cancelBtn.hide();
                    saveBtn.hide();
                });
            });
        
            adminCard.append(changeBtn, cancelBtn, saveBtn);
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