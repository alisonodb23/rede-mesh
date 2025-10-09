(function() {
    'use strict';

    // Evita que o script seja executado múltiplas vezes
    if (window.dashboardDeProdutividadeJaCarregado) {
        console.log("O Dashboard de Produtividade já está em execução.");
        return;
    }
    window.dashboardDeProdutividadeJaCarregado = true;

    // ===================================================================================
    // CONFIGURAÇÃO - AJUSTE ESTAS LINHAS PARA A SUA FERRAMENTA
    // ===================================================================================
    const CONFIG = {
        // Meta de conversas para a barra de progresso.
        META_DIARIA_CONVERSAS: 45,

        // IMPORTANTE: Seletor CSS para identificar CADA item de conversa na sua lista de atendimentos.
        // Exemplo: Se cada conversa for um 'div' com a classe 'conversa-item', use 'div.conversa-item'.
        SELETOR_CONVERSA_ITEM: '.interaction-group',

        // IMPORTANTE: Seletor CSS para identificar a conversa que está SELECIONADA no momento.
        // Geralmente é o mesmo seletor de cima com uma classe extra, como '.is-selected' ou '.active'.
        SELETOR_CONVERSA_SELECIONADA: '.interaction-group.is-selected',

        // Duração mínima (em milissegundos) para uma conversa ser contada como "atendida".
        // 70000 ms = 1 minuto e 10 segundos.
        DURACAO_MINIMA_COMPLETA_MS: 70000,
    };
    // ===================================================================================

    /**
     * analyticsManager: O cérebro do dashboard.
     * Armazena, recupera e calcula todas as estatísticas de produtividade.
     */
    const analyticsManager = {
        getData() {
            const today = new Date().toLocaleDateString('pt-BR');
            const storedData = JSON.parse(localStorage.getItem('dashboardProdutividadeDados') || '{}');
            if (storedData.date !== today) {
                return { date: today, conversations: [] };
            }
            return storedData;
        },
        saveData(data) {
            localStorage.setItem('dashboardProdutividadeDados', JSON.stringify(data));
        },
        logConversation(duration, activeDuration) {
            if (duration < CONFIG.DURACAO_MINIMA_COMPLETA_MS) return; // Não registra conversas muito curtas
            const data = this.getData();
            data.conversations.push({ timestamp: Date.now(), duration, activeDuration });
            this.saveData(data);
        },
        calculateStats() {
            const data = this.getData();
            const conversations = data.conversations;

            if (conversations.length === 0) {
                return { count: 0, tma: '00:00', tme: '00:00' };
            }

            const totalDuration = conversations.reduce((sum, conv) => sum + conv.duration, 0);
            const totalActiveDuration = conversations.reduce((sum, conv) => sum + conv.activeDuration, 0);

            const tmaSeconds = Math.floor((totalDuration / conversations.length) / 1000);
            const tmeSeconds = Math.floor((totalActiveDuration / conversations.length) / 1000);

            const formatTime = (secs) => `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;

            return {
                count: conversations.length,
                tma: formatTime(tmaSeconds),
                tme: formatTime(tmeSeconds),
            };
        }
    };

    /**
     * dashboardUI: Responsável por criar e atualizar a interface visual do dashboard.
     */
    const dashboardUI = {
        create() {
            if (document.getElementById('mini-dashboard-produtividade')) return;

            const dashboard = document.createElement('div');
            dashboard.id = 'mini-dashboard-produtividade';
            dashboard.innerHTML = `
                <div class="panel-header">
                    <h4>Produtividade Hoje</h4>
                    <button class="panel-close-btn" title="Fechar">X</button>
                </div>
                <div class="panel-content">
                    <div class="counter-section">
                        <div class="counter-text">0/${CONFIG.META_DIARIA_CONVERSAS}</div>
                        <div class="progress-bar-container"><div class="progress-bar" style="width: 0%;"></div></div>
                    </div>
                    <div class="stats-grid">
                        <div class="stat-item"><span>Conversas</span><strong id="db-conv-count">0</strong></div>
                        <div class="stat-item"><span>TMA</span><strong id="db-tma">00:00</strong></div>
                        <div class="stat-item"><span>TME</span><strong id="db-tme">00:00</strong></div>
                    </div>
                </div>
            `;
            document.body.appendChild(dashboard);
            this.makeDraggable(dashboard, dashboard.querySelector('.panel-header'));
            dashboard.querySelector('.panel-close-btn').addEventListener('click', () => dashboard.remove());
        },

        update() {
            const dashboard = document.getElementById('mini-dashboard-produtividade');
            if (!dashboard) return;

            const stats = analyticsManager.calculateStats();
            const progress = (stats.count / CONFIG.META_DIARIA_CONVERSAS) * 100;

            dashboard.querySelector('.counter-text').textContent = `${stats.count}/${CONFIG.META_DIARIA_CONVERSAS}`;
            dashboard.querySelector('.progress-bar').style.width = `${Math.min(100, progress)}%`;
            dashboard.querySelector('#db-conv-count').textContent = stats.count;
            dashboard.querySelector('#db-tma').textContent = stats.tma;
            dashboard.querySelector('#db-tme').textContent = stats.tme;
        },

        injectCss() {
            const style = document.createElement('style');
            style.textContent = `
                #mini-dashboard-produtividade {
                    position: fixed; bottom: 20px; right: 20px; width: 250px; background-color: #282c34;
                    border-radius: 8px; box-shadow: 0 5px 25px rgba(0,0,0,0.2); z-index: 10001;
                    font-family: 'Segoe UI', sans-serif; color: #e0e0e0; border: 1px solid #444;
                }
                #mini-dashboard-produtividade .panel-header {
                    padding: 8px 12px; background-color: #3a3f47; border-bottom: 1px solid #444;
                    cursor: move; display: flex; justify-content: space-between; align-items: center;
                    border-radius: 8px 8px 0 0;
                }
                #mini-dashboard-produtividade .panel-header h4 { margin: 0; font-size: 14px; }
                #mini-dashboard-produtividade .panel-close-btn { background: none; border: none; color: #aaa; font-size: 16px; cursor: pointer; }
                #mini-dashboard-produtividade .panel-content { padding: 12px; }
                #mini-dashboard-produtividade .counter-section { margin-bottom: 12px; }
                #mini-dashboard-produtividade .counter-text { text-align: center; font-size: 18px; font-weight: bold; color: #a9f0d1; margin-bottom: 5px; }
                #mini-dashboard-produtividade .progress-bar-container { height: 8px; background-color: #555; border-radius: 4px; overflow: hidden; }
                #mini-dashboard-produtividade .progress-bar { height: 100%; background-color: #61dafb; border-radius: 4px; transition: width 0.3s ease; }
                #mini-dashboard-produtividade .stats-grid { display: grid; gap: 8px; }
                #mini-dashboard-produtividade .stat-item { display: flex; justify-content: space-between; padding: 8px; background: #3a3f47; border-radius: 4px; }
                #mini-dashboard-produtividade .stat-item span { font-size: 13px; color: #ccc; }
                #mini-dashboard-produtividade .stat-item strong { font-size: 14px; color: #a9f0d1; }
            `;
            document.head.appendChild(style);
        },
        
        makeDraggable(popup, header) {
            let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
            header.onmousedown = e => {
                e.preventDefault();
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = () => { document.onmouseup = null; document.onmousemove = null; };
                document.onmousemove = ev => {
                    ev.preventDefault();
                    pos1 = pos3 - ev.clientX;
                    pos2 = pos4 - ev.clientY;
                    pos3 = ev.clientX;
                    pos4 = ev.clientY;
                    popup.style.top = (popup.offsetTop - pos2) + "px";
                    popup.style.left = (popup.offsetLeft - pos1) + "px";
                };
            };
        }
    };

    /**
     * Função principal que monitora a página.
     */
    function iniciarMonitoramento() {
        dashboardUI.injectCss();
        dashboardUI.create();

        const conversasAtivas = new Map(); // Armazena os dados das conversas em andamento

        const verificarConversas = () => {
            const conversasNaTela = document.querySelectorAll(CONFIG.SELETOR_CONVERSA_ITEM);
            const mapaConversasNaTela = new Set(conversasNaTela);

            // 1. Verifica conversas que terminaram (sumiram da tela)
            for (const [el, dados] of conversasAtivas.entries()) {
                if (!mapaConversasNaTela.has(el)) {
                    // A conversa terminou, calcula o tempo ativo final e registra
                    if (!dados.isPaused && dados.activeSessionStart) {
                        dados.activeDuration += Date.now() - dados.activeSessionStart;
                    }
                    const totalDuration = Date.now() - dados.startTime;
                    analyticsManager.logConversation(totalDuration, dados.activeDuration);
                    conversasAtivas.delete(el);
                }
            }

            // 2. Verifica conversas na tela (novas ou em andamento)
            conversasNaTela.forEach(el => {
                if (!conversasAtivas.has(el)) {
                    // É uma nova conversa, adiciona ao mapa
                    conversasAtivas.set(el, {
                        startTime: Date.now(),
                        isPaused: true,
                        activeDuration: 0,
                        activeSessionStart: null,
                    });
                }

                const dados = conversasAtivas.get(el);
                const isSelected = el.matches(CONFIG.SELETOR_CONVERSA_SELECIONADA);

                if (isSelected && dados.isPaused) {
                    // A conversa foi selecionada, despausa o timer ativo
                    dados.isPaused = false;
                    dados.activeSessionStart = Date.now();
                } else if (!isSelected && !dados.isPaused) {
                    // A conversa foi deselecionada, pausa o timer ativo
                    dados.isPaused = true;
                    dados.activeDuration += Date.now() - dados.activeSessionStart;
                    dados.activeSessionStart = null;
                }
            });

            dashboardUI.update(); // Atualiza a interface com os novos dados
        };

        // Usa MutationObserver para reagir a mudanças na página (novas conversas, etc.)
        const observer = new MutationObserver(verificarConversas);
        observer.observe(document.body, { childList: true, subtree: true });

        // Execução inicial
        verificarConversas();
    }

    // Inicia todo o processo
    iniciarMonitoramento();
    console.log("Dashboard de Produtividade iniciado com sucesso!");

})();
