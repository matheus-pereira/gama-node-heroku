const DatabaseMongoDB = require('./databaseUsers')


async function main() {
    // fazemos a conecção com o MongoDB
    const userDb = DatabaseMongoDB.connectDB()
    const database = new DatabaseMongoDB(userDb)
    const item = {
        "username": "Sempre serei resistência. Menos a você, porque aí eu não resisto",
        "password": "12324534rwe",
        "company": [{
            "name": "2018-11-08T19:27:35.764Z",
        }]
    }
    const resultCreate = await database.createUser(item)
    console.log('resultCreate', resultCreate)

    const resultListar = await database.getUser()
    console.log('resultListar', JSON.stringify(resultListar))

    // const itemAtualizar = resultListar[0]._id
    // const resultAtualizar = await database
    //     .patchUser(itemAtualizar, {
    //         nome: 'Mulher Maravilha'
    //     })

    // console.log('resultAtualizar', resultAtualizar)

    // const itemRemover = resultListar[0]._id
    // const resultRemover = await database.deleteUser(itemRemover)
    // console.log('resultRemover', resultRemover)
}
main()