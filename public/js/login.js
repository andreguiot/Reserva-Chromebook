const API_URL = '/api';

// Elementos da interface
const formLogin = document.getElementById('form-login-local');
const msgErro = document.getElementById('msg-erro-login');
const msgSucesso = document.getElementById('msg-sucesso-login');
const toggleSenha = document.getElementById('toggle-senha');
const inputSenha = document.getElementById('senha');

// Alternar visibilidade da senha
toggleSenha.addEventListener('click', () => {
    if (inputSenha.type === 'password') {
        inputSenha.type = 'text';
        toggleSenha.classList.replace('fa-eye-slash', 'fa-eye');
    } else {
        inputSenha.type = 'password';
        toggleSenha.classList.replace('fa-eye', 'fa-eye-slash');
    }
});

// Lidar com Sucesso no Login e Redirecionamento
function processarLoginSucesso(data) {
    if (data.role === 'Admin') {
        localStorage.setItem('adminToken', data.token);
        window.location.href = 'painel.html';
    } else {
        localStorage.setItem('professorToken', data.token);
        window.location.href = 'reserva.html';
    }
}

// Submissão do Formulário 
formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    msgErro.style.display = 'none';
    msgSucesso.style.display = 'none';

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const bodyParams = { email, senha };

    try {
        const res = await fetch(API_URL + '/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyParams)
        });

        const data = await res.json();

        if (res.ok && data.success) {
            processarLoginSucesso(data);
        } else {
            msgErro.textContent = '❌ ' + (data.erro || 'Ocorreu um erro.');
            msgErro.style.display = 'block';
        }
    } catch (error) {
        msgErro.textContent = '❌ Erro de conexão com o servidor.';
        msgErro.style.display = 'block';
    }
});

// Callback do Botão do Google
async function handleGoogleLogin(response) {
    msgErro.style.display = 'none';
    msgSucesso.style.display = 'none';

    try {
        const res = await fetch(`${API_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: response.credential })
        });

        const data = await res.json();

        if (res.ok && data.success) {
            processarLoginSucesso(data);
        } else {
            msgErro.textContent = `❌ ${data.erro || 'Acesso negado.'}`;
            msgErro.style.display = 'block';
        }
    } catch (error) {
        msgErro.textContent = '❌ Erro de conexão com o servidor.';
        msgErro.style.display = 'block';
    }
}
