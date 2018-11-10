const Mongoose = require('mongoose')

const userSchema = new Mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    photo: {
        type: String,
        required: true
    },
});


const commentsSchema = new Mongoose.Schema({
    text: {
        required: true,
        type: String,
    },
    user: {
        type: userSchema,
        required: true
    },
    publishedAt: Date,
    likes: {
        required: true,
        type: Number
    }

});
const postSchema = new Mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    publishedAt: {
        type: Date,
        required: true
    },
    usuario: userSchema,
    comments: [commentsSchema],
});

class DatabasePosts {
    constructor(connection) {
        this.connection = connection
    }
    static conectar() {
        Mongoose
            .connect(process.env.MONGO_URL, {
                useNewUrlParser: true
            })
        const connection = Mongoose.connection
        connection.once('open', () => console.log('db running'))
        const postModel = Mongoose.model('posts', postSchema)
        return postModel;
    }
    async cadastrar(item) {
        const resultCreate = await this.connection.create(item)
        return resultCreate;
    }

    listar(query = {}, pagination = {
        ignorar: 0,
        limitar: 10
    }) {

        return this.connection
            .find(query)
            .skip(pagination.ignorar)
            .limit(pagination.limitar)
    }
    remover(id) {
        return this.connection.deleteOne({
            _id: id
        })
    }
    atualizar(id, item) {
        return this.connection.updateOne({
            _id: id
        }, {
            $set: item
        })
    }

}

module.exports = DatabasePosts