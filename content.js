let dados = Date.now().toString() + ";";

var getByUniqueClass = className => {
    let data = document.getElementsByClassName(className).item(0).innerHTML;
    return data;
};

// DELAY PARA ESPERAR A PÁGINA CARREGAR

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
    for (let i = 0; i < 5; i++) {
        console.log(`Waiting ${i} seconds...`);
        await sleep(i * 1000);
    }

    // LINK //////////////////////////////////////////////////////////////////////////////////
    console.log("Extraindo link:");
    let link = window.location.toString();
    console.log(link);
    dados = dados + window.location.toString() + ";"

    if (!(link.includes("linkedin.com/in/"))) {
        console.log("Não é página de perfil!");
        return;
    }
    console.log("É página de perfil!");

    // OBTER O HTML DA PÁGINA

    let source = document.body.innerHTML;

    console.log(source);

    source = source.replace(/(\r\n|\n|\r)/gm, "");

    // Processamento do HTML:

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
    console.log("Extraindo nome:");
    dados = dados + extraiInfo(
        source,
        '<h1 class="text-heading-xlarge inline t-24 v-align-middle break-words">',
        '</h1>'
    ) + ";";


    // CARGO //////////////////////////////////////////////////////////////////////////////////
    console.log("Extraindo cargo:");
    dados = dados + extraiInfo(
        source,
        '<div class="text-body-medium break-words">',
        '</div>'
    ) + ";";

    // EMPRESA //////////////////////////////////////////////////////////////////////////////////
    console.log("Extraindo empresa:");
    dados = dados + extraiInfo(
        source,

        'aria-label="Empresa atual">',
        '<!----></div>'
    ) + ";";

    // FORMAÇÃO //////////////////////////////////////////////////////////////////////////////////
    console.log("Extraindo facul:");
    dados = dados + extraiInfo(
        source,
        'aria-label="Formação acadêmica">',
        '<!----></div>'
    ) + ";";

    // ULTIMA ATIVIDADE //////////////////////////////////////////////////////////////////////////////////

    console.log("Extraindo última atividade:");

    //let indiceBullet = source.indexOf('• ');

    let searchStr = '• ';
    let indexes = [...source.matchAll(new RegExp(searchStr, 'gi'))].map(a => a.index);
    console.log(indexes);

    function hasNumber(myString) {
        return /\d/.test(myString);
    }

    for (const element of indexes) {
        let frag = source.substring(element + 2, element + 5);

        if (hasNumber(frag)) {
            console.log(frag);
            dados = dados + frag + ",";
        }
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

    console.log(dados);

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

    url = 'https://script.google.com/macros/s/AKfycbw4wcMDi72KK5MP7JuZp3YuVvE7jhgKprsHfE23-QEgRBuBO_fiLG55MGqvUhYogn0qTg/exec?'

    url += 'name=' + dados;

    request.open('GET', url);
    request.send();

    console.log("PRONTO!");
}

run();
