
# Mapa Foresight CAIXA — pacote estático

Arquivos:
- `index.html` — página principal do mapa (grid + eixo horizontal Genesis→Commodity e vertical Visibilidade p/ Cliente).
- `styles.css` — estilos, incluindo as cores Pantone aproximadas definidas.
- `data.json` — **EDITÁVEL**. Contém a paleta e a lista de tendências com posições (`x`, `y` de 0 a 100).
- `script.js` — lógica de renderização, arraste‑e‑solte e painel de detalhes.

## Como editar
- Abra `data.json` e altere textos, incluir/remover tendências e ajustar as posições `x` (horizontal) e `y` (vertical).
- Clique em uma pílula para ver detalhes; arraste para reposicionar. Use o botão **Copiar posições (JSON)** para exportar as coordenadas atualizadas.

## Como publicar no GitHub Pages
- Faça upload dos quatro arquivos em um repositório público.
- Nas configurações do repositório, ative **Pages** com branch `main` e pasta `/root`.
- A URL ficará disponível logo após.

## Notas
- Eixo vertical: 0 (base) = Interface interna; 100 (topo) = Altamente visível.
- As cores Pantone são aproximações em hex: 258C `#A05EB5`, 382C `#CEDC00`, 1235C `#FFB549`, 326C `#00B3B8`, 1645C `#FF6F40`, Azul CAIXA `#005CA9`.
