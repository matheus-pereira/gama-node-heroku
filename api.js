/*
    --HEROKU
        Instalamos o heroku cli, via 
        npm i -g heroku
        heroku --version

        git init

        para listar as aplicações no heroku

        heroku apps

        para criar uma aplicação

        heroku apps:create nomeUnicoDoApp

    --DOT ENV CONFIGURAÇÃO DE AMBIENTES
        Para dividir os ambientes, entre produção e desenvolvimento

        - desenvolvimento => banco local, aplicação local, jwt local
        - produção =>

        para dividir os valores, vamos pegar os valores a partir
        de variáveis de ambiente (.env)

        npm i dotenv

        Criamos a pasta de configuração para diferenciar os ambientes

        no WINDOWS, temos alguns problemas de ambiente, entre sistemas operacionais
        no LINUX para setar uma variável
            NOME_VARIAVEL=123
        no WINDOWS
            set NOME_VARIAVEL=123
        
        Para lidar com essa diferença entre as plataformas:

            npm i cross-env --save-dev //o save-dev para que não vá para produção
            npm i -g cross-env

        Criamos dois scripts no package.json para inicializar a aplicação

        por padrão, o NPM tem padrões
        start, test, preinstall, postinstall

        Caso não usemos esses scripts pré-definidos, precisamos adicionar a palavra run

            npm run prod

        
        Para receber os dados da variável na aplicação
        1) Obter ambiente atual:
            if(process.env.NODE_ENV === 'production')
                //chama as variáveis de produção
            console.log(process.env.MONGO_URL)
        Trabalhando com desenvolvimento, pode-se deixar NODE_ENV vazio (considerar como padrão) ou defini-lo como desenvolvimento.
        O importante é validar se está em produção

    


    --JSON WEB TOKEN
        Para trabalhar com APIs restful, não trabalhamos come estado,
        quando uma requisição acontece, o recurso acontece.
        não é possível manipular o usuário anterior e nem o próximo.

        O padrão JWT, prega que, usamos para autenticar o melhor computador do mundo.

        Para cada requisição, o usuário deve passar um token válido para um token válido,
        nos HEADERS da aplicação.
        Mas MUITO CUIDADO, o JWT Token não é criptografado - suas informações são acessíveis,
        porém usuários mal intencionados não conseguem gerar uma nova chave.

        A partir do token, é possível verificar sua composição e sua expiração, 
        porém um usuário mal intencionado não consegue gerar uma chave a partir do front end.

        Para traballhar com o JWT, instalamos

        npm i jsonwebtoken

    --BLOQUEANDO ACESSO A ROTAS
        Para bloquear as rotas e criar um acesso padrão,
        instalamos um plugin do Hapi.js para criar a autenticação baseada no JWT

        npm i hapi-auth-jwt2

        1) Registrar o plugin
        2) Criar a configuração de estratégia de autenticação
        3) Criar uma função para validar as requisições

    --ATUALIZANDO O SERVIDOR DE TESTES NODE
        Para evitar reiniciar o código toda vez,
        instalamos uma bibilioteca para observar as modificações no projeto

        npm i -g nodemon

        nodemon api.js

    --REST / RESTFUL

        REST: Seguir parte da padronização
        RESTFUL: Seguir a documentação à risca

        RESTFUL
        O padrão Restful é usado para lidar com aplicações stateless (sem estado)
        O cliente corrente não sabe a requisição anterior (não guarda sessão).

        O retorno é sempre em JSON (Javascript Object Notation
        No padrão REST usamos o padrão de respostas HTTP

        DEU BOM -> Código 200
        DEU RUIM -> Código 500
        NÃO ENCONTROU -> Código 404

        O padrão REST é uma sequência de convenções (não é um projeto)

        BASE: Publicações (resource)
    ==============================================================================================================
    AÇÃO            MÉTODO          URL                         BODY

    Cadastrar       POST            /publicacoes                {nome: usuario}
    Listar          GET             /publicacoes?limit=10
    Detalhe         GET             /publicacoes/:id
    Remover         DELETE          /publicacoes/:id
    Alterar         PATCH           /publicacoes/:id            {nome: usuario} (alteração parcial)
                    PUT             /publicacoes/:id            {nome: usuario, idade: 200} (alteração completa)
    Detalhe         GET             /publicacoes/:id/comentarios?limit=10
    Detalhe         GET             /publicacoes/:id/comentarios/:id (usado para obter)
    ==============================================================================================================
    npm i hapi
*/
//Teste rápido
// const http = require('http')
// http
//     .createServer((request, response) => {
//         response.end('Olá Node.js')
//     })
//     .listen(3000, () => console.log('servidor rodando!!'))


/*
    
    

*/

const {
    config
} = require('dotenv');
if (process.env.NODE_ENV === 'production') {
    config({
        path: './config/.env.prod'
    });

    swaggerHostConfig.host = process.env.HOST;
    swaggerHostConfig.schemes = ['https'];
} else config({
    path: './config/.env.dev'
});

/*

    Para validar as requisições 
    e evitar problemas com tipagem, nome de campo ou dado obrigatório
    instalamos o JOI (Object Validation)
    npm i joi

*/
//Usando HAPI 
const Hapi = require('hapi')
//Após instalar o Joi, inserir sua chamada nas rotas
const Joi = require('joi')
//npm i boom
const Boom = require('boom')

//instalamos 3 módulos para documentar o projeto
const Vision = require('vision')
const Inert = require('inert')
const HapiSwagger = require('hapi-swagger')
//apos importar os módulos, configuramos o swagger
const SwaggerConfig = {
    info: {
        title: 'API de Publicações',
        version: '1.0',
    },
    lang: 'pt',
    ...swaggerHostConfig,
}

//Importando o JWT para gerenciar os tokens
const Jwt = require('jsonwebtoken')
const MY_SECRET_KEY = process.env.JWT_KEY;
const USER = {
    username: process.env.USER_USERNAME,
    password: process.env.USER_PASSWORD
}
const HapiJwt = require('hapi-auth-jwt2');

//Importando o banco de dados
const DatabasePosts = require('./databasePosts')

function validateHeaders() {
    return Joi.object({
        authorization: Joi.string().required(),
    }).unknown();
}

function validatePostPayload() {
    return {
        description: Joi.string().required(),
        link: Joi.string().min(3).max(200),
        publishedAt: Joi.date().required(),
        user: Joi.object().keys({
            name: Joi.string().required(),
            photo: Joi.string().required().min(3).min(200)
        }),
        comments: Joi.array().required()
    }
}

function validatePatchPayload() {
    return {
        description: Joi.string(),
        link: Joi.string().min(3).max(200),
        publishedAt: Joi.date(),
        user: Joi.object().keys({
            name: Joi.string(),
            photo: Joi.string().min(3).min(200)
        }),
        comments: Joi.array()
    }
}
async function main() {
    try {
        //Inicializando o banco de dados
        const connection = DatabasePosts.conectar()
        const posts = new DatabasePosts(connection)

        //1- Instanciando servidor, passando a porta
        const app = Hapi.Server({
            port: process.env.PORT,
        })

        await app.register([
            Vision,
            Inert,
            {
                plugin: HapiSwagger,
                options: SwaggerConfig,
            },
            HapiJwt
        ]);

        app.auth.strategy('jwt', 'jwt', {
            key: MY_SECRET_KEY,

            verifyOptions: {
                algorithms: ['HS256'],
            },
            validate: (data, request, callback) => {
                //Aqui podemos realizar alguma validação adicional do usuário, além
                //da chave válida
                //Verificar se existe ou se pagou conta, etc

                //caso tudo esteja validado
                return {
                    isValid: true
                }
            }
        });
        //Registrando a estratégia default de autenticação
        app.auth.default('jwt');
        //Após a instalaçao da configuração, adicionamos as tags do swagger nas rotas
        //Após adicionar as tags: localhost:PORT/documentation

        //2- Definindo a rota (preferível deixar rotas em arquivo separado)
        app.route([
            //Criando objeto para trabalhar com a rota
            {
                path: '/login',
                method: 'POST',
                handler: async (req, h) => {
                    const {
                        username,
                        password
                    } = req.payload
                    //Comparando dados recebidos com os que possuímos.
                    //Usando toLowerCase para comparar os nomes de usuário (não a senha, hein!)
                    if (username.toLowerCase() !== USER.username.toLowerCase() ||
                        password !== USER.password)
                        return Boom.unauthorized('You shall not pass');
                    const tokenData = {
                        username,
                        company: 'record.com',

                    };
                    const token = Jwt.sign(tokenData, MY_SECRET_KEY);
                    return {
                        token
                    }
                },
                config: {
                    tags: ['api'],
                    description: 'Geração de token para usuário',
                    //Desativando a validação de token da rota de login
                    auth: false,
                    validate: {
                        payload: {
                            username: Joi.string().max(50).required(),
                            password: Joi.string().max(100).required()
                        }
                    }
                }
            },
            {
                //Definindo o método http
                method: 'GET',
                //Definimos o endereõ
                path: '/posts',
                //Executa alguma coisa (precisa ser aqui embaixo, junto das rotas)
                handler: async (req, h) => {
                    try {
                        //pegamos os parametros da URL
                        const {
                            limitar,
                            ignorar
                        } = req.query;
                        //Primeiro parâmetro da função listar leva o objeto para busca
                        //O segundo parâmetro passa as condições para a busca
                        const resultado = await posts
                            .listar({}, {
                                limitar,
                                ignorar
                            });
                        return resultado
                    } catch (error) {
                        console.log('DEU RUIM', error)
                        //Hapi tem um módulo interno chamado Boom, para manipular erros de conexão
                        return Boom.internal()
                    }
                },
                config: {
                    //informando configurações da rota
                    tags: ['api'],
                    description: 'Lista posts paginados',
                    validate: {
                        //Inserindo validação de headers antes de todas as outras validações
                        headers: validateHeaders(),
                        /*  usamos o objeto validate para validar requisições (apoiado pelo Joi)
                            ele valida a requisição antes de chamar o handler

                            payload -> body
                            headers
                            queryString
                            params as url
                        */
                        //Caso usuário envie informação incorreta (disponível a partir do Hapi 17)
                        failAction: (request, h, err) => {
                            throw err
                        },
                        query: {
                            //Definindo argumentos para validação e um valor padrão
                            //Joi intercepta validação e evita SQL Injection
                            ignorar: Joi.number().integer().required().default(0),
                            limitar: Joi.number().integer().default(10)
                        },
                    }
                }
            },
            {
                //Definindo o método http
                method: 'GET',
                //Definimos o endereõ
                path: '/posts/{id}',
                //Executa alguma coisa (precisa ser aqui embaixo, junto das rotas)
                handler: async (request, h) => {
                    try {
                        const {
                            id
                        } = request.params
                        const resultado = await posts.listar({
                            _id: id,
                        })
                        return resultado
                    } catch (error) {

                        console.log('DEU RUIM', error)
                        return Boom.internal();
                    }
                },
                config: {
                    tags: ['api'],
                    description: 'Lista todos os posts a partir de ID do usuário',
                    notes: 'O ID deve ser válido',
                    validate: {
                        headers: validateHeaders(),
                        //Caso usuário envie informação incorreta (disponível a partir do Hapi 17)
                        failAction: (request, h, err) => {
                            throw err
                        },
                        params: {
                            id: Joi.string().min(3).max(200)
                        }
                    },
                },
            },
            {
                //Definindo o método http
                method: 'GET',
                //Definimos o endereõ
                path: '/posts/{postId}/comments/{commentId}',
                //Executa alguma coisa (precisa ser aqui embaixo, junto das rotas)
                handler: async (request, h) => {
                    try {
                        const {
                            postId,
                            commentId
                        } = request.params
                        const resultado = await posts.listar({
                            _id: postId,
                            //entramos em comments e buscamos por id
                            'comments._id': commentId,
                        })
                        //usando map para mapear resultados que tem a id do comentário que buscamos
                        //resultados são buscados usando find nos comentários do post encontrado
                        const resultadoMapeado = resultado.map(item => {
                            item.comments = item.comments.find(comment => comment._id === commentId)
                            return item
                        })
                        return resultadoMapeado
                    } catch (error) {

                        console.log('DEU RUIM', error)
                        return Boom.internal();
                    }
                },
                config: {
                    //adicionamos a tag do swagger para visualizar esta rota
                    tags: ['api'],
                    description: 'Lista comentário selecionado em post específico',
                    notes: 'O ID do post e do comentário deve ser válidos',
                    //Abaixo as validações do Hapi e Joi
                    validate: {
                        headers: validateHeaders(),
                        //Caso usuário envie informação incorreta (disponível a partir do Hapi 17)
                        failAction: (request, h, err) => {
                            throw err
                        },
                        params: {
                            postId: Joi.string().max(200).required(),
                            commentId: Joi.string().min(3).max(200)
                        }
                    },
                },
            },
            {
                //Definindo o método http
                method: 'POST',
                //Definimos o endereõ
                path: '/posts',
                //Executa alguma coisa (precisa ser aqui embaixo, junto das rotas)
                handler: async (request, h) => {
                    try {
                        const item = request.payload
                        const resultado = await posts.cadastrar(item)
                        return resultado
                    } catch (error) {

                        console.log('DEU RUIM', error)
                        return Boom.internal();
                    }
                },
                config: {
                    tags: ['api'],
                    description: 'Cadastra novo post com comentário',
                    validate: {
                        headers: validateHeaders(),
                        //Caso usuário envie informação incorreta (disponível a partir do Hapi 17)
                        failAction: (request, h, err) => {
                            throw err
                        },
                        payload: validatePostPayload(),
                    },
                },
            },
            {
                //Definindo o método http
                method: 'DELETE',
                //Definimos o endereõ
                path: '/posts/{id}',
                //Executa alguma coisa (precisa ser aqui embaixo, junto das rotas)
                handler: async (request, h) => {
                    try {
                        const {
                            id
                        } = request.params
                        const resultado = await posts.remover(id)
                        return resultado
                    } catch (error) {

                        console.log('DEU RUIM', error)
                        return Boom.internal();
                    }
                },
                config: {
                    tags: ['api'],
                    description: 'Apaga post específico',
                    notes: 'O id deve ser válido',
                    validate: {
                        headers: validateHeaders(),
                        //Caso usuário envie informação incorreta (disponível a partir do Hapi 17)
                        failAction: (request, h, err) => {
                            throw err
                        },
                        params: {
                            id: Joi.string().min(3).max(200)
                        }
                    },
                },
            },
            {
                method: 'PATCH',
                path: '/posts/{id}',
                handler: async (request, h) => {
                    try {
                        const {
                            id
                        } = request.params
                        const post = request.payload
                        const result = await posts.atualizar(id, post)
                        return result
                    } catch (error) {
                        console.error(error);
                        return Boom.internal()
                    }
                },
                config: {
                    tags: ['api'],
                    description: 'Atualiza post parcialmente',
                    notes: 'O ID do post e seus dados devem ser válidos',
                    validate: {
                        headers: validateHeaders(),
                        failAction: (request, h, error) => {
                            throw error
                        },
                        params: {
                            id: Joi.string().required().min(3).max(200),
                        },
                        payload: validatePatchPayload(),
                    },
                },
            }
        ])

        //3- Instanciar a rota
        await app.start()
        console.log(`servidor rodando, ${app.info.port}`)
    } catch (error) {
        console.error('DEU RUIM', error)
    }
}
main()