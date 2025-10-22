export default async function fetchApi() {
  const url = "https://app.omie.com.br/api/v1/financas/mf/";
  
  const body = {
    call: "ListarMovimentos",
    app_key: "5614700718627",
    app_secret: "2ae8328ce879960d99ba83e7986805a3",
    param: [{
      "nPagina": 1,
      "nRegPorPagina": 500
    }]
  }
  try {
    const resposta = await fetch(url, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(body),
    });

    if (!resposta.ok) {
      throw new Error(`Erro HTTP: ${resposta.status}`);
    }

    const dados = await resposta.json();
    console.log("Dados recebidos:", dados);

  } catch (erro) {
    console.error("Erro ao puxar a API:", erro);
  }
}

// Para testar, você pode chamar a função:
fetchApi();
