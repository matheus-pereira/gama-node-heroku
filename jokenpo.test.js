/*
    DESENVOLVIMENTO ORIENTADO A TESTES

    Segue os princípios

    * RED
    * BLUE
    * GREEN
    
    1o. Criar o teste que dá erro
    2o. Criamos a implementação da função
    3o. Fazemos o teste passar
    4o. Refatoramos a função

    o nodejs possui sua própria stack de testes nativa, porém limitada
        require('assert')

    para trabalhar com testes profissionais, usamos o mocha

        npm i -g mocha && npm i --save-dev mocha        //o save-dev é importante para garantir que os testes não irão para produção
        mocha *.test.js -w

    para visualizar as métricas de cobertura de código
        ISTANBUL

        npm install coveralls --save-dev
        npm i -g nyc && npm i nyc --save-dev

        nyc mocha *.test.js
            inserir no package.json como test
            rodar com npm run test

        nyc --reporter=html --reporter=text mocha *.test.js
            -- possível inserir o comando no package json em scripts
            rodar com npm run coverage

*/

const assert = require('assert');
const Jokenpo = require('./jokenpo');

//Descrevendo os testes
describe('Suite de teste do Jokenpo', () => {
    describe('Testando possibilidades com pedra', () => {
        //Definindo expectativas e resultados
        it('Pedra deve ganhar de tesoura', () => {
            const expected = 'pedra-vencedora';
            const result = Jokenpo.jogar('pedra', 'tesoura');
            assert.equal(result, expected);
        });
        it('Pedra deve empatar com pedra', () => {
            const expected = 'pedra-empate';
            const result = Jokenpo.jogar('pedra', 'pedra');
            assert.equal(result, expected);
        });
        it('Pedra deve perder do papel', () => {
            const expected = 'papel-vencedor';
            const result = Jokenpo.jogar('pedra', 'papel');
            assert.equal(result, expected);
        });
    });
    describe('Testando possibilidades com tesoura', () => {
        //Definindo expectativas e resultados
        it('Tesoura deve ganhar de papel', () => {
            const expected = 'tesoura-vencedora';
            const result = Jokenpo.jogar('tesoura', 'papel');
            assert.equal(result, expected);
        });
        it('Tesoura deve empatar com tesoura', () => {
            const expected = 'tesoura-empate';
            const result = Jokenpo.jogar('tesoura', 'tesoura');
            assert.equal(result, expected);
        });
        it('Tesoura deve perder da pedra', () => {
            const expected = 'pedra-vencedora';
            const result = Jokenpo.jogar('tesoura', 'pedra');
            assert.equal(result, expected);
        });
    });
    describe('Testando possibilidades com papel', () => {
        //Definindo expectativas e resultados
        it('Papel deve ganhar de pedra', () => {
            const expected = 'papel-vencedor';
            const result = Jokenpo.jogar('papel', 'pedra');
            assert.equal(result, expected);
        });
        it('Papel deve empatar com papel', () => {
            const expected = 'papel-empate';
            const result = Jokenpo.jogar('papel', 'papel');
            assert.equal(result, expected);
        });
        it('Papel deve perder da tesoura', () => {
            const expected = 'tesoura-vencedora';
            const result = Jokenpo.jogar('papel', 'tesoura');
            assert.equal(result, expected);
        });
    });
})