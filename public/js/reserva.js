const API_URL = '/api';
let tipoSelecionado = 'carrinho';

function clonar(templateId) {
    return document.getElementById(templateId).content.cloneNode(true);
}

// --- Carrinhos disponíveis ---

async function carregarCarrinhosDisponiveis() {
    const res = await fetch(`${API_URL}/carrinhos`);
    const carrinhos = await res.json();
    const select = document.getElementById('select-carrinho-reserva');

    // Manter apenas o placeholder
    while (select.options.length > 1) select.remove(1);

    carrinhos.forEach(c => {
        const clone = clonar('tpl-carrinho-opt');
        const opt = clone.querySelector('option');
        opt.value = c.id_carrinho;
        opt.textContent = `${c.descricao} (QTD: ${c.capacidade_total})`;
        select.appendChild(clone);
    });
}

// --- Tipo de reserva ---

function selecionarTipo(tipo) {
    tipoSelecionado = tipo;
    document.getElementById('btn-carrinho').classList.toggle('active', tipo === 'carrinho');
    document.getElementById('btn-individual').classList.toggle('active', tipo === 'individual');

    const opcaoCarrinho = document.getElementById('opcao-carrinho');
    const opcaoIndividual = document.getElementById('opcao-individual');

    if (tipo === 'carrinho') {
        opcaoCarrinho.classList.remove('d-none');
        opcaoIndividual.classList.add('d-none');
    } else {
        opcaoCarrinho.classList.add('d-none');
        opcaoIndividual.classList.remove('d-none');
    }

    document.getElementById('select-carrinho-reserva').required = tipo === 'carrinho';
    document.getElementById('quantidade').required = tipo === 'individual';
}

// --- Submissão do formulário ---

document.getElementById('form-reserva').addEventListener('submit', async (e) => {
    e.preventDefault();

    const body = {
        tipo_reserva: tipoSelecionado,
        nome_professor: document.getElementById('nome_professor').value,
        sala: document.getElementById('sala').value,
        data_reserva: document.getElementById('data_reserva').value,
        horario_inicio: document.getElementById('horario_inicio').value,
        horario_fim: document.getElementById('horario_fim').value,
        id_carrinho: tipoSelecionado === 'carrinho' ? document.getElementById('select-carrinho-reserva').value : null,
        quantidade_chromebooks: tipoSelecionado === 'individual' ? document.getElementById('quantidade').value : null
    };

    const token = localStorage.getItem('professorToken');

    const res = await fetch(`${API_URL}/reservas`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(body)
    });

    const msgSucesso = document.getElementById('msg-sucesso');
    const msgErro = document.getElementById('msg-erro');

    if (res.ok) {
        document.getElementById('form-reserva').reset();
        document.getElementById('data_reserva').min = new Date().toISOString().split('T')[0];
        msgErro.classList.add('d-none');
        msgSucesso.classList.remove('d-none');
        setTimeout(() => msgSucesso.classList.add('d-none'), 5000);
    } else {
        const data = await res.json();
        msgSucesso.classList.add('d-none');
        msgErro.textContent = `❌ ${data.erro}`;
        msgErro.classList.remove('d-none');
        setTimeout(() => msgErro.classList.add('d-none'), 8000);
    }
});

// --- Inicialização ---
carregarCarrinhosDisponiveis();
document.getElementById('data_reserva').min = new Date().toISOString().split('T')[0];

// --- Modal de Agenda ---

const modalAgenda = document.getElementById('modal-agenda');
const btnVerTabela = document.getElementById('btn-ver-tabela');
const btnFecharModal = document.getElementById('btn-fechar-modal');
const inputFiltroData = document.getElementById('filtro-data-agenda');

btnVerTabela.addEventListener('click', () => {
    modalAgenda.classList.remove('d-none');
    const hoje = new Date().toISOString().split('T')[0];
    inputFiltroData.value = hoje;
    carregarAgenda(hoje);
});

btnFecharModal.addEventListener('click', () => {
    modalAgenda.classList.add('d-none');
});

window.addEventListener('click', (e) => {
    if (e.target === modalAgenda) {
        modalAgenda.classList.add('d-none');
    }
});

inputFiltroData.addEventListener('change', (e) => {
    carregarAgenda(e.target.value);
});

async function carregarAgenda(data) {
    if (!data) return;

    const res = await fetch(`${API_URL}/reservas?data=${data}`);
    const reservas = await res.json();

    const tbody = document.getElementById('tbody-agenda');
    const msgSemReservas = document.getElementById('msg-sem-reservas');
    const tabela = document.querySelector('.tabela-reservas');

    // Limpar tbody
    while (tbody.firstChild) tbody.removeChild(tbody.firstChild);

    if (reservas.length === 0) {
        tabela.classList.add('d-none');
        msgSemReservas.classList.remove('d-none');
        return;
    }

    tabela.classList.remove('d-none');
    msgSemReservas.classList.add('d-none');

    reservas.forEach(r => {
        const clone = clonar('tpl-agenda-row');
        clone.querySelector('.td-horario strong').textContent = `${r.horario_inicio.slice(0, 5)} às ${r.horario_fim.slice(0, 5)}`;
        clone.querySelector('.td-equip').textContent = r.tipo_reserva === 'carrinho'
            ? `🛒 ${r.Carrinho ? r.Carrinho.descricao : 'Carrinho'}`
            : `💻 ${r.quantidade_chromebooks} Chromebook(s)`;
        clone.querySelector('.td-sala').textContent = r.sala;
        tbody.appendChild(clone);
    });
}

// --- Callback Google (login na tela de reservas) ---

async function handleCredentialResponseReserva(response) {
    const msgErro = document.getElementById('msg-erro');
    if (msgErro) msgErro.classList.add('d-none');

    try {
        const res = await fetch(`${API_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: response.credential })
        });

        const data = await res.json();

        if (data.success) {
            localStorage.setItem('professorToken', data.token);
            document.getElementById('google-login-container').classList.add('d-none');
            document.getElementById('form-reserva').classList.remove('d-none');
            document.getElementById('reserva-subtitulo').textContent = 'Preencha o formulário abaixo.';

            document.getElementById('nome_professor').value = data.nome || 'Professor';
        } else {
            msgErro.textContent = `❌ ${data.erro || 'Acesso negado.'}`;
            msgErro.classList.remove('d-none');
        }
    } catch (error) {
        msgErro.textContent = '❌ Erro de conexão com o servidor.';
        msgErro.classList.remove('d-none');
    }
}
