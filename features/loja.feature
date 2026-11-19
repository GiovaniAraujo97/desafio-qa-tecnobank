# language: pt
Funcionalidade: Cadastro e carrinho de compras
  Como cliente da Demoblaze
  Quero criar uma conta e manipular produtos no carrinho
  Para validar os principais fluxos da loja

  Cenário: Cadastro de uma nova conta
    Dado que acesso a loja Demoblaze
    Quando cadastro uma conta com dados válidos
    Então recebo a confirmação de cadastro bem-sucedido

  Cenário: Tentativa de cadastro com usuário já existente
    Dado que acesso a loja Demoblaze
    E já existe uma conta com os dados de teste
    Quando tento cadastrar novamente os mesmos dados
    Então recebo a mensagem de usuário já existente

  Cenário: Remoção de monitor com persistência do carrinho
    Dado que acesso a loja Demoblaze
    Quando adiciono um celular, um monitor e um computador ao carrinho
    E removo o monitor do carrinho
    E atualizo a página do carrinho
    Então o monitor não está presente no carrinho
    E permanecem no carrinho o celular e o computador
