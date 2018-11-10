const Mongoose = require('mongoose')

const userSchema = new Mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    company: [{
        name: {
            type: String,
            required: true
        }
    }],
});

class DatabaseUsers {
    constructor(connection) {
        this.connection = connection
    }
    static connectDB() {
        Mongoose
            .connect('mongodb://localhost:27017/users', {
                useNewUrlParser: true
            })
        const connection = Mongoose.connection
        connection.once('open', () => console.log('db running'))
        const userModel = Mongoose.model('users', userSchema)
        return userModel;
    }
    async createUser(item) {
        const resultCreate = await this.connection.create(item)
        return resultCreate;
    }

    getUser(query = {}, pagination = {
        skip: 0,
        limit: 10
    }) {

        return this.connection
            .find(query)
            .skip(pagination.skip)
            .limit(pagination.limit)
    }
    deleteUser(id) {
        return this.connection.deleteOne({
            _id: id
        })
    }
    patchUser(id, item) {
        return this.connection.updateOne({
            _id: id
        }, {
            $set: item
        })
    }

}

module.exports = DatabaseUsers