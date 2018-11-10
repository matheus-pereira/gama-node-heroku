const Hapi = require('hapi')
const Joi = require('joi')
const Boom = require('boom')

//Importando o banco de dados
const userModel = require('./databaseUsers')

function validatePostPayload() {
    return {
        username: Joi.string().required(),
        password: Joi.string().required().min(5).max(20),
        company: Joi.array().items({
            name: Joi.string(),
        }),
    }
}

function validatePatchPayload() {
    return {
        username: Joi.string(),
        password: Joi.string().min(5).max(20),
        company: Joi.array().items({
            name: Joi.string(),
        }),
    }
}
async function main() {
    try {
        //Inicializando o banco de dados
        const connection = userModel.connectDB()
        const users = new userModel(connection)

        //1- Instanciando servidor, passando a porta
        const app = Hapi.Server({
            port: 3000
        })

        //2- Definindo as rotas (preferível deixar rotas em arquivo separado)
        app.route([

            {
                method: 'GET',
                path: '/users',
                handler: async (req, h) => {
                    try {
                        //pegamos os parametros da URL
                        const {
                            limit,
                            skip
                        } = req.query;
                        const result = await users
                            .getUser({}, {
                                limit,
                                skip
                            });
                        return result
                    } catch (error) {
                        console.log('Não foi possível obter a lista de usuários.', error)
                        return Boom.internal()
                    }
                },
                config: {
                    validate: {
                        failAction: (request, h, err) => {
                            throw err
                        },
                        query: {
                            skip: Joi.number().integer().default(0),
                            limit: Joi.number().integer().default(10)
                        }
                    }
                }
            },
            {
                method: 'GET',
                path: '/users/{id}',

                handler: async (request, h) => {
                    try {
                        const {
                            id
                        } = request.params
                        const result = await users.getUser({
                            _id: id,
                        })
                        return result
                    } catch (error) {

                        console.log('Não foi possível obter os dados do usuário', error)
                        return Boom.internal();
                    }
                },
                config: {
                    validate: {
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
                method: 'POST',
                path: '/users',
                handler: async (request, h) => {
                    try {
                        const item = request.payload
                        const result = await users.createUser(item)
                        return result
                    } catch (error) {

                        console.log('Não foi possível cadastrar o usuário', error)
                        return Boom.internal();
                    }
                },
                config: {
                    validate: {
                        failAction: (request, h, err) => {
                            throw err
                        },
                        payload: validatePostPayload(),
                    },
                },
            },
            {
                method: 'DELETE',
                path: '/users/{id}',

                handler: async (request, h) => {
                    try {
                        const {
                            id
                        } = request.params
                        const result = await users.deleteUser(id)
                        return result
                    } catch (error) {

                        console.log('Não foi possível remover o usuário', error)
                        return Boom.internal();
                    }
                },
                config: {
                    validate: {
                        failAction: (request, h, err) => {
                            throw err
                        },
                        params: {
                            id: Joi.string().min(3).max(200)
                        }
                    },
                },
            }, {
                method: 'PATCH',
                path: '/users/{id}',
                handler: async (request, h) => {
                    try {
                        const {
                            id
                        } = request.params
                        const post = request.payload
                        const result = await users.patchUser(id, post)
                        return result
                    } catch (error) {
                        console.error(error);
                        return Boom.internal()
                    }
                },
                config: {
                    validate: {
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
        console.error('Falha ao conectar-se ao servidor', error)
    }
}
main()