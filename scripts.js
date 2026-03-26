const SETTINGS = {
  animationDelay: 1150,
  initialDelay: 250,
  buttonFadeDelay: 180,
  errorDisplayTime: 5000,
  toastDisplayTime: 3000,
  historyPreviewLimit: 4,
  maxHistoryItems: 50,
  storageKeys: {
    history: "draw_history",
    config: "draw_config",
  },
};

const MESSAGES = {
  amountExceeds: "O valor de números a serem sorteados é maior que o espaço amostral",
  invalidRange: "Espaço amostral não correspondente. O número inicial deve ser menor que o final",
  drawError: "Não foi possível realizar o sorteio",
  emptyFields: "Por favor, preencha todos os campos",
  invalidAmount: "A quantidade de números deve ser maior que zero",
};

const state = {
  drawCount: 0,
  history: [],
  expandedHistoryId: null,
};

const elements = {};

document.addEventListener("DOMContentLoaded", init);

function init() {
  elements.main = document.querySelector("#main-content");
  elements.form = document.querySelector("form");
  elements.errorMessage = document.querySelector("#error-message");
  elements.amountInput = document.querySelector("#draw");
  elements.initialInput = document.querySelector("#initial");
  elements.finalInput = document.querySelector("#final");
  elements.repeatCheckbox = document.querySelector("#check");
  elements.textInputs = Array.from(document.querySelectorAll('input[type="text"]'));
  elements.historyPanel = document.querySelector("#history-panel");
  elements.historyList = document.querySelector("#history-list");
  elements.historyToggle = document.querySelector("#toggle-history");
  elements.historyClear = document.querySelector("#clear-history");

  state.history = loadHistory();
  state.drawCount = state.history.length;

  setupInputs();
  setupForm();
  setupHistory();
  loadSavedConfig();
  renderHistory();
}

function setupInputs() {
  elements.textInputs.forEach((input) => {
    input.addEventListener("input", () => {
      input.value = input.value.replace(/[^0-9]/g, "").trim();
      input.setAttribute("aria-invalid", input.value ? "false" : "true");
    });

    input.addEventListener("blur", () => {
      if (!input.value) {
        input.setAttribute("aria-invalid", "true");
      }
    });
  });
}

function setupForm() {
  elements.form.addEventListener("submit", handleSubmit);

  document.addEventListener("keydown", (event) => {
    const isShortcut = (event.ctrlKey || event.metaKey) && event.key === "Enter";

    if (!isShortcut || !elements.form.isConnected) {
      return;
    }

    event.preventDefault();
    elements.form.requestSubmit();
  });
}

function setupHistory() {
  elements.historyToggle.addEventListener("click", toggleHistoryPanel);
  elements.historyClear.addEventListener("click", clearHistory);
  elements.historyList.addEventListener("wheel", handleHistoryWheel, {
    passive: false,
  });
}

function handleSubmit(event) {
  event.preventDefault();

  try {
    const drawConfig = getDrawConfig();
    validateDrawConfig(drawConfig);
    saveConfig(drawConfig);
    startDraw(drawConfig);
  } catch (error) {
    showError(error.message);

    if (error.message === MESSAGES.emptyFields) {
      elements.amountInput.focus();
    }
  }
}

async function startDraw(drawConfig) {
  try {
    clearError();

    const drawData = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      sequence: state.drawCount + 1,
      timestamp: new Date().toISOString(),
      numbers: drawNumbers(drawConfig),
      config: drawConfig,
    };

    state.drawCount = drawData.sequence;
    addToHistory(drawData);
    await showResult(drawData);
  } catch (error) {
    showError(MESSAGES.drawError);
    console.error("Draw error:", error);
  }
}

function getDrawConfig() {
  return {
    amount: Number.parseInt(elements.amountInput.value, 10) || 0,
    min: Number.parseInt(elements.initialInput.value, 10) || 0,
    max: Number.parseInt(elements.finalInput.value, 10) || 0,
    allowRepetition: !elements.repeatCheckbox.checked,
  };
}

function validateDrawConfig(drawConfig) {
  const { amount, min, max, allowRepetition } = drawConfig;

  if (!amount || !min || max === 0) {
    throw new Error(MESSAGES.emptyFields);
  }

  if (amount <= 0) {
    throw new Error(MESSAGES.invalidAmount);
  }

  if (min >= max) {
    throw new Error(MESSAGES.invalidRange);
  }

  const rangeSize = max - min + 1;

  if (!allowRepetition && amount > rangeSize) {
    throw new Error(MESSAGES.amountExceeds);
  }
}

function drawNumbers(drawConfig) {
  const { amount, min, max, allowRepetition } = drawConfig;
  const numbers = [];

  if (allowRepetition) {
    while (numbers.length < amount) {
      numbers.push(getRandomNumber(min, max));
    }

    return numbers;
  }

  const availableNumbers = createRange(min, max);

  while (numbers.length < amount) {
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    numbers.push(availableNumbers.splice(randomIndex, 1)[0]);
  }

  return numbers;
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createRange(min, max) {
  return Array.from({ length: max - min + 1 }, (_, index) => min + index);
}

function addToHistory(drawData) {
  state.history.unshift(drawData);
  state.history = state.history.slice(0, SETTINGS.maxHistoryItems);
  state.expandedHistoryId = drawData.id;
  saveHistory();
}

function loadHistory() {
  try {
    const savedHistory = localStorage.getItem(SETTINGS.storageKeys.history);
    const parsedHistory = savedHistory ? JSON.parse(savedHistory) : [];

    return parsedHistory
      .slice()
      .reverse()
      .map((item, index) => ({
        ...item,
        id: item.id || `history-${index + 1}`,
        sequence: index + 1,
      }))
      .reverse();
  } catch (error) {
    console.error("Erro ao carregar histórico:", error);
    return [];
  }
}

function saveHistory() {
  try {
    localStorage.setItem(
      SETTINGS.storageKeys.history,
      JSON.stringify(state.history)
    );
  } catch (error) {
    console.error("Erro ao salvar histórico:", error);
  }
}

function clearHistory() {
  state.history = [];
  state.expandedHistoryId = null;
  state.drawCount = 0;
  saveHistory();
  renderHistory();
  showToast("Histórico limpo com sucesso!");
}

function loadSavedConfig() {
  try {
    const savedConfig = localStorage.getItem(SETTINGS.storageKeys.config);

    if (!savedConfig) {
      return;
    }

    const config = JSON.parse(savedConfig);

    elements.amountInput.value = config.amount || 2;
    elements.initialInput.value = config.min || 1;
    elements.finalInput.value = config.max || 100;
    elements.repeatCheckbox.checked =
      config.allowRepetition !== undefined ? !config.allowRepetition : true;
  } catch (error) {
    console.error("Erro ao carregar configuração:", error);
  }
}

function saveConfig(drawConfig) {
  try {
    localStorage.setItem(
      SETTINGS.storageKeys.config,
      JSON.stringify(drawConfig)
    );
  } catch (error) {
    console.error("Erro ao salvar configuração:", error);
  }
}

function toggleHistoryPanel() {
  const isClosed = elements.historyPanel.hasAttribute("hidden");

  if (isClosed) {
    renderHistory();
    elements.historyList.scrollTop = 0;
    elements.historyPanel.removeAttribute("hidden");
    elements.historyToggle.textContent = "Ocultar histórico";
    elements.historyToggle.setAttribute("aria-expanded", "true");
    return;
  }

  elements.historyPanel.setAttribute("hidden", "");
  elements.historyToggle.textContent = "Ver histórico";
  elements.historyToggle.setAttribute("aria-expanded", "false");
}

function handleHistoryWheel(event) {
  const canScroll = elements.historyList.scrollHeight > elements.historyList.clientHeight;

  if (!canScroll) {
    return;
  }

  const maxScrollTop =
    elements.historyList.scrollHeight - elements.historyList.clientHeight;
  const isScrollingUp = event.deltaY < 0;
  const isScrollingDown = event.deltaY > 0;
  const atTop = elements.historyList.scrollTop <= 0;
  const atBottom = elements.historyList.scrollTop >= maxScrollTop - 1;

  if ((isScrollingUp && atTop) || (isScrollingDown && atBottom)) {
    event.preventDefault();
  }

  event.stopPropagation();
}

function renderHistory() {
  elements.historyList.innerHTML = "";

  if (!state.history.length) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-history";
    emptyMessage.textContent = "Nenhum sorteio realizado ainda";
    elements.historyList.append(emptyMessage);
    return;
  }

  if (!state.history.some((item) => item.id === state.expandedHistoryId)) {
    state.expandedHistoryId = null;
  }

  state.history.forEach((item) => {
    elements.historyList.append(createHistoryItem(item));
  });
}

function createHistoryItem(item) {
  const article = document.createElement("article");
  article.className = "history-item";
  article.setAttribute("role", "listitem");

  const summaryButton = document.createElement("button");
  summaryButton.type = "button";
  summaryButton.className = "history-summary";
  summaryButton.setAttribute(
    "aria-label",
    `${getHistoryTitle(item)} em ${formatDate(item.timestamp)}`
  );
  summaryButton.setAttribute(
    "aria-expanded",
    String(state.expandedHistoryId === item.id)
  );
  summaryButton.addEventListener("click", () => toggleHistoryItem(item.id));

  const header = document.createElement("div");
  header.className = "history-item-header";

  const title = document.createElement("strong");
  title.className = "history-item-badge";
  title.textContent = getHistoryTitle(item);

  const date = document.createElement("span");
  date.className = "history-item-time";
  date.textContent = formatDate(item.timestamp);

  const preview = document.createElement("p");
  preview.className = "history-item-preview";
  preview.textContent = getHistoryPreview(item.numbers);

  const meta = document.createElement("div");
  meta.className = "history-item-meta";

  const config = document.createElement("span");
  config.className = "history-item-config";
  config.textContent = `${item.config.amount} números de ${item.config.min} até ${item.config.max}`;

  const actionLabel = document.createElement("span");
  actionLabel.className = "history-item-toggle";
  actionLabel.textContent =
    state.expandedHistoryId === item.id ? "Ocultar completo" : "Ver completo";

  header.append(title, date);
  meta.append(config, actionLabel);
  summaryButton.append(header, preview, meta);
  article.append(summaryButton);

  if (state.expandedHistoryId === item.id) {
    article.append(createHistoryDetails(item));
  }

  return article;
}

function createHistoryDetails(item) {
  const details = document.createElement("div");
  details.className = "history-detail";

  const label = document.createElement("span");
  label.className = "history-detail-label";
  label.textContent = "Números sorteados";

  const numbers = document.createElement("div");
  numbers.className = "history-item-numbers";

  item.numbers.forEach((number) => {
    const chip = document.createElement("span");
    chip.className = "history-number";
    chip.textContent = number;
    numbers.append(chip);
  });

  const actions = document.createElement("div");
  actions.className = "action-buttons single-action";

  const copyButton = document.createElement("button");
  copyButton.type = "button";
  copyButton.className = "action-button";
  copyButton.textContent = "Copiar";
  copyButton.addEventListener("click", () => copyHistoryNumbers(item.numbers));

  actions.append(copyButton);
  details.append(label, numbers, actions);

  return details;
}

function toggleHistoryItem(historyId) {
  state.expandedHistoryId =
    state.expandedHistoryId === historyId ? null : historyId;

  renderHistory();

  if (state.expandedHistoryId) {
    const selectedItem = state.history.find((item) => item.id === historyId);

    if (selectedItem) {
      announceToScreenReader(
        `${getHistoryTitle(selectedItem)} aberto com ${selectedItem.numbers.length} números`
      );
    }
  }
}

function getHistoryTitle(item) {
  return `Sorte ${item.sequence}`;
}

function getHistoryPreview(numbers) {
  const preview = numbers.slice(0, SETTINGS.historyPreviewLimit).join(", ");
  return numbers.length > SETTINGS.historyPreviewLimit ? `${preview}...` : preview;
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString("pt-BR");
}

async function copyHistoryNumbers(numbers) {
  const copied = await copyToClipboard(numbers);

  if (copied) {
    showToast("Números copiados com sucesso");
    announceToScreenReader("Números copiados para a área de transferência");
    return;
  }

  showToast("Erro ao copiar números");
}

function copyToClipboard(numbers) {
  const text = numbers.join(", ");

  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();

  try {
    const copied = document.execCommand("copy");
    textarea.remove();
    return Promise.resolve(copied);
  } catch (error) {
    textarea.remove();
    return Promise.resolve(false);
  }
}

async function showResult(drawData) {
  elements.main.innerHTML = "";
  elements.main.classList.remove("grid");

  const resultBox = document.createElement("div");
  resultBox.className = "space container";
  resultBox.setAttribute("role", "region");
  resultBox.setAttribute("aria-label", "Área de resultados do sorteio");

  const header = document.createElement("div");

  const title = document.createElement("h1");
  title.className = "result";
  title.textContent = "Resultado do sorteio";
  title.setAttribute("aria-label", `Resultado do sorteio número ${drawData.sequence}`);

  const subtitle = document.createElement("h2");
  subtitle.className = "subtitle";
  subtitle.textContent = `${drawData.sequence}º resultado`;
  subtitle.setAttribute("aria-hidden", "true");

  const numbersContainer = document.createElement("div");
  numbersContainer.className = "div-sorted-numbers";
  numbersContainer.setAttribute("role", "list");
  numbersContainer.setAttribute("aria-label", "Números sorteados");

  header.append(title, subtitle);
  resultBox.append(header, numbersContainer);
  elements.main.append(resultBox);

  announceToScreenReader(`Iniciando sorteio de ${drawData.numbers.length} números`);
  await animateNumbers(drawData.numbers, numbersContainer);

  const menuActions = document.createElement("div");
  menuActions.className = "action-buttons single-action";

  const backButton = document.createElement("button");
  backButton.type = "button";
  backButton.className = "action-button";
  backButton.textContent = "Voltar ao menu";
  backButton.setAttribute("aria-label", "Voltar para o menu principal");
  backButton.addEventListener("click", () => window.location.reload());

  menuActions.append(backButton);
  elements.main.append(menuActions);
  elements.main.append(createRedrawButton(drawData.config));
}

function createRedrawButton(drawConfig) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "appear-button";
  button.innerHTML =
    'SORTEAR NOVAMENTE <img src="./assets/icons/play.svg" alt="" aria-hidden="true">';
  button.setAttribute(
    "aria-label",
    "Sortear novamente com as mesmas configurações"
  );

  button.addEventListener("click", () => startDraw(drawConfig));

  setTimeout(() => {
    button.style.opacity = 1;
    focusTemporarily(button);
    announceToScreenReader("Sorteio concluído. Botão sortear novamente disponível");
  }, SETTINGS.buttonFadeDelay);

  return button;
}

function animateNumbers(numbers, container) {
  let currentIndex = 0;

  return new Promise((resolve) => {
    function showNextNumber() {
      if (currentIndex >= numbers.length) {
        resolve();
        return;
      }

      container.append(createNumberCard(numbers[currentIndex]));
      announceToScreenReader(
        `Número ${currentIndex + 1} de ${numbers.length}: ${numbers[currentIndex]}`
      );

      currentIndex += 1;
      setTimeout(showNextNumber, SETTINGS.animationDelay);
    }

    setTimeout(showNextNumber, SETTINGS.initialDelay);
  });
}

function createNumberCard(number) {
  const card = document.createElement("div");
  card.className = "animation-number";

  const value = document.createElement("span");
  value.className = "number-sorted";
  value.textContent = number;
  value.setAttribute("role", "text");
  value.setAttribute("aria-label", `Número sorteado: ${number}`);

  card.append(value);
  return card;
}

function showError(message) {
  elements.errorMessage.textContent = message;
  elements.errorMessage.classList.add("show");
  elements.errorMessage.setAttribute("role", "alert");

  setTimeout(() => {
    elements.errorMessage.classList.remove("show");
  }, SETTINGS.errorDisplayTime);
}

function clearError() {
  elements.errorMessage.classList.remove("show");
  elements.errorMessage.textContent = "";
}

function showToast(message) {
  const oldToast = document.querySelector(".toast");

  if (oldToast) {
    oldToast.remove();
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");

  document.body.append(toast);

  setTimeout(() => {
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 300);
  }, SETTINGS.toastDisplayTime);
}

function announceToScreenReader(message) {
  const status = document.createElement("div");
  status.className = "visually-hidden";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  status.textContent = message;

  document.body.append(status);

  setTimeout(() => {
    status.remove();
  }, 1000);
}

function focusTemporarily(element) {
  element.setAttribute("tabindex", "-1");
  element.focus();

  element.addEventListener(
    "blur",
    () => {
      element.removeAttribute("tabindex");
    },
    { once: true }
  );
}
