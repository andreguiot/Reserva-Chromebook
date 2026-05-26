const API_URL = '/api';

// --- Utilitários ---

function getAuthHeaders() {
    const token = localStorage.getItem('adminToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

function clonar(templateId) {
    return document.getElementById(templateId).content.cloneNode(true);
}

function limparEl(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
}

// --- Abas ---

function mudarAba(abaId) {
    document.querySelectorAll('.aba-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

    document.getElementById('aba-' + abaId).classList.add('active');
    event.currentTarget.classList.add('active');
}

// --- Carrinhos ---

async function carregarCarrinhos() {
    const res = await fetch(`${API_URL}/carrinhos`);
    const carrinhos = await res.json();

    const lista = document.getElementById('lista-carrinhos');
    const select = document.getElementById('select-carrinho');

    limparEl(lista);

    // Resetar o select mantendo o placeholder
    limparEl(select);
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Selecione o Carrinho';
    select.appendChild(placeholder);

    carrinhos.forEach(c => {
        // Item da lista
        const clone = clonar('tpl-carrinho-item');
        clone.querySelector('.carrinho-descricao').textContent = `${c.descricao} (QTD: ${c.capacidade_total})`;
        const btnDel = clone.querySelector('.btn-del');
        btnDel.addEventListener('click', () => deletarCarrinho(c.id_carrinho));
        lista.appendChild(clone);

        // Option do select
        const option = document.createElement('option');
        option.value = c.id_carrinho;
        option.textContent = c.descricao;
        select.appendChild(option);
    });
}

// --- Chromebooks ---

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
    limparEl(tabsContainer);

    if (chaves.length === 0) {
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.textContent = 'Nenhum chromebook cadastrado';
        li.appendChild(span);
        lista.appendChild(li);
        return;
    }

    if (!abaCarrinhoAtiva || !grupos[abaCarrinhoAtiva]) {
        abaCarrinhoAtiva = chaves[0];
    }

    // Renderizar Tabs
    chaves.forEach(id => {
        const btn = document.createElement('button');
        btn.textContent = grupos[id].desc;
        btn.className = id === abaCarrinhoAtiva ? 'tab-chromebook active' : 'tab-chromebook';
        btn.addEventListener('click', () => {
            abaCarrinhoAtiva = id;
            renderizarTabsChromebooks();
        });
        tabsContainer.appendChild(btn);
    });

    // Renderizar Lista do Carrinho Ativo
    limparEl(lista);
    const itensAtivos = grupos[abaCarrinhoAtiva].itens;

    if (itensAtivos.length === 0) {
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.textContent = 'Nenhum dispositivo neste carrinho';
        li.appendChild(span);
        lista.appendChild(li);
        return;
    }

    itensAtivos.forEach(c => {
        const clone = clonar('tpl-chromebook-item');
        clone.querySelector('.info-serie').textContent = `Série: ${c.numero_serie || 'N/A'}`;
        clone.querySelector('.info-pat').textContent = `Pat: ${c.id_patrimonio || 'N/A'}`;
        const btnDel = clone.querySelector('.btn-del');
        btnDel.addEventListener('click', () => deletarChromebook(c.id_chromebook));
        lista.appendChild(clone);
    });
}

// --- Formulários ---

document.getElementById('form-carrinho').addEventListener('submit', async (e) => {
    e.preventDefault();
    const descricao = document.getElementById('desc-carrinho').value;
    const capacidade_total = document.getElementById('cap-carrinho').value;

    await fetch(`${API_URL}/carrinhos`, {
        method: 'POST',
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
        body: JSON.stringify({ numero_serie, id_patrimonio, id_carrinho: id_carrinho || null })
    });

    e.target.reset();
    carregarChromebooks();
});

// --- Deleções ---

async function deletarCarrinho(id) {
    if (confirm('Deletar este carrinho?')) {
        await fetch(`${API_URL}/carrinhos/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
        carregarCarrinhos();
    }
}

async function deletarChromebook(id) {
    if (confirm('Deletar este chromebook?')) {
        await fetch(`${API_URL}/chromebooks/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
        carregarChromebooks();
    }
}

// --- Reservas ---

let reservaSelecionadaId = null;
let reservaSelecionadaTipo = null;

async function carregarReservas(status = '', data = '') {
    let url = `${API_URL}/reservas?`;
    if (status) url += `status=${status}&`;
    if (data) url += `data=${data}`;

    const res = await fetch(url);
    const reservas = await res.json();

    const lista = document.getElementById('lista-reservas');
    limparEl(lista);

    if (reservas.length === 0) {
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.textContent = '(Nenhuma reserva encontrada)';
        li.appendChild(span);
        lista.appendChild(li);
        return;
    }

    reservas.forEach(r => {
        const clone = clonar('tpl-reserva-item');

        const carrinho = r.Carrinho ? r.Carrinho.descricao : 'Individual';
        const tipo = r.tipo_reserva === 'carrinho' ? '🛒 Carrinho' : '💻 Individual';

        let statusBadge;
        if (r.status === 'pendente') statusBadge = '🟡 Pendente';
        else if (r.status === 'ativa') statusBadge = '🟢 Ativa';
        else if (r.status === 'atrasada') statusBadge = '🔴 Atrasada';
        else statusBadge = '⚫ Encerrada';

        clone.querySelector('.reserva-professor').textContent = r.nome_professor;
        clone.querySelector('.reserva-detalhes').textContent = `Sala: ${r.sala} | ${carrinho} | ${r.data_reserva}`;
        clone.querySelector('.reserva-horario').textContent = `${r.horario_inicio} – ${r.horario_fim} | ${tipo}`;
        clone.querySelector('.badge-status').textContent = statusBadge;

        const solicitanteEl = clone.querySelector('.reserva-solicitante');
        if (r.email_solicitante) {
            solicitanteEl.textContent = `📧 Solicitado por: ${r.email_solicitante}`;
        } else {
            solicitanteEl.remove();
        }

        const btnDev = clone.querySelector('.btn-devolucao');
        if (r.status === 'ativa' || r.status === 'atrasada') {
            btnDev.addEventListener('click', (ev) => encerrarReserva(r.id_reserva, ev));
        } else {
            btnDev.remove();
        }

        const li = clone.querySelector('.reserva-item');
        li.addEventListener('click', () => selecionarReserva(li, r));
        lista.appendChild(clone);
    });
}

// --- Seleção e Escaneamento ---

function deselecionarReserva() {
    document.querySelectorAll('.reserva-item').forEach(el => el.classList.remove('selecionada'));
    reservaSelecionadaId = null;
    reservaSelecionadaTipo = null;
    document.getElementById('scan-patrimonio').value = '';
    document.getElementById('scan-patrimonio').placeholder = 'Selecione uma reserva abaixo';
    limparEl(document.getElementById('chromebooks-escaneados'));
}

async function carregarChromebooksEscaneados(id_reserva) {
    const res = await fetch(`${API_URL}/reservas/${id_reserva}/chromebooks`, { headers: getAuthHeaders() });
    const itens = await res.json();
    const container = document.getElementById('chromebooks-escaneados');
    limparEl(container);

    if (!itens || itens.length === 0) {
        const clone = clonar('tpl-scan-vazio');
        container.appendChild(clone);
        return;
    }

    const titulo = document.createElement('h4');
    titulo.className = 'scan-devices-title';
    titulo.textContent = `Dispositivos Registrados (${itens.length})`;
    container.appendChild(titulo);

    const ul = document.createElement('ul');
    ul.className = 'scan-devices-list';

    itens.forEach(item => {
        const cb = item.Chromebook;
        const isDeslocado = item.status === 'deslocado';

        const clone = clonar('tpl-scan-device');
        const li = clone.querySelector('.scan-device-item');
        if (isDeslocado) li.classList.add('deslocado');

        clone.querySelector('.scan-device-pat').innerHTML = `Pat: <strong>${cb ? cb.id_patrimonio : 'N/A'}</strong>`;

        const serieSpan = clone.querySelector('.scan-device-serie');
        serieSpan.textContent = `Série: ${cb ? cb.numero_serie : 'N/A'}`;
        const carrinhoStrong = document.createElement('strong');
        carrinhoStrong.className = 'serie-carrinho';
        carrinhoStrong.textContent = `[${cb && cb.Carrinho ? cb.Carrinho.descricao : 'Sem Carrinho'}]`;
        serieSpan.appendChild(carrinhoStrong);

        const badge = clone.querySelector('.scan-badge');
        badge.className = isDeslocado ? 'badge-deslocado scan-badge' : 'badge-entregue scan-badge';
        badge.textContent = isDeslocado ? '⚠️ Deslocado' : '✅ Entregue';

        ul.appendChild(clone);
    });

    container.appendChild(ul);
}

function selecionarReserva(li, reserva) {
    document.querySelectorAll('.reserva-item').forEach(el => el.classList.remove('selecionada'));
    li.classList.add('selecionada');

    reservaSelecionadaId = reserva.id_reserva;
    reservaSelecionadaTipo = reserva.tipo_reserva;

    const input = document.getElementById('scan-patrimonio');
    input.placeholder = reserva.tipo_reserva === 'carrinho'
        ? 'Digite o patrimônio do carrinho'
        : 'Escaneie o patrimônio do Chromebook';
    input.value = '';
    input.focus();

    carregarChromebooksEscaneados(reserva.id_reserva);
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
        headers: getAuthHeaders(),
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

    deselecionarReserva();
    aplicarFiltros();
}

async function encerrarReserva(id, event) {
    event.stopPropagation();
    if (!confirm('Confirmar devolução desta reserva?')) return;

    const res = await fetch(`${API_URL}/reservas/${id}/encerrar`, { method: 'PUT', headers: getAuthHeaders() });
    if (res.ok) {
        aplicarFiltros();
    } else {
        const data = await res.json();
        alert(`Erro: ${data.erro}`);
    }
}

// --- Filtros ---

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

// --- Logout ---

function fazerLogout() {
    localStorage.removeItem('adminToken');
    window.location.href = 'admin.html';
}

// --- Inicialização ---
carregarCarrinhos();
carregarChromebooks();
carregarReservas();
