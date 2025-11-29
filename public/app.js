let pokemonsPrincipal = [];
let pokemonsExibir = [];
let paginacao = 1;
const limitePokemonsPg = 20;
let conteudo = '';
let tipoSelecionado = '';
const urlPokemons = 'https://pokeapi.co/api/v2/pokemon';
const urlPokemonsTipos = 'https://pokeapi.co/api/v2/type';

function navegacao() {
  const gridpokemons = document.getElementById('pokemonGrid');
  gridpokemons.innerHTML = '';

  let filtro = pokemonsExibir;
  if (conteudo !== '') {
    filtro = filtro.filter((pokemon) => pokemon.name.toLowerCase().includes(conteudo.toLowerCase())
                   || pokemon.id.toString().includes(conteudo));
  }

  for (let i = 0; i < filtro.length; i += 1) {
    const pokemon = filtro[i];
    const divPokemon = document.createElement('div');
    divPokemon.className = 'col-md-3';

    let html = `<div class="paginacao" onclick="detalhesPokemon(${pokemon.id})">`;
    html += `<img src="${pokemon.sprites.front_default}" class="i" alt="${pokemon.name}">`;
    html += `<h5 class="text-center">#${pokemon.id} ${pokemon.name.charAt(0).toUpperCase()}${pokemon.name.slice(1)}</h5>`;
    html += '<div class="text-center">';

    for (let j = 0; j < pokemon.types.length; j += 1) {
      const typeName = pokemon.types[j].type.name;
      html += `<span class="badge type-${typeName}">${typeName}</span> `;
    }

    html += '</div></div>';
    divPokemon.innerHTML = html;
    gridpokemons.appendChild(divPokemon);
  }

  document.getElementById('loading').style.display = 'none';
  document.getElementById('pokemonGrid').style.display = 'flex';

  if (tipoSelecionado !== '') {
    document.getElementById('pageInfo').textContent = `Mostrando ${filtro.length} pokémons`;
  } else {
    document.getElementById('pageInfo').textContent = `Página ${paginacao}`;
  }

  document.getElementById('prevBtn').disabled = paginacao === 1 || tipoSelecionado !== '';
  document.getElementById('nextBtn').disabled = tipoSelecionado !== '';
}

async function pesquisaPokemon() {
  document.getElementById('loading').style.display = 'flex';
  document.getElementById('pokemonGrid').style.display = 'none';

  try {
    const offset = (paginacao - 1) * limitePokemonsPg;
    const url = `${urlPokemons}?limit=${limitePokemonsPg}&offset=${offset}`;
    const responseURL = await fetch(url);
    const dadosurl = await responseURL.json();

    const promessaBusca = [];
    for (let i = 0; i < dadosurl.results.length; i += 1) {
      promessaBusca.push(fetch(dadosurl.results[i].url));
    }

    const responsePromessa = await Promise.all(promessaBusca);
    pokemonsPrincipal = [];
    for (let i = 0; i < responsePromessa.length; i += 1) {
      const pokemonJson = await responsePromessa[i].json();
      pokemonsPrincipal.push(pokemonJson);
    }

    pokemonsExibir = [...pokemonsPrincipal];
    navegacao();
    return true;
  } catch (error) {
    alert('Erro ao carregar Pokémons!');
    return 'erro ao carregar';
  }
}

async function iniciaApp() {
  document.getElementById('loading').innerHTML = '';
  for (let i = 0; i < 20; i += 1) {
    document.getElementById('loading').innerHTML += '<div class="col-md-3"><div class="skeleton"></div></div>';
  }

  try {
    const response = await fetch(urlPokemonsTipos);
    const dados = await response.json();
    const selecaoFiltro = document.getElementById('typeFilter');
    for (let i = 0; i < dados.results.length; i += 1) {
      const opcoesTipoPoke = document.createElement('option');
      opcoesTipoPoke.value = dados.results[i].name;
      opcoesTipoPoke.textContent = opcoesTipoPoke.value.charAt(0).toUpperCase() + opcoesTipoPoke.value.slice(1);
      selecaoFiltro.appendChild(opcoesTipoPoke);
    }
  } catch (err) {
    return 'erro';
  }
  pesquisaPokemon();
  return true;
}

async function pesquisaTipos() {
  document.getElementById('loading').style.display = 'flex';
  document.getElementById('pokemonGrid').style.display = 'none';

  try {
    const urlTipos = `${urlPokemonsTipos}/${tipoSelecionado}`;
    const responseTipos = await fetch(urlTipos);
    const dadosTipos = await responseTipos.json();

    const promessaTipos = [];
    const limitador100 = dadosTipos.pokemon.length > 100 ? 100 : dadosTipos.pokemon.length;
    for (let i = 0; i < limitador100; i += 1) {
      promessaTipos.push(fetch(dadosTipos.pokemon[i].pokemon.url));
    }

    const responsePromessa = await Promise.all(promessaTipos);
    pokemonsPrincipal = [];
    for (let i = 0; i < responsePromessa.length; i += 1) {
      const TiposJson = await responsePromessa[i].json();
      pokemonsPrincipal.push(TiposJson);
    }

    pokemonsExibir = [...pokemonsPrincipal];
    navegacao();
  } catch (error) {
    alert('Erro ao carregar Pokémons do tipo!');
    return 'erro ao carregar tipo';
  }
}

async function filtroTipo() {
  conteudo = document.getElementById('s').value;
  tipoSelecionado = document.getElementById('typeFilter').value;

  // Se tem filtro de tipo, busca pokémons daquele tipo
  if (tipoSelecionado !== '') {
    await pesquisaTipos();
  } else {
    navegacao();
  }
}

function resetFiltro() {
  document.getElementById('s').value = '';
  document.getElementById('typeFilter').value = '';
  conteudo = '';
  tipoSelecionado = '';
  paginacao = 1;
  pesquisaPokemon();
}

function paginaAnterior() {
  if (paginacao > 1) {
    paginacao -= 1;
    if (tipoSelecionado !== '') {
      navegacao();
    } else {
      pesquisaPokemon();
    }
  }
}

function proximaPagina() {
  paginacao += 1;
  if (tipoSelecionado !== '') {
    navegacao();
  } else {
    pesquisaPokemon();
  }
}

function modoEscuro() {
  document.body.classList.toggle('dark');
}

async function detalhesPokemon(id) {
  try {
    const buscaPokemonID = await fetch(`${urlPokemons}/${id}`);
    const pokemonIdJson = await buscaPokemonID.json();

    const buscaEspecie = await fetch(pokemonIdJson.species.url);
    const especieJson = await buscaEspecie.json();

    let descricao = '';
    for (let i = 0; i < especieJson.flavor_text_entries.length; i += 1) {
      if (especieJson.flavor_text_entries[i].language.name === 'en') {
        descricao = especieJson.flavor_text_entries[i].flavor_text;
        break;
      }
    }

    document.getElementById('modalTitle').textContent = `#${pokemonIdJson.id} ${pokemonIdJson.name.charAt(0).toUpperCase()}${pokemonIdJson.name.slice(1)}`;

    let modal = '<div class="row"><div class="col-md-6">';
    modal += '<div class="sprite-container">';
    modal += `<div><img src="${pokemonIdJson.sprites.front_default}" alt="front"><p class="text-center">Normal</p></div>`;
    modal += `<div><img src="${pokemonIdJson.sprites.front_shiny}" alt="shiny"><p class="text-center">Shiny</p></div>`;
    modal += '</div>';

    modal += '<p><strong>Tipo:</strong> ';
    for (let i = 0; i < pokemonIdJson.types.length; i + 1) {
      modal += `<span class="badge type-${pokemonIdJson.types[i].type.name}">${pokemonIdJson.types[i].type.name}</span> `;
    }
    modal += '</p>';

    modal += `<p><strong>Altura:</strong> ${pokemonIdJson.height / 10} m</p>`;
    modal += `<p><strong>Peso:</strong> ${pokemonIdJson.weight / 10} kg</p>`;

    modal += '<p><strong>Habilidades:</strong> ';
    for (let i = 0; i < pokemonIdJson.abilities.length; i += 1) {
      modal += pokemonIdJson.abilities[i].ability.name;
      if (i < pokemonIdJson.abilities.length - 1) modal += ', ';
    }
    modal += '</p>';

    modal += '</div><div class="col-md-6">';

    modal += '<p><strong>Descrição:</strong></p>';
    modal += `<p>${descricao.replace(/\filtroTipo/g, ' ')}</p>`;

    modal += '<h6>Estatísticas:</h6>';
    for (let i = 0; i < pokemonIdJson.stats.length; i += 1) {
      const statusPokemon = pokemonIdJson.stats[i];
      const porcentagem = (statusPokemon.base_stat / 255) * 100;
      modal += `<div><small>${statusPokemon.stat.name}: ${statusPokemon.base_stat}</small>`;
      modal += `<div class="statusPokemon-bar"><div class="statusPokemon-fill" style="width: ${porcentagem}%"></div></div></div>`;
    }

    modal += '</div></div>';

    document.getElementById('modalBody').innerHTML = modal;

    const mod = new bootstrap.Modal(document.getElementById('m'));
    mod.show();
  } catch (error) {
    console.log('erro');
    alert('Erro ao carregar detalhes!');
  }
}

window.onload = function exibir() {
  iniciaApp();
};
