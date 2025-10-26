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
            <span>${c.descricao} (Cap: ${c.capacidade_total})</span>
            <button class="btn-del" onclick="deletarCarrinho(${c.id_carrinho})">X</button>
        `;
        lista.appendChild(li);

        const option = document.createElement('option');
        option.value = c.id_carrinho;
        option.textContent = c.descricao;
        select.appendChild(option);
    });
}

async function carregarChromebooks() {
    const res = await fetch(`${API_URL}/chromebooks`);
    const chromebooks = await res.json();
    
    const lista = document.getElementById('lista-chromebooks');
    lista.innerHTML = '';

    chromebooks.forEach(c => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>Série: ${c.numero_serie} | Pat: ${c.id_patrimonio}</span>
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
    if(confirm('Deletar este carrinho?')) {
        await fetch(`${API_URL}/carrinhos/${id}`, { method: 'DELETE' });
        carregarCarrinhos();
    }
}

async function deletarChromebook(id) {
    if(confirm('Deletar este chromebook?')) {
        await fetch(`${API_URL}/chromebooks/${id}`, { method: 'DELETE' });
        carregarChromebooks();
    }
}

carregarCarrinhos();
carregarChromebooks();
