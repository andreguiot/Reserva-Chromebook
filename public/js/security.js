// Proteção do Frontend
if (!localStorage.getItem('adminToken')) {
    window.location.href = 'logintela.html';
}

function fazerLogout() {
    localStorage.removeItem('adminToken');
    window.location.href = 'logintela.html';
}
