# brCryptoCommunity

A intenção desse projeto é a entrega de um local seguro para troca de conhecimento e interação da comunidade sem fins lucrativos.

Sabemos que nesse meio é muito difícil encontrar um local de navegação segura para interação entre pessoas e pretendo contribuir para desmistificar o tema abrindo um local onde todos possam contribuir ativamente para a propagação do conhecimento.

## Scripts

Iniciar serviços web e banco de dados (Docker):

    - npm run dev

Iniciar apenas os container de banco de dados(Docker):

    -npm run services:up

Parar serviços do banco de dados(Docker):

    - npm run services:stop

Derrubar serviços do banco de dados(Docker):

    - npm run services:down

Iniciar testes modo watch:

    - npm run test:watch

Criar Migration:

    - npm run migration:create

Subir uma Migration: ( já possuímos uma api responsável por isso )

    - npm run migration:up
