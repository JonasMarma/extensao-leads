'use strict';

// Função para obter trecho do html:
function extraiInfo(source, inicio, fim) {
    let indiceInicio = source.indexOf(inicio);

    let sourceCortadoInicio = source.substring(indiceInicio + inicio.length);

    let indiceFim = sourceCortadoInicio.indexOf(fim);

    let isolado = sourceCortadoInicio.substring(0, indiceFim);

    isolado = isolado.trim();

    console.log(isolado);

    return isolado;
}


// NOME //////////////////////////////////////////////////////////////////////////////////
export function getNome(source) {

    let nome = extraiInfo(
        source,
        '<h1 class="text-heading-xlarge inline t-24 v-align-middle break-words">',
        '</h1>'
    );

    return nome;
}

// CARGO //////////////////////////////////////////////////////////////////////////////////
export function getCargo(source) {

    let cargo = extraiInfo(
        source,
        '<div class="text-body-medium break-words">',
        '</div>'
    );

    return cargo;
}

// EMPRESA //////////////////////////////////////////////////////////////////////////////////
export function getEmpresa(source) {

    let empresa = extraiInfo(
        source,

        'aria-label="Empresa atual">',
        '<!----></div>'
    );

    return empresa;
}

// FORMAÇÃO //////////////////////////////////////////////////////////////////////////////////
export function getFormacao(source) {

    let formacao = extraiInfo(
        source,
        'aria-label="Formação acadêmica">',
        '<!----></div>'
    );

    return formacao;
}

// ULTIMA ATIVIDADE //////////////////////////////////////////////////////////////////////////////////
export function getAtividade(source) {

    let searchStr = '• ';
    let indexes = [...source.matchAll(new RegExp(searchStr, 'gi'))].map(a => a.index);
    console.log(indexes);

    function hasNumber(myString) {
        return /\d/.test(myString);
    }

    let atividade = ";";

    for (const element of indexes) {
        let frag = source.substring(element + 2, element + 5);

        if (hasNumber(frag)) {
            console.log(frag);
            atividade =  atividade + frag + ",";
        }
    }

    return atividade;
}

/////////////////////////////////////////////////////////////////////////////////////////

/*
'<div id="recent_activity"'
'<div id="about"'
'<div id="experience"'
'<div id="education"'
'<div id="skills"'
'<div id="interests"'
*/