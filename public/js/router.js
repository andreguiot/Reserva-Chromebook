document.addEventListener('DOMContentLoaded', () => {
    const adminToken = localStorage.getItem('adminToken');
    const professorToken = localStorage.getItem('professorToken');

    if (adminToken) {
        window.location.href = 'painel.html';
    } else if (professorToken) {
        window.location.href = 'reserva.html';
    } else {
        window.location.href = 'logintela.html';
    }
});
