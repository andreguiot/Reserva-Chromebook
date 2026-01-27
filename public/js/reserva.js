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
        opt.textContent = `${c.descricao} (Cap: ${c.capacidade_total})`;
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
        document.getElementById('msg-sucesso').style.display = 'block';
        setTimeout(() => document.getElementById('msg-sucesso').style.display = 'none', 5000);
    } else {
        const data = await res.json();
        alert(`Erro: ${data.erro}`);
    }
});

carregarCarrinhosDisponiveis();

document.getElementById('data_reserva').min = new Date().toISOString().split('T')[0];
