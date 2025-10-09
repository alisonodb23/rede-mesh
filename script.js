(async function() {
  /** 
   * @class ModernSupportUI
   * Manages the creation, styling, and logic of a modern support helper interface.
   * This version uses the modern UI but implements the EXACT automation logic from the original script,
   * relying on setInterval and polling loops as requested.
   */
  class ModernSupportUI {
    constructor() {
      this.data = [];
      this.currentIndex = 0;
      this.elements = {}; // To store references to DOM elements
      this.userManuallySetAguardar = false; // Track if user manually set aguardar to true
    }

    async init() {
      try {
        this.data = await this.fetchJsonData();
        this.createStyles();
        this.createUI();
        this.attachEventListeners();
        console.log("Modern Support UI initialized successfully (with original automation logic).");
      } catch (error) {
        console.error("Failed to initialize the Modern Support UI:", error);
      }
    }

    async fetchJsonData() {
      const url = 'https://raw.githubusercontent.com/Alvarothe/site-tester/refs/heads/main/mensagens.json';
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Erro HTTP! Status: ${response.status}`);
        }
        const data = await response.json();
        
        // --- LÓGICA DE ORDENAÇÃO ---
        // 1. Crie dois arrays: um para itens com ID e outro para itens sem ID.
        const itemsWithId = [];
        const itemsWithoutId = [];
        
        // 2. Separe os itens nos seus respectivos grupos.
        // Isso preserva a ordem original dos itens sem ID.
        data.forEach(item => {
          // Verificação robusta: o ID existe, não é nulo e não é uma string vazia.
          if (item.id != null && item.id !== '') {
            itemsWithId.push(item);
          } else {
            itemsWithoutId.push(item);
          }
        });
        
        // 3. Ordene APENAS a lista de itens que têm ID.
        itemsWithId.sort((a, b) => {
          // Usa localeCompare com a opção 'numeric' para ordenar corretamente "1", "2", "10", etc.
          return String(a.id).localeCompare(String(b.id), undefined, { numeric: true });
        });
        
        // 4. Junte as duas listas: os itens ordenados por ID vêm primeiro,
        // seguidos pelos itens sem ID (na sua ordem original).
        const sortedData = itemsWithId.concat(itemsWithoutId);
        
        // 5. Retorne os dados completamente ordenados.
        return sortedData;
      } catch (error) {
        console.error("Falha ao buscar ou processar os dados JSON:", error);
        return [];
      }
    }

    createStyles() {
      const style = document.createElement('style');
      style.textContent = `
        :root {
          --primary-color: #007BFF;
          --primary-hover-color: #0056b3;
          --secondary-color-rgb: 248, 249, 250;
          --text-color: #212529;
          --text-light-color: #f8f9fa;
          --border-color-rgb: 255, 255, 255;
          --shadow-color: rgba(0, 0, 0, 0.15);
          --bg-color-rgb: 255, 255, 255;
          --input-text-color: #495057;
        }
        
        .support-ui-container {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          padding: 20px;
          z-index: 9999;
          width: 340px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          box-shadow: 0 4px 20px var(--shadow-color);
          color: var(--text-color);
          display: flex;
          flex-direction: column;
          gap: 12px;
          display: none;
          background: rgba(var(--bg-color-rgb), 0.65);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(var(--border-color-rgb), 0.2);
          border-radius: 16px;
        }
        
        .support-ui-container p {
          margin: 0;
          text-align: center;
          font-size: 16px;
          font-weight: 500;
        }
        
        .support-ui-container input[type="text"], 
        .search-input, 
        .observacao-textarea {
          width: 100%;
          padding: 8px 12px;
          border-radius: 6px;
          color: var(--input-text-color);
          box-sizing: border-box;
          font-size: 15px;
          transition: border-color 0.2s, box-shadow 0.2s;
          background-color: rgba(var(--secondary-color-rgb), 0.7);
          border: 1px solid rgba(var(--border-color-rgb), 0.4);
        }
        
        .support-ui-container input::placeholder, 
        .observacao-textarea::placeholder {
          color: #6c757d;
        }
        
        .support-ui-container input[type="text"]:focus, 
        .observacao-textarea:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
        }
        
        .support-ui-container input[type="text"]:disabled {
          background-color: rgba(233, 236, 239, 0.5);
          cursor: not-allowed;
        }
        
        .toggle-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
        }
        
        .toggle-label {
          font-size: 14px;
          color: #6c757d;
          font-weight: 500;
        }
        
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }
        
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 24px;
        }
        
        .slider:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        
        input:checked + .slider {
          background-color: var(--primary-color);
        }
        
        input:checked + .slider:before {
          transform: translateX(20px);
        }
        
        .message-content, 
        .info-item {
          background-color: rgba(var(--secondary-color-rgb), 0.6);
          border: 1px solid rgba(var(--border-color-rgb), 0.3);
          padding: 10px;
          border-radius: 8px;
        }
        
        .message-content {
          min-height: 100px;
          max-height: 150px;
          overflow-y: auto;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .info-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .info-item {
          font-size: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .info-item .etiqueta-title {
          font-weight: 600;
          color: #6c757d;
        }
        
        .info-item .etiqueta-value {
          font-weight: 600;
          color: var(--primary-color);
        }
        
        .dropdown {
          position: relative;
          width: 100%;
        }
        
        .dropdown-content {
          display: none;
          position: absolute;
          background-color: rgba(var(--bg-color-rgb), 0.8);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          width: 100%;
          max-height: 200px;
          overflow-y: auto;
          border: 1px solid rgba(var(--border-color-rgb), 0.3);
          border-radius: 6px;
          z-index: 10;
          box-shadow: 0 4px 8px var(--shadow-color);
        }
        
        .dropdown-content div {
          padding: 10px 12px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }
        
        .dropdown-content div:hover {
          background-color: rgba(0, 123, 255, 0.1);
          color: var(--primary-color);
        }
        
        .show {
          display: block;
        }
        
        .observacao-textarea {
          min-height: 60px;
          resize: vertical;
          font-family: inherit;
        }
        
        .open-button {
          position: fixed;
          top: 50%;
          transform: translateY(-50%);
          right: 0;
          z-index: 1000;
          cursor: pointer;
          width: 32px;
          height: 60px;
          background-color: var(--primary-color);
          border: none;
          border-top-left-radius: 30px;
          border-bottom-left-radius: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: -2px 2px 10px var(--shadow-color);
          transition: background-color 0.3s;
        }
        
        .open-button:hover {
          background-color: var(--primary-hover-color);
        }
        
        .open-button-icon {
          color: white;
          font-size: 24px;
          font-weight: bold;
          transform: rotate(180deg);
          transition: transform 0.3s ease;
        }
        
        .open-button.flipped .open-button-icon {
          transform: rotate(0deg);
        }
        
        .finalize-button {
          background-color: var(--primary-color);
          color: var(--text-light-color);
          border: none;
          padding: 12px 15px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          transition: background-color 0.3s ease;
          width: 100%;
        }
        
        .finalize-button:hover {
          background-color: var(--primary-hover-color);
        }
      `;
      document.head.appendChild(style);
    }

    createUI() {
      const container = document.createElement('div');
      container.className = 'support-ui-container';
      container.innerHTML = `
        <p>Detalhes do Atendimento</p>
        <div class="toggle-container">
          <span class="toggle-label">Terceiro</span>
          <label class="toggle-switch"><input type="checkbox" id="titularToggle" checked><span class="slider"></span></label>
          <span class="toggle-label">Titular</span>
        </div>
        <input type="text" id="nomeDoContato" placeholder="Nome do contato" autocomplete="off" disabled>
        <div class="dropdown">
          <input type="text" class="search-input" placeholder="Pesquisar motivo do contato...">
          <div class="dropdown-content" id="titleDropdown"></div>
        </div>
        <div class="message-content" id="MensagemDoProtocolo"></div>
        <div class="info-container">
          <div class="info-item"><span class="etiqueta-title">Etiqueta:</span><span id="etiquetaValor" class="etiqueta-value"></span></div>
          <div class="info-item"><span>Encaminhar Externo?</span> <span id="externoValue"></span></div>
          <div class="info-item">
            <span>Aguardar Retorno?</span>
            <label class="toggle-switch">
              <input type="checkbox" id="aguardarToggle">
              <span class="slider"></span>
            </label>
          </div>
        </div>
        <textarea id="observacaoInput" class="observacao-textarea" placeholder="Observação (opcional)..."></textarea>
        <button id="finalizeButton" class="finalize-button">Finalizar e Registrar</button>
      `;
      document.body.appendChild(container);
      
      const toggleButton = document.createElement('button');
      toggleButton.className = 'open-button';
      toggleButton.innerHTML = '<span class="open-button-icon">❮</span>';
      document.body.appendChild(toggleButton);
      
      this.elements = {
        container,
        toggleButton,
        nomeDoContato: document.getElementById('nomeDoContato'),
        mensagemDoProtocolo: document.getElementById('MensagemDoProtocolo'),
        titularToggle: document.getElementById('titularToggle'),
        aguardarToggle: document.getElementById('aguardarToggle'),
        externoValue: document.getElementById('externoValue'),
        aguardarValue: document.getElementById('aguardarValue'),
        etiquetaValor: document.getElementById('etiquetaValor'),
        searchInput: container.querySelector('.search-input'),
        dropdown: document.getElementById('titleDropdown'),
        finalizeButton: document.getElementById('finalizeButton'),
        observacaoInput: document.getElementById('observacaoInput'),
      };
    }

    attachEventListeners() {
      this.elements.toggleButton.addEventListener('click', () => this.toggleUIVisibility());
      
      document.addEventListener('mousedown', (event) => {
        if (event.button === 3) {
          event.preventDefault();
          this.toggleUIVisibility();
        }
      });
      
      this.elements.titularToggle.addEventListener('change', () => {
        this.elements.nomeDoContato.disabled = this.elements.titularToggle.checked;
        this.updateMessage();
      });
      
      this.elements.nomeDoContato.addEventListener('input', () => this.updateMessage());
      this.elements.observacaoInput.addEventListener('input', () => this.updateMessage());
      
      this.elements.searchInput.addEventListener('focus', () => {
        this.populateDropdown();
        this.elements.dropdown.classList.add('show');
      });
      
      this.elements.searchInput.addEventListener('input', () => {
        this.populateDropdown(this.elements.searchInput.value);
        this.elements.dropdown.classList.add('show');
      });
      
      document.addEventListener('click', (e) => {
        if (!this.elements.container.contains(e.target) && !this.elements.toggleButton.contains(e.target)) {
          this.elements.dropdown.classList.remove('show');
        }
      });
      
      this.elements.finalizeButton.addEventListener('click', () => this.finalizeAttendance());
      
      // Evento para o toggle de aguardar
      this.elements.aguardarToggle.addEventListener('change', () => {
        // Se o toggle não está desabilitado (ou seja, o usuário pode alterá-lo)
        if (!this.elements.aguardarToggle.disabled) {
          // Se o usuário ativou o toggle, registramos essa alteração manual
          if (this.elements.aguardarToggle.checked) {
            this.userManuallySetAguardar = true;
          } else {
            this.userManuallySetAguardar = false;
          }
        }
        this.updateMessage();
      });
      
      if (this.data.length > 0) {
        this.updateMessage();
      }
    }

    toggleUIVisibility() {
      const isHidden = this.elements.container.style.display === 'none' || this.elements.container.style.display === '';
      this.elements.container.style.display = isHidden ? 'flex' : 'none';
      this.elements.toggleButton.classList.toggle('flipped', isHidden);
    }

    populateDropdown(filter = '') {
      this.elements.dropdown.innerHTML = '';
      this.data.forEach((item, index) => {
        if (item.titulo.toLowerCase().includes(filter.toLowerCase())) {
          const option = document.createElement('div');
          option.textContent = item.titulo;
          option.onclick = () => {
            this.elements.searchInput.value = item.titulo;
            this.elements.dropdown.classList.remove('show');
            this.currentIndex = index;
            
            // Resetamos o estado manual se o novo item tiver aguardar=true
            if (item.aguardar) {
              this.userManuallySetAguardar = false;
            }
            
            this.updateMessage();
          };
          this.elements.dropdown.appendChild(option);
        }
      });
    }

    updateMessage() {
      if (this.data.length === 0) return;
      
      const selectedItem = this.data[this.currentIndex];
      this.elements.externoValue.textContent = selectedItem.externo ? 'Sim' : 'Não';
      this.elements.etiquetaValor.textContent = selectedItem.etiqueta;
      
      // Lógica para o toggle de aguardar
      if (selectedItem.aguardar) {
        // Se o JSON diz para aguardar, ativa e bloqueia o toggle
        this.elements.aguardarToggle.checked = true;
        this.elements.aguardarToggle.disabled = true;
        // Resetamos o estado manual quando uma etiqueta com aguardar=true é selecionada
        this.userManuallySetAguardar = false;
      } else {
        // Se o JSON diz para não aguardar
        if (this.userManuallySetAguardar) {
          // Se o usuário havia ativado manualmente, mantemos ativado mas desbloqueado
          this.elements.aguardarToggle.checked = true;
          this.elements.aguardarToggle.disabled = false;
        } else {
          // Caso contrário, desativamos e desbloqueamos
          this.elements.aguardarToggle.checked = false;
          this.elements.aguardarToggle.disabled = false;
        }
      }
      
      let contactPerson = this.elements.titularToggle.checked ? 'Titular' : this.elements.nomeDoContato.value.trim();
      let baseMessage = `${contactPerson ? '<b>' + contactPerson + '</b> entrou em contato e ' : ''}${selectedItem.mensagem}`;
      const observacaoText = this.elements.observacaoInput.value.trim();
      
      if (observacaoText) {
        baseMessage += `<br><br><b>Observação:</b><br>${observacaoText.replace(/\n/g, '<br>')}`;
      }
      
      this.elements.mensagemDoProtocolo.innerHTML = baseMessage;
    }

    finalizeAttendance() {
      const selectedItem = this.data[this.currentIndex];
      const messageText = this.elements.mensagemDoProtocolo.innerText;
      const etiqueta = selectedItem.etiqueta.toLowerCase();
      
      // Pega o valor do toggle em vez do texto
      const aguardar = this.elements.aguardarToggle.checked ? 'Sim' : 'Não';
      
      this.elements.searchInput.value = '';
      this.elements.observacaoInput.value = '';
      this.populateDropdown();
      this.toggleUIVisibility();
      
      const textarea = document.querySelector('textarea.text-area');
      if (textarea) {
        textarea.value = messageText;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
      
      const botao = document.querySelector('button#send_button');
      if (botao && !botao.hasAttribute('disabled')) {
        botao.click();
      }
      
      const campoInputEtiqueta = "//*[@id='tags']/div/div/ul/li/input";
      const tempoEncontrarEtiqueta = setInterval(() => {
        const inserirEtiqueta = document.evaluate(campoInputEtiqueta, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (inserirEtiqueta) {
          inserirEtiqueta.focus();
          inserirEtiqueta.click();
          inserirEtiqueta.value = etiqueta;
          inserirEtiqueta.dispatchEvent(new Event('input', { bubbles: true }));
          clearInterval(tempoEncontrarEtiqueta);
        }
      }, 600);
      
      const adicionarEtiqueta = document.querySelector('.anticon.anticon-plus');
      if (adicionarEtiqueta) {
        adicionarEtiqueta.click();
      } else {
        console.error("Elemento 'anticon anticon-plus' não encontrado.");
      }
      
      let clicado = false;
      const seletorDeEtiqueta = setInterval(() => {
        if (clicado) return;
        
        const elementos = document.querySelectorAll('.ant-select-dropdown-menu-item');
        const selecionados = document.querySelectorAll('.ant-select-selection__choice__content');
        
        if ([...selecionados].some(selecionado => selecionado.textContent.trim().toLowerCase() === etiqueta)) {
          clearInterval(seletorDeEtiqueta);
          return;
        }
        
        [...elementos].forEach(elemento => {
          if (elemento.textContent.trim().toLowerCase() === etiqueta) {
            elemento.click();
            clicado = true;
            
            var concludeElement = Array.from(document.querySelectorAll('span.ng-star-inserted')).find(el => el.textContent.trim() === "Concluir");
            if (concludeElement) {
              concludeElement.click();
            }
            
            if (selectedItem.externo === true) {
              this._encaminharExterno(selectedItem, aguardar);
            }
            
            clearInterval(seletorDeEtiqueta);
          }
        });
      }, 600);
    }

    async _encaminharExterno(selectedItem, aguardar) {
      console.log("--- Executando _encaminharExterno (versão final com leitura do DOM) ---");
      console.log("Dados recebidos:", selectedItem);
      
      // Funções auxiliares (exatamente como no seu script de teste)
      async function clickElement(selector, text) {
        const element = Array.from(document.querySelectorAll(selector))
          .find(el => text ? el.textContent.trim().toLowerCase() === text.toLowerCase() : el);
        if (element) {
          element.click();
          console.log(`Clicado: ${text || selector}`);
          return true;
        }
        return false;
      }
      
      async function TentarNovamenteExterno(selector, text) {
        let tentativas = 0;
        while (tentativas < 25) { // Limite de 5 segundos para evitar loop infinito
          tentativas++;
          // Log ligeiramente melhorado para clareza
          console.log(`Tentativa ${tentativas}: Procurando por "${text || selector}"`);
          
          if (await clickElement(selector, text)) {
            return; // Sucesso, sai da função
          }
          
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        // Se chegar aqui, o elemento não foi encontrado
        throw new Error(`Elemento não foi encontrado: ${text || selector}`);
      }
      
      try {
        // --- OBTENÇÃO DAS VARIÁVEIS DE FORMA DINÂMICA E SEGURA ---
        // 1. Pega os dados do objeto 'selectedItem'
        const tipoReparo = selectedItem.servico ?? '';
        const tipoProblema = selectedItem.etiqueta_externo ?? '';
        
        // 2. Usa o valor de 'aguardar' passado como parâmetro
        console.log(`Valores de entrada: Reparo='${tipoReparo}', Problema='${tipoProblema}', Aguardar='${aguardar}'`);
        
        // Verifica se as informações essenciais estão presentes
        if (!tipoReparo || !tipoProblema) {
          console.error("Informações de serviço ou etiqueta externa estão faltando em 'selectedItem'. Abortando.");
          return;
        }
        
        // --- CONSTRUÇÃO E EXECUÇÃO DOS PASSOS (lógica do seu script) ---
        const passos = [
          ['.icon-label', 'Enviar'],
        ];
        
        // Adiciona o passo do switch condicionalmente
        if (aguardar.toLowerCase() === 'sim') {
          console.log("Condição 'Aguardar = Sim' detectada. Adicionando passo do switch.");
          const switchSelector = 'nz-switch#blocking button.ant-switch';
          passos.push([switchSelector, null]); // O 'null' é para o TentarNovamenteExterno clicar sem texto
        }
        
        // Pausa para estabilização da interface
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const passosAdicionais = [
          ['.ant-select-selection__placeholder', 'Pesquisar...'],
          ['.ant-select-dropdown-menu-item', 'Suporte Externo'],
          ['.ant-select-selection__placeholder', 'Selecione os problemas'],
          ['.ant-select-dropdown-menu-item', tipoProblema],
          ['.ant-select-selection__placeholder', 'Selecione um serviço'],
          ['.ant-select-dropdown-menu-item', tipoReparo],
          ['span.ng-star-inserted', 'Continuar']
        ];
        
        const todosOsPassos = [...passos, ...passosAdicionais];
        
        for (const passo of todosOsPassos) {
          // Lógica de delay especial
          if (['pesquisar...', 'suporte externo'].includes((passo[1] || '').toLowerCase())) {
            console.log(`Pausa de 1s antes de: ${passo[1]}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
          // Lógica especial para inserir o texto do problema antes de clicar
          if ((passo[1] || '').toLowerCase() === 'selecione os problemas') {
            // Primeiro, clica para abrir o dropdown
            await TentarNovamenteExterno(passo[0], passo[1]);
            
            // Agora, encontra o campo de input e digita o problema
            const inputInserirProblema = document.querySelector('.ant-select-search__field');
            if (inputInserirProblema) {
              inputInserirProblema.value = tipoProblema;
              inputInserirProblema.dispatchEvent(new Event('input', { bubbles: true }));
              console.log(`Digitado no campo de busca: ${tipoProblema}`);
              await new Promise(resolve => setTimeout(resolve, 800));
            } else {
              console.warn('Campo de input para problema não encontrado, tentando clicar diretamente.');
            }
            
            continue;
          }
          
          // Lógica especial para busca parcial do tipoProblema
          if (passo[0] === '.ant-select-dropdown-menu-item' && passo[1] === tipoProblema) {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const items = document.querySelectorAll('.ant-select-dropdown-menu-item');
            console.log(`Total de itens encontrados no dropdown: ${items.length}`);
            
            let encontrado = false;
            for (const item of items) {
              const textoItem = item.textContent.trim();
              const buscaProblema = tipoProblema.trim();
              console.log(`Verificando item: "${textoItem}"`);
              
              if (textoItem.toLowerCase().includes(buscaProblema.toLowerCase())) {
                console.log(`✅ Correspondência encontrada: "${textoItem}" contém "${tipoProblema}"`);
                item.click();
                encontrado = true;
                await new Promise(resolve => setTimeout(resolve, 500));
                break;
              }
            }
            
            if (!encontrado) {
              console.warn(`Nenhuma correspondência encontrada para: ${tipoProblema}`);
              await TentarNovamenteExterno(passo[0], passo[1]);
            }
            
            continue;
          }
          
          // Lógica especial para clicar em "Selecione um serviço" com tentativas
          if (passo[0] === '.ant-select-selection__placeholder' && (passo[1] || '').toLowerCase() === 'selecione um serviço') {
            console.log('Procurando "Selecione um serviço"...');
            let clicouComSucesso = false;
            const maxTentativasServico = 10;
            
            for (let tentativa = 1; tentativa <= maxTentativasServico; tentativa++) {
              console.log(`Tentativa ${tentativa} de clicar em "Selecione um serviço"`);
              
              const servicoPlaceholder = [...document.querySelectorAll('.ant-select-selection__placeholder')]
                .find(el => el.textContent.trim() === 'Selecione um serviço');
                
              if (servicoPlaceholder) {
                servicoPlaceholder.click();
                console.log('Clicou em "Selecione um serviço", aguardando dropdown...');
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Verifica se o dropdown apareceu
                const dropdownItems = document.querySelectorAll('.ant-select-dropdown-menu-item');
                if (dropdownItems.length > 0) {
                  console.log(`✅ Dropdown carregado com ${dropdownItems.length} itens`);
                  clicouComSucesso = true;
                  break;
                }
              }
              
              await new Promise(resolve => setTimeout(resolve, 300));
            }
            
            if (!clicouComSucesso) {
              console.warn('"Selecione um serviço" não respondeu após várias tentativas');
            }
            
            continue;
          }
          
          // Lógica especial para buscar tipoReparo EXATAMENTE como está escrito
          if (passo[0] === '.ant-select-dropdown-menu-item' && passo[1] === tipoReparo) {
            const maxTentativasReparo = 15;
            let encontrado = false;
            const buscaReparo = tipoReparo.trim();
            
            for (let tentativa = 1; tentativa <= maxTentativasReparo; tentativa++) {
              console.log(`Tentativa ${tentativa} de encontrar "${tipoReparo}"`);
              
              // Tenta clicar em "Selecione um serviço" novamente se necessário
              if (tentativa > 1) {
                const servicoPlaceholder = [...document.querySelectorAll('.ant-select-selection__placeholder')]
                  .find(el => el.textContent.trim() === 'Selecione um serviço');
                  
                if (servicoPlaceholder) {
                  console.log('Clicando novamente em "Selecione um serviço"...');
                  servicoPlaceholder.click();
                  await new Promise(resolve => setTimeout(resolve, 500));
                }
              }
              
              await new Promise(resolve => setTimeout(resolve, 300));
              
              const items = document.querySelectorAll('.ant-select-dropdown-menu-item');
              console.log(`Total de itens encontrados no dropdown: ${items.length}`);
              
              for (const item of items) {
                const textoItem = item.textContent.trim();
                console.log(`Verificando item: "${textoItem}"`);
                
                // Busca EXATA (case-insensitive)
                if (textoItem.toLowerCase() === buscaReparo.toLowerCase()) {
                  console.log(`✅ Correspondência EXATA encontrada: "${textoItem}" = "${tipoReparo}"`);
                  item.click();
                  encontrado = true;
                  await new Promise(resolve => setTimeout(resolve, 500));
                  break;
                }
              }
              
              if (encontrado) {
                break;
              }
              
              await new Promise(resolve => setTimeout(resolve, 300));
            }
            
            if (!encontrado) {
              console.warn(`Nenhuma correspondência EXATA encontrada para: ${tipoReparo} após ${maxTentativasReparo} tentativas`);
              console.log('Tentando com a função TentarNovamenteExterno...');
              await TentarNovamenteExterno(passo[0], passo[1]);
            }
            
            continue;
          }
          
          await TentarNovamenteExterno(passo[0], passo[1]);
        }
        
        console.log("✅ Processo de encaminhamento externo CONCLUÍDO com sucesso!");
      } catch (error) {
        console.error("❌ Ocorreu um erro durante o encaminhamento:", error.message);
      }
    }
  }

  // Create an instance of the class and initialize it.
  const supportUI = new ModernSupportUI();
  supportUI.init();
})();