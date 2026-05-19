// Proteção do Frontend
if (!localStorage.getItem('adminToken')) {
    window.location.href = 'admin.html';
}

function fazerLogout() {
    localStorage.removeItem('adminToken');
    window.location.href = 'admin.html';
}
