# Extensão de performance com JMeter

> **Este exemplo não foi executado para não comprometer o ambiente da Demoblaze. Foi incluído como uma proposta de evolução da automação, demonstrando como estruturar uma futura avaliação de performance.**

## Material incluído

O arquivo `jmeter/local-baseline.jmx` apresenta um baseline simples no Apache JMeter: uma requisição `GET` para `/health`, com um usuário virtual e uma iteração. O alvo está configurado como `127.0.0.1:8080`, para uso com uma aplicação local que exponha essa rota.

Esse baseline demonstra a estrutura de um plano JMeter e a validação de uma resposta HTTP `200`. Ele não representa uma medição de capacidade ou um teste de carga da Demoblaze.

## Como visualizar no JMeter

1. Abra o Apache JMeter.
2. Selecione **File > Open** e escolha `jmeter/local-baseline.jmx`.
3. Explore o grupo de usuários, o sampler HTTP, a asserção de status e os listeners **View Results Tree** e **Summary Report**.
4. Para experimentar o baseline, use uma aplicação local que responda em `http://127.0.0.1:8080/health`.

## Proposta de avaliação de performance

Em uma evolução do projeto, os cenários poderiam cobrir:

- Listagem e consulta de produtos.
- Autenticação e operações de carrinho.
- Fluxo de compra completo, usando dados de teste controlados.

A estratégia poderia avançar por etapas, partindo de uma verificação de baseline e então avaliando carga esperada, picos e estabilidade ao longo do tempo. Os volumes, a duração e os critérios de sucesso seriam definidos conforme os requisitos do produto e os objetivos da avaliação.

## Métricas que podem ser acompanhadas

- Latência média e percentis p50, p90, p95 e p99 por cenário.
- Requisições por segundo e concorrência observada.
- Taxa de sucesso, erros HTTP, falhas de validação e timeouts.
- Uso de CPU, memória, conexões e recursos da persistência.
- Comportamento dos principais fluxos ao longo da execução.

Com essa extensão, a entrega documenta uma possível evolução da automação funcional para uma abordagem de performance, sem apresentar medições que não foram realizadas.
