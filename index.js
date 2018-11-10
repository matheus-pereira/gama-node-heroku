const DatabaseMongoDB = require('./databasePosts')


async function main() {
    // fazemos a conecção com o MongoDB
    const heroiDb = DatabaseMongoDB.conectar()
    const database = new DatabaseMongoDB(heroiDb)
    const item = {
        "description": "Sempre serei resistência. Menos a você, porque aí eu não resisto",
        "link": "https://www.osvigaristas.com.br/frases/idiotas/",
        "publishedAt": "2018-11-08T19:27:35.764Z",
        "user": {
            "name": "Mariazinha",
            "photo": "https://pickaface.net/gallery/avatar/17843364_180531_0352_ts1sm.png"
        },
        "comments": [{
            "publishedAt": "2018-11-08T19:27:35.764Z",
            "text": "Aquela cantora que não é pequena: Ariana Grande.",
            "user": {
                "name": "Alonso José",
                "photo": "https://pickaface.net/gallery/avatar/20150903_165524_553_Alex_Rider.png"
            },
            "likes": 10
        }]
    }
    const resultCreate = await database.cadastrar(item)
    console.log('resultCreate', resultCreate)

    const resultListar = await database.listar()
    console.log('resultListar', JSON.stringify(resultListar))

    // const itemAtualizar = resultListar[0]._id
    // const resultAtualizar = await database
    //     .atualizar(itemAtualizar, {
    //         nome: 'Mulher Maravilha'
    //     })

    // console.log('resultAtualizar', resultAtualizar)

    // const itemRemover = resultListar[0]._id
    // const resultRemover = await database.remover(itemRemover)
    // console.log('resultRemover', resultRemover)
}
main()