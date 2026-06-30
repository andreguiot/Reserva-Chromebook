const API_URL = '/api';

const formDefinirSenha = document.getElementById('form-definir-senha');
const msgErro = document.getElementById('msg-erro-login');
const googleBtnWrapper = document.getElementById('google-btn-wrapper');

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

configurarToggleSenha('toggle-nova-senha', 'nova-senha');
configurarToggleSenha('toggle-confirmar-senha', 'confirmar-senha');

// --- Callback do Botão do Google ---
async function handleGoogleLogin(response) {
    msgErro.style.display = 'none';

    try {
        const res = await fetch(`${API_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: response.credential })
        });

        const data = await res.json();

        if (res.ok && data.success) {
            tokenProvisorio = data.token;

            // Mostrar formulário de nova senha
            document.querySelector('.login-left h1').textContent = 'Defina sua Nova Senha';
            document.querySelector('[style*="background-color: #e3f2fd"]').style.display = 'none';
            googleBtnWrapper.classList.add('d-none');
            formDefinirSenha.classList.remove('d-none');
        } else {
            msgErro.textContent = `❌ ${data.erro || 'Acesso negado.'}`;
            msgErro.style.display = 'block';
        }
    } catch (error) {
        msgErro.textContent = '❌ Erro de conexão com o servidor.';
        msgErro.style.display = 'block';
    }
}

// --- Submissão: Definir Nova Senha ---
formDefinirSenha.addEventListener('submit', async (e) => {
    e.preventDefault();
    msgErro.style.display = 'none';

    const novaSenha = document.getElementById('nova-senha').value;
    const confirmarSenha = document.getElementById('confirmar-senha').value;

    if (novaSenha !== confirmarSenha) {
        msgErro.textContent = '❌ As senhas não coincidem.';
        msgErro.style.display = 'block';
        return;
    }

    try {
        const res = await fetch(`${API_URL}/auth/definir-senha`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenProvisorio}`
            },
            body: JSON.stringify({ novaSenha, confirmarSenha })
        });

        const data = await res.json();

        if (res.ok && data.success) {
            if (data.role === 'Admin') {
                localStorage.setItem('adminToken', data.token);
                window.location.href = 'painel.html';
            } else {
                localStorage.setItem('professorToken', data.token);
                window.location.href = 'reserva.html';
            }
        } else {
            msgErro.textContent = '❌ ' + (data.erro || 'Erro ao definir senha.');
            msgErro.style.display = 'block';
        }
    } catch (error) {
        msgErro.textContent = '❌ Erro de conexão com o servidor.';
        msgErro.style.display = 'block';
    }
});
