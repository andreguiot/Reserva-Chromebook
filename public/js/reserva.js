const API_URL = '/api';
let tipoSelecionado = 'carrinho';

async function carregarCarrinhosDisponiveis() {
    const res = await fetch(`${API_URL}/carrinhos`);
    const carrinhos = await res.json();
    const select = document.getElementById('select-carrinho-reserva');
    select.innerHTML = '<option value="">Selecione um carrinho</option>';
    carrinhos.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id_carrinho;
        opt.textContent = `${c.descricao} (QTD: ${c.capacidade_total})`;
        select.appendChild(opt);
    });
}

function selecionarTipo(tipo) {
    tipoSelecionado = tipo;
    document.getElementById('btn-carrinho').classList.toggle('active', tipo === 'carrinho');
    document.getElementById('btn-individual').classList.toggle('active', tipo === 'individual');
    document.getElementById('opcao-carrinho').style.display = tipo === 'carrinho' ? 'flex' : 'none';
    document.getElementById('opcao-individual').style.display = tipo === 'individual' ? 'flex' : 'none';

    document.getElementById('select-carrinho-reserva').required = tipo === 'carrinho';
    document.getElementById('quantidade').required = tipo === 'individual';
}

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

    const res = await fetch(`${API_URL}/reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (res.ok) {
        document.getElementById('form-reserva').reset();
        document.getElementById('data_reserva').min = new Date().toISOString().split('T')[0];
        document.getElementById('msg-erro').style.display = 'none';
        document.getElementById('msg-sucesso').style.display = 'block';
        setTimeout(() => document.getElementById('msg-sucesso').style.display = 'none', 5000);
    } else {
        const data = await res.json();
        document.getElementById('msg-sucesso').style.display = 'none';
        const msgErro = document.getElementById('msg-erro');
        msgErro.innerText = `❌ ${data.erro}`;
        msgErro.style.display = 'block';
        setTimeout(() => msgErro.style.display = 'none', 8000);
    }
});

carregarCarrinhosDisponiveis();

document.getElementById('data_reserva').min = new Date().toISOString().split('T')[0];

/* Lógica da Tabela de Horários (Modal) */
const modalAgenda = document.getElementById('modal-agenda');
const btnVerTabela = document.getElementById('btn-ver-tabela');
const btnFecharModal = document.getElementById('btn-fechar-modal');
const inputFiltroData = document.getElementById('filtro-data-agenda');

btnVerTabela.addEventListener('click', () => {
    modalAgenda.style.display = 'flex';
    // Define a data de hoje por padrão ao abrir
    const hoje = new Date().toISOString().split('T')[0];
    inputFiltroData.value = hoje;
    carregarAgenda(hoje);
});

btnFecharModal.addEventListener('click', () => {
    modalAgenda.style.display = 'none';
});

// Fechar ao clicar fora do conteúdo
window.addEventListener('click', (e) => {
    if (e.target === modalAgenda) {
        modalAgenda.style.display = 'none';
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
    
    tbody.innerHTML = '';
    
    if (reservas.length === 0) {
        tabela.style.display = 'none';
        msgSemReservas.style.display = 'block';
        return;
    }
    
    tabela.style.display = 'table';
    msgSemReservas.style.display = 'none';
    
    reservas.forEach(r => {
        const tr = document.createElement('tr');
        const horario = `${r.horario_inicio.slice(0,5)} às ${r.horario_fim.slice(0,5)}`;
        const equipamento = r.tipo_reserva === 'carrinho' 
            ? `🛒 ${r.Carrinho ? r.Carrinho.descricao : 'Carrinho'}` 
            : `💻 ${r.quantidade_chromebooks} Chromebook(s)`;
        
        tr.innerHTML = `
            <td><strong>${horario}</strong></td>
            <td>${equipamento}</td>
            <td>${r.sala}</td>
        `;
        tbody.appendChild(tr);
    });
}
