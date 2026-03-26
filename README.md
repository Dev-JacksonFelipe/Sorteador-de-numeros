# 🎲 Sorteador de Números

Aplicação web moderna e acessível para sortear números aleatórios com interface intuitiva e recursos avançados.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## ✨ Funcionalidades

- 🎯 **Sorteio Personalizado**: Defina quantidade, intervalo (de/até) e repetição
- 📋 **Copiar Resultados**: Copie números sorteados para área de transferência
- 📚 **Histórico Completo**: Visualize todos os sorteios realizados
- 💾 **Exportação**: Exporte resultados em CSV ou TXT
- 💿 **Configurações Salvas**: Última configuração é restaurada automaticamente
- ♿ **100% Acessível**: Suporte completo a leitores de tela e navegação por teclado
- 📱 **Responsivo**: Funciona perfeitamente em mobile, tablet e desktop
- 🎨 **Animações Suaves**: Interface moderna com feedback visual

## 🚀 Demo

[Ver Demo ao Vivo](https://dev-jacksonfelipe.github.io/Sorteador-de-numeros/)

## 📸 Screenshots

### Desktop
![Desktop View](assets/screenshot-desktop.png)

### Mobile
![Mobile View](assets/screenshot-mobile.png)

## 🛠️ Tecnologias

- **HTML5**: Estrutura semântica
- **CSS3**: Estilização moderna com variáveis CSS e animações
- **JavaScript ES6+**: Lógica com classes, async/await e módulos
- **LocalStorage API**: Persistência de dados
- **Clipboard API**: Copiar para área de transferência
- **ARIA**: Acessibilidade completa

## 📦 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/Dev-JacksonFelipe/Sorteador-de-numeros.git
```

2. Navegue até o diretório:
```bash
cd Sorteador-de-numeros
```

3. Abra o arquivo `index.html` no navegador ou use um servidor local:
```bash
# Com Python
python -m http.server 8000

# Com Node.js (http-server)
npx http-server
```

## 💻 Como Usar

1. **Configure o Sorteio**:
   - Digite a quantidade de números a sortear
   - Defina o intervalo (número inicial e final)
   - Marque/desmarque "Não repetir números"

2. **Sortear**:
   - Clique em "SORTEAR" ou pressione `Ctrl+Enter`
   - Aguarde a animação dos números

3. **Ações Disponíveis**:
   - 📋 Copiar números
   - 📊 Exportar como CSV
   - 📄 Exportar como TXT
   - 🔄 Sortear novamente

4. **Histórico**:
   - Clique em "Ver Histórico" para visualizar sorteios anteriores
   - Cada item do histórico pode ser copiado ou exportado

## ⌨️ Atalhos de Teclado

- `Tab`: Navegar entre elementos
- `Ctrl+Enter`: Realizar sorteio
- `Esc`: Fechar painéis (quando implementado)

## ♿ Acessibilidade

Este projeto segue as diretrizes **WCAG 2.1** (Níveis A e AA):

- ✅ Navegação completa por teclado
- ✅ Suporte a leitores de tela (NVDA, JAWS, VoiceOver)
- ✅ ARIA labels e roles semânticos
- ✅ Contraste adequado de cores
- ✅ Foco visível em todos os elementos interativos
- ✅ Mensagens de erro acessíveis
- ✅ Suporte a `prefers-reduced-motion`
- ✅ Suporte a `prefers-contrast: high`

## 📁 Estrutura do Projeto

```
sorteador-de-numeros/
├── assets/
│   ├── icons/
│   │   ├── arrow-right.svg
│   │   ├── play.svg
│   │   └── user.svg
│   ├── bg.png
│   └── logo.svg
├── styles/
│   ├── accessibility.css
│   ├── draw.css
│   ├── features.css
│   ├── footer.css
│   ├── global.css
│   ├── header.css
│   ├── index.css
│   └── main.css
├── index.html
├── scripts.js
├── ACESSIBILIDADE.md
└── README.md
```

## 🎨 Arquitetura do Código

O JavaScript está organizado em classes modulares:

- **`StorageManager`**: Gerencia localStorage
- **`ExportManager`**: Exportação CSV/TXT
- **`ToastManager`**: Notificações visuais
- **`HistoryManager`**: Gerencia histórico de sorteios
- **`AccessibilityManager`**: Recursos de acessibilidade
- **`InputValidator`**: Validação de inputs
- **`NumberDrawer`**: Lógica de sorteio
- **`DrawResultUI`**: Interface de resultados
- **`DrawApplication`**: Controlador principal

## 🤝 Contribuindo

Contribuições são bem-vindas! Siga os passos:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Jackson Felipe**

- GitHub: [@Dev-JacksonFelipe](https://github.com/Dev-JacksonFelipe)
- LinkedIn: [Jackson Felipe](https://linkedin.com/in/seu-perfil)

## 🙏 Agradecimentos

- [Rocketseat](https://rocketseat.com.br) - Inspiração e aprendizado
- Comunidade open source

---

⭐ Se este projeto foi útil para você, considere dar uma estrela!
