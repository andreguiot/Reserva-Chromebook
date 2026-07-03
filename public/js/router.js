document.addEventListener('DOMContentLoaded', () => {
    const role = sessionStorage.getItem('role');

    if (role === 'Admin') {
        window.location.href = 'painel.html';
    } else if (role === 'Comum') {
        window.location.href = 'reserva.html';
    } else {
        window.location.href = 'logintela.html';
    }
});
