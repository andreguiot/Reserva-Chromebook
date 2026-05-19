const API_URL = 'http://localhost:3000/api';

document.getElementById('form-login')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const senha = document.getElementById('senha').value;
    const erroDiv = document.getElementById('erro-login');
    const btn = document.querySelector('.btn-login');

    erroDiv.style.display = 'none';
    btn.textContent = 'Verificando...';
    btn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ senha })
        });

        const data = await response.json();

        if (data.success) {
            // Salvar token e redirecionar
            localStorage.setItem('adminToken', data.token);
            window.location.href = 'painel.html';
        } else {
            erroDiv.textContent = data.erro || 'Senha incorreta.';
            erroDiv.style.display = 'block';
            btn.textContent = 'Acessar Painel';
            btn.disabled = false;
        }
    } catch (error) {
        erroDiv.textContent = 'Erro de conexão com o servidor.';
        erroDiv.style.display = 'block';
        btn.textContent = 'Acessar Painel';
        btn.disabled = false;
    }
});
