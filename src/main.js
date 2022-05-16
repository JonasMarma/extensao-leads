'use strict';

import * as scrap from "./scrap.js";


const periodo = 5000;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run2() {
    console.log("CONTENT JS RUNNING IN MAIN!");

    while (true) {
        await sleep(periodo);
        console.log("TICK!");

        // LINK //////////////////////////////////////////////////////////////////////////////////
        console.log("Extraindo link:");
        let link = window.location.toString();
        console.log(link);

        if (!(link.includes("linkedin.com/in/"))) {
            console.log("Não é página de perfil!");
            return;
        }
        
        console.log("É página de perfil!");

        let dados = Date.now().toString() + ";";

        dados = dados + window.location.toString() + ";"

        // OBTER O HTML DA PÁGINA

        let source = document.body.innerHTML;

        console.log(source);

        source = source.replace(/(\r\n|\n|\r)/gm, "");


        dados = dados + scrap.getNome(source) + ";";

        dados = dados + scrap.getCargo(source) + ";";

        dados = dados + scrap.getEmpresa(source) + ";";

        dados = dados + scrap.getFormacao(source) + ";";

        dados = dados + scrap.getAtividade(source) + ";";

        dados = dados + scrap.getSobre(source) + ";";

        dados = dados + scrap.getExp(source) + ";";

        dados = dados + scrap.getEdu(source) + ";";

        dados = dados + scrap.getCertificados(source) + ";";

        dados = dados + scrap.getCompetencias(source) + ";";

        console.log(dados);

        /*
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
        */

        break;
    }
}

run2();