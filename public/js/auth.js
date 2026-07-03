const API_URL = '/api';

// Função chamada automaticamente pelo Google após o login bem-sucedido no popup
async function handleCredentialResponse(response) {
    const erroDiv = document.getElementById('erro-login');
    if (erroDiv) erroDiv.classList.add('d-none');

    try {
        const res = await fetch(`${API_URL}/auth/google`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ credential: response.credential })
        });

        const data = await res.json();

        if (data.success) {
            if (data.role === 'Admin') {
                sessionStorage.setItem('role', data.role);
                sessionStorage.setItem('nome', data.nome);
                // Redireciona para o painel se for Admin
                window.location.href = 'painel.html';
            } else {
                if (erroDiv) {
                    erroDiv.textContent = 'Acesso negado. Apenas administradores podem acessar o painel.';
                    erroDiv.classList.remove('d-none');
                }
            }
        } else {
            if (erroDiv) {
                erroDiv.textContent = data.erro || 'Acesso negado.';
                erroDiv.classList.remove('d-none');
            }
        }
    } catch (error) {
        if (erroDiv) {
            erroDiv.textContent = 'Erro de conexão com o servidor.';
            erroDiv.classList.remove('d-none');
        }
    }
}
