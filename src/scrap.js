'use strict';

// Remover tags html, exemplo "<h1>Olá!!!</h1>"   -->  "Olá!!!"
function removeHtml(strInputCode) {
    return strInputCode.replace(/<\/?[^>]+(>|$)/g, "");
}

function higienizar(resposta) {
    resposta = removeHtml(resposta);

    if (resposta.length > 2000) {
        resposta = "";
    }

    return resposta;
}

// Função para obter trecho do html:
function extraiInfo(source, inicio, fim, log=false) {
    let indiceInicio = source.indexOf(inicio);

    let sourceCortadoInicio = source.substring(indiceInicio + inicio.length);

    let indiceFim = sourceCortadoInicio.indexOf(fim);

    let isolado = sourceCortadoInicio.substring(0, indiceFim);

    isolado = isolado.trim();

    if (log) {
        console.log(isolado);
    }

    return isolado;
}


// NOME //////////////////////////////////////////////////////////////////////////////////
export function getNome(source) {

    let nome = extraiInfo(
        source,
        '<h1 class="text-heading-xlarge inline t-24 v-align-middle break-words">',
        '</h1>'
    );

    return higienizar(nome);
}

// CARGO //////////////////////////////////////////////////////////////////////////////////
export function getCargo(source) {

    let cargo = extraiInfo(
        source,
        '<div class="text-body-medium break-words">',
        '</div>'
    );

    return higienizar(cargo);
}

// EMPRESA //////////////////////////////////////////////////////////////////////////////////
export function getEmpresa(source) {

    let empresa = extraiInfo(
        source,

        'aria-label="Empresa atual">',
        '<!----></div>'
    );

    return higienizar(empresa);
}

// FORMAÇÃO //////////////////////////////////////////////////////////////////////////////////
export function getFormacao(source) {

    let formacao = extraiInfo(
        source,
        'aria-label="Formação acadêmica">',
        '<!----></div>'
    );

    return higienizar(formacao);
}

// ULTIMA ATIVIDADE //////////////////////////////////////////////////////////////////////////////////
export function getAtividade(source) {

    let searchStr = '• ';
    let indexes = [...source.matchAll(new RegExp(searchStr, 'gi'))].map(a => a.index);

    function hasNumber(myString) {
        return /\d/.test(myString);
    }

    let atividades = [];

    for (const element of indexes) {
        let frag = source.substring(element + 2, element + 7);

        if (hasNumber(frag)) {

            console.log(frag);

            // Converter última atividade para horas
            let numSeparado = parseInt(frag.replace(/\D/g, ''));

            if (frag.includes("h")) { //hora
                numSeparado = numSeparado * 1;
            }
            else if (frag.includes("d")) { //dia
                numSeparado = numSeparado * 24;
            }
            else if (frag.includes("m")) { //mes
                numSeparado = numSeparado * 24 * 30;
            }
            else if (frag.includes("a")) { //mes
                numSeparado = numSeparado * 24 * 30 * 365;
            }

            atividades.push(numSeparado);
        }
    }

    console.log(atividades);

    return Math.min.apply(Math, atividades);
}

// SOBRE //////////////////////////////////////////////////////////////////////////////////
export function getSobre(source) {

    let divAbout = extraiInfo(
        source,
        '<div id="about"',
        'inline-show-more-text__button'
    );

    let descricao = extraiInfo(
        divAbout,
        'style="line-height:1.9rem;max-height:7.6rem;">',
        '</span><span class="visually-hidden">'
    );

    descricao = removeHtml(descricao);

    return higienizar(descricao);
}

// EXPERIENCIA //////////////////////////////////////////////////////////////////////////////////
export function getExp(source) {

    let dadosExp = "";

    let divExperiencia = extraiInfo(
        source,
        '<div id="experience"',
        '</section>'
    );

    /*
    Separar pelos href, cada href é uma experiência!
    */

    // Obter os indices onde ocorrem os href's
    let indices = [];

    let href = divExperiencia.indexOf("href");
    
    while (href != -1) {
        indices.push(href);
        href = divExperiencia.indexOf("href", href + 1);
    }

    // Dividir a string das experiências em substrings
    let trechos = [];

    for (var i = 0; i < indices.length; i++) {
        let trecho = "";
        // Se ainda não está no último trecho
        if (i+1 < indices.length) {
            trecho = divExperiencia.slice(indices[i], indices[i+1]);
            trechos.push(trecho);
        }
        // Se já está no último trecho
        else {
            trecho = divExperiencia.slice(indices[i]);
            trechos.push(trecho);
            break;
        }
    }
    
    for (var i = 0; i < trechos.length; i++) {
        let linkEmpresa = extraiInfo(
            trechos[i],
            '"',
            '"'
        );

        let cargo = extraiInfo(
            trechos[i],
            '<span aria-hidden="true">',
            '</span>'
        );

        // O cargo é extraído como "" quando o html está dando informação somente da empresa
        // Nesse caso, o par [link empresa] + [cargo] extraído não é válido
        // O próximo a ser extraído também não será, por isso incrementamos i.
        if (cargo == "") {
            i++;
        } else {
            dadosExp = dadosExp + linkEmpresa + ";" + cargo + ";";
        }
    }

    // Remover o ";" do final, ia ficar sobrando
    dadosExp = dadosExp.slice(0, -1)

    return higienizar(dadosExp);
}


// EDUCACAO //////////////////////////////////////////////////////////////////////////////////
export function getEdu(source) {

    let dadosEdu = "";

    let divEducacao = extraiInfo(
        source,
        '<div id="education"',
        '</section>'
    );

    /*
    Separar pelos href, cada href é uma experiência!
    */

    // Obter os indices onde ocorrem os href's
    let indices = [];

    let href = divEducacao.indexOf("href");
    
    while (href != -1) {
        indices.push(href);
        href = divEducacao.indexOf("href", href + 1);
    }

    // Dividir a string das experiências em substrings
    let trechos = [];

    for (var i = 0; i < indices.length; i++) {
        let trecho = "";
        // Se ainda não está no último trecho
        if (i+1 < indices.length) {
            trecho = divEducacao.slice(indices[i], indices[i+1]);
            trechos.push(trecho);
        }
        // Se já está no último trecho
        else {
            trecho = divEducacao.slice(indices[i]);
            trechos.push(trecho);
            break;
        }
    }
    
    for (var i = 0; i < trechos.length; i++) {
        
        // Se o trecho contém uma imagem (é só o logo), não tem informação da instituição ou da formação. Pular
        if (trechos[i].includes("image")) {
            continue;
        }

        let linkInstituicao = extraiInfo(
            trechos[i],
            '"',
            '"'
        );

        let curso = extraiInfo(
            trechos[i],
            '<span class="t-14 t-normal">',
            '</span>'
        );


        dadosEdu = dadosEdu + linkInstituicao + ";" + curso + ";";
        dadosEdu = removeHtml(dadosEdu);

    }

    // Remover o ";" do final, ia ficar sobrando
    dadosEdu = dadosEdu.slice(0, -1)

    return higienizar(dadosEdu);
}

// CERTIFICADOS //////////////////////////////////////////////////////////////////////////////////
export function getCertificados(source) {

    let dadosCert = "";

    let divCertificados = extraiInfo(
        source,
        '<div id="licenses_and_certifications"',
        '</section>'
    );

    /*
    Separar pelos href, cada href é uma experiência!
    */

    // Obter os indices onde ocorrem os href's
    let indices = [];

    let href = divCertificados.indexOf("href");
    
    while (href != -1) {
        indices.push(href);
        href = divCertificados.indexOf("href", href + 1);
    }

    // Dividir a string das experiências em substrings
    let trechos = [];

    for (var i = 0; i < indices.length; i++) {
        let trecho = "";
        // Se ainda não está no último trecho
        if (i+1 < indices.length) {
            trecho = divCertificados.slice(indices[i], indices[i+1]);
            trechos.push(trecho);
        }
        // Se já está no último trecho
        else {
            trecho = divCertificados.slice(indices[i]);
            trechos.push(trecho);
            break;
        }
    }
    
    for (var i = 0; i < trechos.length; i++) {

        let linkInstituicao = extraiInfo(
            trechos[i],
            '"',
            '"'
        );

        let curso = extraiInfo(
            trechos[i],
            '<span class="visually-hidden">',
            '</span>'
        );

        // Às vezes há muitos certificados, nesse caso, há um link para ver mais sobre o perfil. Ignorar o link
        if (linkInstituicao.includes("/in/")) {
            continue;
        }


        dadosCert = dadosCert + linkInstituicao + ";" + curso + ";";

    }

    // Remover o ";" do final, ia ficar sobrando
    dadosCert = dadosCert.slice(0, -1)

    return higienizar(dadosCert);
}


// COMPTENCIAS //////////////////////////////////////////////////////////////////////////////////
export function getCompetencias(source) {

    let dadosCert = "";

    let divCertificados = extraiInfo(
        source,
        '<div id="skills"',
        '</section>'
    );

    /*
    Separar pelos href, cada href é uma experiência!
    */

    // Obter os indices onde ocorrem os href's
    let indices = [];

    let separador = '<div class="display-flex align-items-center">'

    let href = divCertificados.indexOf(separador);
    
    while (href != -1) {
        indices.push(href);
        href = divCertificados.indexOf(separador, href + 1);
    }

    // Dividir a string das experiências em substrings
    let trechos = [];

    for (var i = 0; i < indices.length; i++) {
        let trecho = "";
        // Se ainda não está no último trecho
        if (i+1 < indices.length) {
            trecho = divCertificados.slice(indices[i], indices[i+1]);
            trechos.push(trecho);
        }
        // Se já está no último trecho
        else {
            trecho = divCertificados.slice(indices[i]);
            trechos.push(trecho);
            break;
        }
    }
    
    for (var i = 0; i < trechos.length; i++) {

        // Obter o nome da recomendação
        let curso = extraiInfo(
            trechos[i],
            '<span class="visually-hidden">',
            '</span>'
        );

        // Obter qtd de recomendações
        let nRecomendacao = extraiInfo(
            trechos[i],
            't-14 t-normal t-black">',
            '</span>'
        );

        // Limpar o n de recomendações para manter apenas numeros
        nRecomendacao = nRecomendacao.replace(/\D/g, '')


        dadosCert = dadosCert + curso + ";" + nRecomendacao + ";";
    }

    // Remover o ";" do final, ia ficar sobrando
    dadosCert = dadosCert.slice(0, -1)

    return higienizar(dadosCert);
}
