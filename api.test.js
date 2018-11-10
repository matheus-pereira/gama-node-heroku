const assert = require('assert');
const {
    config
} = require('dotenv');
config({
    path: './config/.env.dev'
});

//importamos nosso server
const app = require('./api');
let server = {};
let ID = '';

const MOCK_TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Inh1eGFkYXNpbHZhIiwiY29tcGFueSI6InJlY29yZC5jb20iLCJpYXQiOjE1NDE4NzkxNzF9.Wt-CnNnJNLIDY82xPUMzkoEymKCBrLIT0dlgm2D6ykw';

const MOCK_POST = {
    description: 'Sempre serei resistência. Menos a você, porque aí eu não resisto',
    link: 'https://www.osvigaristas.com.br/frases/idiotas/',
    publishedAt: '2018-11-08T19:27:35.764Z',
    user: {
        name: 'Mariazinha',
        photo: 'https://pickaface.net/gallery/avatar/17843364_180531_0352_ts1sm.png',
    },
    comments: [{
        publishedAt: '2018-11-08T19:27:35.764Z',
        text: 'Aquela cantora que não é pequena: Ariana Grande.',
        user: {
            name: 'Alonso José',
            photo: 'https://pickaface.net/gallery/avatar/20150903_165524_553_Alex_Rider.png',
        },
        likes: 10,
    }, ],
};

function cadastrar(item) {
    return server.inject({
        url: '/posts',
        method: 'POST',
        headers: {
            Authorization: MOCK_TOKEN,
        },
        payload: JSON.stringify(item),
    });
}

describe.only('Suite de teste e2e (end to end) de API', () => {
    //Definimos o timeout máximo
    this.timeout(Infinity);
    // antes de rodar todos os testes
    before(async () => {
        server = await app;
        const {
            result: {
                _id
            },
        } = await cadastrar(MOCK_POST);
        ID = _id;
    });
    it(`Deve obter o token`, async () => {
        const {
            result
        } = await server.inject({
            url: '/login',
            method: 'POST',
            payload: JSON.stringify({
                username: 'xuxadasilva',
                senha: '1234',
            }),
        });
        // caso o token venha undefined, false, 0, '', é convertido
        // para false
        const {
            token
        } = result;
        assert.ok(token !== '');
    });

    it(`Deve cadastrar um post`, async () => {
        const {
            result
        } = await cadastrar(MOCK_POST);
        // caso o token venha undefined, false, 0, '', é convertido
        // para false
        const {
            _id
        } = result;

        assert.ok(_id !== '');
    });
    it('Deve obter um post pelo id', async () => {
        const {
            result
        } = await server.inject({
            method: 'GET',
            url: `/posts/${ID}`,
            headers: {
                Authorization: MOCK_TOKEN,
            },
        });

        assert.ok(result.description !== '');
    });
});