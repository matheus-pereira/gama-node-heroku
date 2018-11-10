const game = {
    pedra: {
        tesoura: 'pedra-vencedora',
        pedra: 'pedra-empate',
        papel: 'papel-vencedor'
    },
    tesoura: {
        papel: 'tesoura-vencedora',
        tesoura: 'tesoura-empate',
        pedra: 'pedra-vencedora'
    },
    papel: {
        pedra: 'papel-vencedor',
        papel: 'papel-empate',
        tesoura: 'tesoura-vencedora'
    },

}

class Jokenpo {

    static jogar(player1, player2) {
        //Criamos if para testar no teste de cobertura de código.
        //Para passar, seria necessário criar um teste que valide essa condição
        // if (player1 == null && player2 == null) return null
        //Usando um padrão de hash map, em vez de usar if
        return game[player1][player2]
    }
}
module.exports = Jokenpo