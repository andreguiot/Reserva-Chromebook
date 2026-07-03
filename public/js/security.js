// Proteção do Frontend
if (sessionStorage.getItem('role') !== 'Admin') {
    window.location.href = 'logintela.html';
}

async function fazerLogout() {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch (e) {}
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('nome');
    window.location.href = 'logintela.html';
}
