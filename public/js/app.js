const API_URL = '/api';

function mudarAba(abaId) {
    document.querySelectorAll('.aba-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

    document.getElementById('aba-' + abaId).style.display = 'block';
    event.currentTarget.classList.add('active');
}

async function carregarCarrinhos() {
    const res = await fetch(`${API_URL}/carrinhos`);
    const carrinhos = await res.json();

    const lista = document.getElementById('lista-carrinhos');
    const select = document.getElementById('select-carrinho');

    lista.innerHTML = '';
    select.innerHTML = '<option value="">Selecione o Carrinho</option>';

    carrinhos.forEach(c => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${c.descricao} (QTD: ${c.capacidade_total})</span>
            <button class="btn-del" onclick="deletarCarrinho(${c.id_carrinho})">X</button>
        `;
        lista.appendChild(li);

        const option = document.createElement('option');
        option.value = c.id_carrinho;
        option.textContent = c.descricao;
        select.appendChild(option);
    });
}

let chromebooksData = [];
let abaCarrinhoAtiva = null;

async function carregarChromebooks() {
    const res = await fetch(`${API_URL}/chromebooks`);
    chromebooksData = await res.json();
    renderizarTabsChromebooks();
}

function renderizarTabsChromebooks() {
    const tabsContainer = document.getElementById('chromebooks-tabs');
    const lista = document.getElementById('lista-chromebooks');
    
    // Agrupar por carrinho
    const grupos = {};
    chromebooksData.forEach(c => {
        const id = c.id_carrinho || 'sem-carrinho';
        const desc = c.Carrinho ? c.Carrinho.descricao : 'Sem Carrinho';
        if (!grupos[id]) grupos[id] = { id, desc, itens: [] };
        grupos[id].itens.push(c);
    });

    const chaves = Object.keys(grupos);
    if (chaves.length === 0) {
        tabsContainer.innerHTML = '';
        lista.innerHTML = '<li><span>Nenhum chromebook cadastrado</span></li>';
        return;
    }

    if (!abaCarrinhoAtiva || !grupos[abaCarrinhoAtiva]) {
        abaCarrinhoAtiva = chaves[0];
    }

    // Renderizar Tabs
    tabsContainer.innerHTML = '';
    chaves.forEach(id => {
        const btn = document.createElement('button');
        btn.textContent = grupos[id].desc;
        btn.className = id === abaCarrinhoAtiva ? 'tab-btn active' : 'tab-btn';
        btn.style.padding = '6px 12px';
        btn.style.fontSize = '13px';
        btn.onclick = () => {
            abaCarrinhoAtiva = id;
            renderizarTabsChromebooks();
        };
        tabsContainer.appendChild(btn);
    });

    // Renderizar Lista do Carrinho Ativo
    lista.innerHTML = '';
    const itensAtivos = grupos[abaCarrinhoAtiva].itens;
    
    if (itensAtivos.length === 0) {
        lista.innerHTML = '<li><span>Nenhum dispositivo neste carrinho</span></li>';
        return;
    }

    itensAtivos.forEach(c => {
        const li = document.createElement('li');
        const serieInfo = c.numero_serie ? `Série: ${c.numero_serie}` : 'Série: N/A';
        li.innerHTML = `
            <span>${serieInfo} | Pat: ${c.id_patrimonio}</span>
            <button class="btn-del" onclick="deletarChromebook(${c.id_chromebook})">X</button>
        `;
        lista.appendChild(li);
    });
}

document.getElementById('form-carrinho').addEventListener('submit', async (e) => {
    e.preventDefault();
    const descricao = document.getElementById('desc-carrinho').value;
    const capacidade_total = document.getElementById('cap-carrinho').value;

    await fetch(`${API_URL}/carrinhos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descricao, capacidade_total })
    });

    e.target.reset();
    carregarCarrinhos();
});

document.getElementById('form-chromebook').addEventListener('submit', async (e) => {
    e.preventDefault();
    const numero_serie = document.getElementById('serie-chromebook').value;
    const id_patrimonio = document.getElementById('patrimonio-chromebook').value;
    const id_carrinho = document.getElementById('select-carrinho').value;

    await fetch(`${API_URL}/chromebooks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero_serie, id_patrimonio, id_carrinho: id_carrinho || null })
    });

    e.target.reset();
    carregarChromebooks();
});

async function deletarCarrinho(id) {
    if (confirm('Deletar este carrinho?')) {
        await fetch(`${API_URL}/carrinhos/${id}`, { method: 'DELETE' });
        carregarCarrinhos();
    }
}

async function deletarChromebook(id) {
    if (confirm('Deletar este chromebook?')) {
        await fetch(`${API_URL}/chromebooks/${id}`, { method: 'DELETE' });
        carregarChromebooks();
    }
}

let reservaSelecionadaId = null;
let reservaSelecionadaTipo = null;

async function carregarReservas(status = '', data = '') {
    let url = `${API_URL}/reservas?`;
    if (status) url += `status=${status}&`;
    if (data) url += `data=${data}`;

    const res = await fetch(url);
    const reservas = await res.json();

    const lista = document.getElementById('lista-reservas');
    lista.innerHTML = '';

    if (reservas.length === 0) {
        lista.innerHTML = '<li><span>(Nenhuma reserva encontrada)</span></li>';
        return;
    }

    reservas.forEach(r => {
        const li = document.createElement('li');
        li.classList.add('reserva-item');
        const carrinho = r.Carrinho ? r.Carrinho.descricao : 'Individual';
        const tipo = r.tipo_reserva === 'carrinho' ? '🛒 Carrinho' : '💻 Individual';

        let statusBadge;
        if (r.status === 'pendente') statusBadge = '🟡 Pendente';
        else if (r.status === 'ativa') statusBadge = '🟢 Ativa';
        else if (r.status === 'atrasada') statusBadge = '🔴 Atrasada';
        else statusBadge = '⚫ Encerrada';

        const btnDevolucao = (r.status === 'ativa' || r.status === 'atrasada')
            ? `<button class="btn-dev" onclick="encerrarReserva(${r.id_reserva}, event)">Registrar Devolução</button>`
            : '';

        li.innerHTML = `
            <div class="reserva-info">
                <strong>${r.nome_professor}</strong>
                <span>Sala: ${r.sala} | ${carrinho} | ${r.data_reserva}</span>
                <span>${r.horario_inicio} – ${r.horario_fim} | ${tipo}</span>
            </div>
            <div class="reserva-acoes">
                <span class="badge-status">${statusBadge}</span>
                ${btnDevolucao}
            </div>
        `;
        li.addEventListener('click', () => selecionarReserva(li, r));
        lista.appendChild(li);
    });
}

function selecionarReserva(li, reserva) {
    document.querySelectorAll('.reserva-item').forEach(el => el.classList.remove('selecionada'));
    li.classList.add('selecionada');

    reservaSelecionadaId = reserva.id_reserva;
    reservaSelecionadaTipo = reserva.tipo_reserva;

    const input = document.getElementById('scan-patrimonio');
    if (reserva.tipo_reserva === 'carrinho') {
        input.placeholder = 'Digite o patrimônio do carrinho';
    } else {
        input.placeholder = 'Escaneie o patrimônio do Chromebook';
    }
    input.value = '';
    input.focus();
}

async function validarReserva() {
    if (!reservaSelecionadaId) {
        alert('Selecione uma reserva na lista primeiro.');
        return;
    }

    const id_patrimonio = document.getElementById('scan-patrimonio').value.trim();
    if (!id_patrimonio) {
        alert('Digite ou escaneie o código de patrimônio.');
        return;
    }

    const endpoint = reservaSelecionadaTipo === 'carrinho'
        ? `${API_URL}/reservas/${reservaSelecionadaId}/validar`
        : `${API_URL}/reservas/${reservaSelecionadaId}/escanear`;

    const method = reservaSelecionadaTipo === 'carrinho' ? 'PUT' : 'POST';


    const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_patrimonio })
    });

    const data = await res.json();

    if (!res.ok) {
        alert(`Erro: ${data.erro}`);
        return;
    }

    if (data.alerta) {
        alert('⚠️ Atenção: Chromebook registrado como DESLOCADO (não pertence ao carrinho de origem desta reserva).');
    } else {
        alert('✅ Validado com sucesso!');
    }

    document.getElementById('scan-patrimonio').value = '';
    reservaSelecionadaId = null;
    reservaSelecionadaTipo = null;
    aplicarFiltros();
}

async function encerrarReserva(id, event) {
    event.stopPropagation();
    if (!confirm('Confirmar devolução desta reserva?')) return;

    const res = await fetch(`${API_URL}/reservas/${id}/encerrar`, { method: 'PUT' });
    if (res.ok) {
        aplicarFiltros();
    } else {
        const data = await res.json();
        alert(`Erro: ${data.erro}`);
    }
}

function aplicarFiltros() {
    const status = document.getElementById('filtro-status').value;
    const data = document.getElementById('filtro-data').value;
    carregarReservas(status, data);
}

function limparFiltros() {
    document.getElementById('filtro-status').value = '';
    document.getElementById('filtro-data').value = '';
    carregarReservas();
}

carregarCarrinhos();
carregarChromebooks();
carregarReservas();

