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

    /**
    Let ; be the special character
    If a ; is encountered in the input, replace it with something like ;0.
    Use ;; as your delimiter
    So userid = "alpha;dog" and userName = "papa;;0bear" will be translated to

    alpha;0dog;;papa;0;00bear
    */
    resposta = resposta.replace(";",";0")

    // Remover acentos
    resposta = resposta.normalize('NFD').replace(/[\u0300-\u036f]/g, "");

    // Remover demais caracteres especiais (menos o ; que é usado para separar)
    resposta = resposta.replace(/[^\w\s.,:;/]/gi, '')

    if (resposta == "") {
        resposta = "_";
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


// ARQUITETO //////////////////////////////////////////////////////////////////////////////////
function getArquiteto(source) {

    console.log("OBTENDO O ARQUITETO");

    let divNome = extraiInfo(
        source,
        '<div class="presence-entity presence-entity--size-1">',
        'id='
    );

    let nome = divNome.substring(divNome.indexOf("alt=")+5, divNome.length - 1);

    console.log(nome);

    return higienizar(nome);
}


// NOME //////////////////////////////////////////////////////////////////////////////////
function getNome(source) {

    let nome = extraiInfo(
        source,
        '<h1 class="text-heading-xlarge inline t-24 v-align-middle break-words">',
        '</h1>'
    );

    return higienizar(nome);
}

// CARGO //////////////////////////////////////////////////////////////////////////////////
function getCargo(source) {

    let cargo = extraiInfo(
        source,
        '<div class="text-body-medium break-words">',
        '</div>'
    );

    return higienizar(cargo);
}

// EMPRESA //////////////////////////////////////////////////////////////////////////////////
function getEmpresa(source) {

    let empresa = extraiInfo(
        source,

        'aria-label="Empresa atual">',
        '<!----></div>'
    );

    return higienizar(empresa);
}

// FORMAÇÃO //////////////////////////////////////////////////////////////////////////////////
function getFormacao(source) {

    let formacao = extraiInfo(
        source,
        'aria-label="Formação acadêmica">',
        '<!----></div>'
    );

    return higienizar(formacao);
}

// ULTIMA ATIVIDADE //////////////////////////////////////////////////////////////////////////////////
function getAtividade(source) {

    // Obter todos os lugares no source onde aparece '• ' - É onde ocorrem datas de atividade
    let searchStr = '• ';
    let indexes = [...source.matchAll(new RegExp(searchStr, 'gi'))].map(a => a.index);

    // Função para verificar se a string contém número
    function hasNumber(myString) {
        return /\d/.test(myString);
    }

    let atividades = [];

    for (const element of indexes) {
        let frag = source.substring(element + 2, element + 10);

        // Remover potenciais elementos html depois da parte de interesse
        if (frag.indexOf('"') != -1) {
            frag = frag.substring(0, frag.indexOf('"'));
        }
        if (frag.indexOf('<') != -1) {
            frag = frag.substring(0, frag.indexOf('<'));
        }

        if (hasNumber(frag)) {

            console.log(frag);

            // Converter última atividade para horas
            let numSeparado = parseInt(frag.replace(/\D/g, ''));

            if (frag.includes("min")) { // minutos
                numSeparado = 0;
            }
            else if (frag.includes("h")) { //hora
                numSeparado = numSeparado * 1;
            }
            else if (frag.includes("d")) { //dia
                numSeparado = numSeparado * 24;
            }
            else if (frag.includes("sem")) { //semana
                numSeparado = numSeparado * 24 * 7;
            }
            else if (frag.includes("m")) { //mes
                numSeparado = numSeparado * 24 * 30;
            }
            else if (frag.includes("a")) { //ano
                numSeparado = numSeparado * 24 * 30 * 365;
            }

            atividades.push(numSeparado);
        }
    }

    console.log(atividades);

    return Math.min.apply(Math, atividades);
}

// SOBRE //////////////////////////////////////////////////////////////////////////////////
function getSobre(source) {

    let divAbout = extraiInfo(
        source,
        '<div id="about"',
        '</section>'
    );

    let divVerMais = extraiInfo(
        divAbout,
        '<div class="pv-shared-text-with-see-more',
        '</div>'
    );

    let descricao = extraiInfo(
        divVerMais,
        '<span class="visually-hidden">',
        '</span>'
    );

    descricao = removeHtml(descricao);

    return higienizar(descricao);

}

// EXPERIENCIA //////////////////////////////////////////////////////////////////////////////////
function getExp(source) {

    let dadosExp = "";

    let divExperiencia = extraiInfo(
        source,
        '<div id="experience"',
        '</section>'
    );

    /*
    Separar pelos href, cada href é uma experiência!
    */

    let trechos = divExperiencia.split("href");
    trechos.shift();
    
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
function getEdu(source) {

    let dadosEdu = "";

    let divEducacao = extraiInfo(
        source,
        '<div id="education"',
        '</section>'
    );

    /*
    Separar pelos href, cada href é uma experiência!
    */

    let trechos = divEducacao.split("href");
    trechos.shift();
    
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

        // Às vezes há muitas instituições, nesse caso, há um link para ver mais sobre o perfil. Ignorar o link
        if (linkInstituicao.includes("/in/")) {
            continue;
        }

        dadosEdu = dadosEdu + linkInstituicao + ";" + curso + ";";
        dadosEdu = removeHtml(dadosEdu);

    }

    // Remover o ";" do final, ia ficar sobrando
    dadosEdu = dadosEdu.slice(0, -1)

    return higienizar(dadosEdu);
}

// CERTIFICADOS //////////////////////////////////////////////////////////////////////////////////
function getCertificados(source) {

    let dadosCert = "";

    let divCertificados = extraiInfo(
        source,
        '<div id="licenses_and_certifications"',
        '</section>'
    );

    /*
    Separar pelos href, cada href é uma experiência!
    */

    let trechos = divCertificados.split("href");
    trechos.shift();
    
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


// COMPETENCIAS //////////////////////////////////////////////////////////////////////////////////
function getCompetencias(source) {

    let dadosCert = "";

    let divCertificados = extraiInfo(
        source,
        '<div id="skills"',
        '</section>'
    );

    /*
    Separar pelos href, cada href é uma experiência!
    */

    let trechos = divCertificados.split("href");
    trechos.shift();
    
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

const periodo = 3000;

// Variável onde é armazenado o link que está sendo visitado no tick atual
let linkAtual = "";

// Variável onde é armazenado o link visitado no último tick
let linkAntigo = "";

let pagPerfil = false;

function enviarRequest(dados, codImplantacao) {
    // Enviar dados para sheets
    const request = new XMLHttpRequest();

    request.addEventListener('readystatechange', () => {
        if (request.readyState === 4 && request.status === 200) {
            console.log(request, request.responseText);
        } else if (request.readyState === 4) {
            //console.error("ERRO AO ACESSAR API" + request.response);
            console.log("Não recebeu 200");
        }
    });

    let url = 'https://script.google.com/macros/s/' + codImplantacao + '/exec?'

    url += 'data=' + btoa(dados);

    request.open('GET', url);
    request.send();

    console.log("PRONTO!");

    console.log(btoa(dados));
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function checkPagPerfil(link) {
    // Verificar se o link contém "linkedin.com/in/" (começam assim as páginas de perfil)
    if (link.includes("linkedin.com/in/")) {
        // Verificar se não é uma subpágina:
        // https://www.linkedin.com/in/lucas-mendes-0810631b6/                   -> OK!
        // https://www.linkedin.com/in/lucas-mendes-0810631b6/recent-activity/   -> Subpágina, desconsiderar!

        // O algoritmo divide em um vetor ["https:", "www.linkedin.com", "in", "nome", "possível", "subpagina"]
        // e verifica se tem tamanho 4 (quando é 4, é página de perfil)
        let partes = link.split("/");
        partes = partes.filter(item => (item != ''));

        if (partes.length == 4) {
            return true;
        }
    }

    return false;
}

function checkPagPessoas(link) {
    // Verificar se o link contém "linkedin.com/in/" (começam assim as páginas de perfil)
    if (!(link.includes("https://www.linkedin.com/company/") || link.includes("https://www.linkedin.com/school/"))) {
        return false;
    }

    if (!link.includes("/people/?")) {
        return false;
    }

    return true;
}

async function run() {
    console.log("CONTENT JS RUNNING IN MAIN!");

    let dadosPerfil = "";

    let dadosPerfilAntigo = "";

    let countPessoas = 0;

    while (true) {
        await sleep(periodo);

        console.log("TICK!");

        try {


            // LINK //////////////////////////////////////////////////////////////////////////////////
            console.log("Extraindo link:");
            linkAtual = window.location.toString();
            console.log(linkAtual);

            // Se acabou de sair de uma página de perfil, enviar os dados para o sheets
            if (linkAtual != linkAntigo) {
                if (pagPerfil) {
                    console.log("ENVIANDO DADOS PARA O SHEETS");
                    let dados = Date.now().toString() + ";;" + dadosPerfil;
                    enviarRequest(dados, 'AKfycbw4wcMDi72KK5MP7JuZp3YuVvE7jhgKprsHfE23-QEgRBuBO_fiLG55MGqvUhYogn0qTg');
                }
                // Está mudando de página de pessoas, reiniciar o contador
                countPessoas = 0;
            }

            // Se não está na página do linkedin, ignorar
            if (!(linkAtual.includes("linkedin"))) {
                console.log("Não está no linkedin");
                continue;
            }

            if (!checkPagPerfil(linkAtual)) {
                console.log("Não é página de perfil!");

                pagPerfil = false;
            }

            // Se é uma página de perfil, obter os dados do perfil
            else {
                console.log("É página de perfil!");

                pagPerfil = true;

                // OBTER O HTML DA PÁGINA
                let source = document.body.innerHTML;

                // Remover quebras de linha antes de processar
                source = source.replace(/(\r\n|\n|\r)/gm, "");

                // Obter nome do arquiteto
                dadosPerfil = getArquiteto(source) + ";;";

                // Obter o link atual
                dadosPerfil = dadosPerfil + linkAtual + ";;"

                // Fazer o scrapping
                dadosPerfil = dadosPerfil + getNome(source) + ";;";

                dadosPerfil = dadosPerfil + getCargo(source) + ";;";

                dadosPerfil = dadosPerfil + getEmpresa(source) + ";;";

                dadosPerfil = dadosPerfil + getFormacao(source) + ";;";

                dadosPerfil = dadosPerfil + getAtividade(source) + ";;";

                dadosPerfil = dadosPerfil + getSobre(source) + ";;";

                dadosPerfil = dadosPerfil + getExp(source) + ";;";

                dadosPerfil = dadosPerfil + getEdu(source) + ";;";

                //dadosPerfil = dadosPerfil + getCertificados(source) + ";;";

                dadosPerfil = dadosPerfil + getCompetencias(source) + ";;";

                console.log(dadosPerfil);

                // Se os dados mudaram desde o último tick, enviar novamente!
                if (dadosPerfil != dadosPerfilAntigo) {
                    // Os dados do perfil serão enviados quando o usuário mudar de página
                    console.log("ENVIANDO DADOS PARA O SHEETS");
                    let dados = Date.now().toString() + ";;" + dadosPerfil;
                    enviarRequest(dados, 'AKfycbw4wcMDi72KK5MP7JuZp3YuVvE7jhgKprsHfE23-QEgRBuBO_fiLG55MGqvUhYogn0qTg');
                }

                dadosPerfilAntigo = dadosPerfil;
            }

            if (checkPagPessoas(linkAtual)) {
                console.log("É uma página de pessoas!");

                // Fazer scrapping de links de perfis
                let source = document.body.innerHTML;

                // Remover quebras de linha antes de processar
                source = source.replace(/(\r\n|\n|\r)/gm, "");

                //console.log(source);
                
                let ulPessoas = extraiInfo(
                    source,
                    '<ul class="display-flex list-style-none flex-wrap">',
                    '</ul>'
                );

                let listaPessoas = ulPessoas.split("<li class");

                listaPessoas.shift();

                let dados = "";

                let arquiteto = getArquiteto(source);

                // Obter a empresa a partir do link
                let empresa = linkAtual.split("/")[4];

                for (var i = countPessoas; i < listaPessoas.length; i++) {
                    // Extrair o link do perfil
                    let link = extraiInfo(
                        listaPessoas[i],
                        'href="',
                        '"'
                    );

                    // Extrair o nome do perfil
                    let nome = extraiInfo(
                        listaPessoas[i],
                        'class="org-people-profile-card__profile-title t-black lt-line-clamp lt-line-clamp--single-line ember-view">',
                        '</div>'
                    );
                    nome = higienizar(nome);

                    // Extrair o cargo do perfil
                    let cargo = extraiInfo(
                        listaPessoas[i],
                        'style="-webkit-line-clamp: 2">',
                        '</div>'
                    );
                    cargo = higienizar(cargo);

                    dados = dados + Date.now().toString() + ";;" + arquiteto + ";;"+ empresa + ";;" + link + ";;" + nome + ";;" + cargo + "//";
                }

                // Enviar o request somente se os contadores forem diferentes, o que acontece se houve uma atualização no num pessoas
                if (countPessoas != listaPessoas.length) {
                    enviarRequest(dados, 'AKfycbzuG7SjY-__iOjIdk8QSvJkfjlscLwPx2UZzYwJXrgdxopBfSdgiXmYmk8B8fNDJ-0U');
                }

                // Atualizar a contagem de pessoas já enviadas para o sheets nessa página
                countPessoas = listaPessoas.length;
            }

        } catch (error) {
            console.error(error);
        }

        // A cada tick atualizar o link antigo
        linkAntigo = linkAtual;

    }
}

run();
