# Ferramentas de Anotação - TODO

- [x] Editar `collage.html` - Adicionar toolbar de anotações na topbar
- [x] Editar `collage.html` - Adicionar canvas overlay e input de texto flutuante
- [x] Editar `style.css` - Estilizar botões de ferramentas e canvas overlay
- [x] Editar `script.js` - Adicionar estado e funções de anotação
- [x] Editar `script.js` - Implementar eventos de mouse para desenho
- [x] Editar `script.js` - Implementar ferramenta Círculo
- [x] Editar `script.js` - Implementar ferramenta Retângulo
- [x] Editar `script.js` - Implementar ferramenta Traço (livre)
- [x] Editar `script.js` - Implementar ferramenta Linha direta
- [x] Editar `script.js` - Implementar ferramenta Seta
- [x] Editar `script.js` - Implementar ferramenta Escrever
- [x] Editar `script.js` - Implementar ferramenta Balão de fala
- [x] Editar `script.js` - Implementar ferramenta Mover
- [x] Editar `script.js` - Implementar Desfazer / Apagar / Aplicar
- [x] Editar `collage.html` + `script.js` - Adicionar seletor de cor para anotações
- [x] Corrigir ferramenta "Escrever" (conflito blur/Enter)
- [x] Melhorar aparência do balão de fala (fill + cauda suave)
- [x] Testar e verificar responsividade

---

# Novas Funcionalidades - TODO

## Fase 1: Seleção + Mudança de Cor
- [ ] Adicionar `selectedIdx` ao estado de anotações
- [ ] Realçar anotação selecionada (bounding box + handles)
- [ ] Alterar cor do picker atualiza anotação selecionada

## Fase 2: Balão de Fala - Mover Aponta
- [ ] Adicionar `tailX`/`tailY` nas propriedades do balão
- [ ] Desenhar handle de cauda quando balão selecionado
- [ ] Permitir arrastar a ponta da cauda

## Fase 3: Rotação de Objetos
- [ ] Adicionar propriedade `rotation` (graus) às anotações
- [ ] Aplicar `translate` + `rotate` no `drawOneAnnotation`
- [ ] Ajustar `hitTestAnnotation` para considerar rotação
- [ ] Desenhar handle de rotação e implementar arrasto

## Fase 4: Formatação de Texto
- [ ] Adicionar `bold` e `italic` às anotações de texto
- [ ] Adicionar controles de tamanho, negrito, itálico na toolbar
- [ ] Aplicar formatação no `drawOneAnnotation` tipo texto

## Fase 5: Ferramenta Borracha
- [ ] Adicionar botão "Borracha" na toolbar
- [ ] Implementar lógica de apagar (pontos de stroke ou anotação inteira)
- [ ] Visualização do cursor de borracha
