const API_URL = '/api';

// Elementos da interface
const formLogin = document.getElementById('form-login-local');
const formDefinirSenha = document.getElementById('form-definir-senha');
const msgErro = document.getElementById('msg-erro-login');
const msgSucesso = document.getElementById('msg-sucesso-login');
const toggleSenha = document.getElementById('toggle-senha');
const inputSenha = document.getElementById('senha');

let tokenProvisorio = null;

// --- Utilitário: Alternar visibilidade de senha ---
function configurarToggleSenha(toggleId, inputId) {
    const toggle = document.getElementById(toggleId);
    const input = document.getElementById(inputId);
    if (!toggle || !input) return;
    toggle.addEventListener('click', () => {
        if (input.type === 'password') {
            input.type = 'text';
            toggle.classList.replace('fa-eye-slash', 'fa-eye');
        } else {
            input.type = 'password';
            toggle.classList.replace('fa-eye', 'fa-eye-slash');
        }
    });
}

configurarToggleSenha('toggle-senha', 'senha');
configurarToggleSenha('toggle-nova-senha', 'nova-senha');
configurarToggleSenha('toggle-confirmar-senha', 'confirmar-senha');

// --- Mostrar/Ocultar os modos da tela ---
function mostrarModoDefinirSenha() {
    document.querySelector('.login-left h1').textContent = 'Defina sua Senha';
    formLogin.classList.add('d-none');
    document.querySelector('.divider').classList.add('d-none');
    document.querySelector('.google-btn-wrapper').classList.add('d-none');
    formDefinirSenha.classList.remove('d-none');
}

// --- Redirecionar após login bem-sucedido ---
function processarLoginSucesso(data) {
    sessionStorage.setItem('role', data.role);
    sessionStorage.setItem('nome', data.nome);
    if (data.role === 'Admin') {
        window.location.href = 'painel.html';
    } else {
        window.location.href = 'reserva.html';
    }
}

// --- Submissão: Login Local (E-mail e Senha) ---
formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    msgErro.classList.remove('d-block');
    msgErro.classList.add('d-none');

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
        const res = await fetch(API_URL + '/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const data = await res.json();

        if (res.ok && data.success) {
            processarLoginSucesso(data);
        } else {
            msgErro.textContent = '❌ ' + (data.erro || 'Ocorreu um erro.');
            msgErro.classList.remove('d-none');
            msgErro.classList.add('d-block');
        }
    } catch (error) {
        msgErro.textContent = '❌ Erro de conexão com o servidor.';
        msgErro.classList.remove('d-none');
        msgErro.classList.add('d-block');
    }
});

// --- Callback do Botão do Google ---
async function handleGoogleLogin(response) {
    msgErro.classList.remove('d-block');
    msgErro.classList.add('d-none');

    try {
        const res = await fetch(`${API_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: response.credential })
        });

        const data = await res.json();

        if (res.ok && data.success) {
            if (data.precisaDefinirSenha) {
                tokenProvisorio = data.token;
                mostrarModoDefinirSenha();
            } else {
                processarLoginSucesso(data);
            }
        } else {
            msgErro.textContent = `❌ ${data.erro || 'Acesso negado.'}`;
            msgErro.classList.remove('d-none');
            msgErro.classList.add('d-block');
        }
    } catch (error) {
        msgErro.textContent = '❌ Erro de conexão com o servidor.';
        msgErro.classList.remove('d-none');
        msgErro.classList.add('d-block');
    }
}

// --- Submissão: Definir Senha (1º Acesso) ---
formDefinirSenha.addEventListener('submit', async (e) => {
    e.preventDefault();
    msgErro.classList.remove('d-block');
    msgErro.classList.add('d-none');

    const novaSenha = document.getElementById('nova-senha').value;
    const confirmarSenha = document.getElementById('confirmar-senha').value;

    if (novaSenha !== confirmarSenha) {
        msgErro.textContent = '❌ As senhas não coincidem.';
        msgErro.classList.remove('d-none');
        msgErro.classList.add('d-block');
        return;
    }

    try {
        const res = await fetch(`${API_URL}/auth/definir-senha`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ novaSenha, confirmarSenha })
        });

        const data = await res.json();

        if (res.ok && data.success) {
            processarLoginSucesso(data);
        } else {
            msgErro.textContent = '❌ ' + (data.erro || 'Erro ao definir senha.');
            msgErro.classList.remove('d-none');
            msgErro.classList.add('d-block');
        }
    } catch (error) {
        msgErro.textContent = '❌ Erro de conexão com o servidor.';
        msgErro.classList.remove('d-none');
        msgErro.classList.add('d-block');
    }
});
