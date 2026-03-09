/**
 * Minichat — компонент чата менеджер ↔ закупщик
 */

(function ($) {
  "use strict";

  function loadHistory() {
    $.get("/api/get_messages.php", function (messages) {
      // Очищаем окно чата перед загрузкой (на всякий случай)
      $("#chat-box").empty();

      messages.forEach(function (msg) {
        const authorName = msg.author === "user" ? "Вы" : "Бот";
        addMessage(authorName, msg.text, msg.time);
      });
    });
  }

  function escapeHtml(text) {
    return $("<div>").text(text).html();
  }

  function formatTime(date) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const EMOJI_LIST = [
    "😀",
    "😃",
    "😄",
    "😁",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "😋",
    "😛",
    "😜",
    "🤪",
    "😝",
    "🤑",
    "🤗",
    "🤭",
    "🤫",
    "🤔",
    "🤐",
    "🤨",
    "😐",
    "😑",
    "😶",
    "😏",
    "😣",
    "😥",
    "😮",
    "🤐",
    "😯",
    "😪",
    "😫",
    "😴",
    "🤤",
    "😷",
    "🤒",
    "🤕",
    "🤢",
    "🤮",
    "👍",
    "👎",
    "👌",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👋",
    "🤚",
    "🖐️",
    "✋",
    "🖖",
    "👏",
    "🙌",
    "🤝",
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "💔",
    "❣️",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
    "💘",
  ];

  function addMessage(author, text, time) {
    const isUser = author === "Вы";
    const sideClass = isUser ? "message-out" : "message-in";
    $("#chatMessages").append(`
      <div class="message ${sideClass}">
        <div class="bubble">
          <div class="bubble-text">${escapeHtml(text)}</div>
          <div class="bubble-time">${time}</div>
        </div>
      </div>
    `);
    $("#chatMessages").scrollTop($("#chatMessages")[0].scrollHeight);
  }

  function sendMessage(text) {
    const now = new Date();
    addMessage("Вы", text, formatTime(now));
    $("#chatInput").val("");

    $.ajax({
      url: "/api/chat.php",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ message: text }),
      dataType: "json",
    })
      .done(function (data) {
        const reply = data && data.reply ? data.reply : "вас понял";
        addMessage("Чат", reply, formatTime(new Date()));
      })
      .fail(function () {
        addMessage("Чат", "Ошибка отправки", formatTime(new Date()));
      });
  }

  function buildEmojiPanel() {
    const $panel = $("#emojiPanel");
    $panel.empty();
    const $grid = $('<div class="emoji-grid"></div>');
    EMOJI_LIST.forEach(function (emoji) {
      const $btn = $(
        '<button type="button" class="emoji-btn" tabindex="0"></button>',
      );
      $btn.text(emoji);
      $btn.on("click", function () {
        const $input = $("#chatInput");
        const el = $input[0];
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const val = $input.val();
        $input.val(val.slice(0, start) + emoji + val.slice(end));
        el.selectionStart = el.selectionEnd = start + emoji.length;
        $input.focus();
      });
      $grid.append($btn);
    });
    $panel.append($grid);
  }

  function toggleEmojiPanel() {
    const $panel = $("#emojiPanel");
    const isOpen = $panel.hasClass("is-open");
    $panel.toggleClass("is-open", !isOpen);
    $panel.attr("aria-hidden", isOpen);
  }

  function closeEmojiPanel() {
    $("#emojiPanel").removeClass("is-open").attr("aria-hidden", "true");
  }

  function init() {
    buildEmojiPanel();
    loadHistory();

    $("#emojiToggle").on("click", function (e) {
      e.stopPropagation();
      toggleEmojiPanel();
    });

    $(document).on("click", function () {
      closeEmojiPanel();
    });
    $("#emojiPanel").on("click", function (e) {
      e.stopPropagation();
    });

    $("#sendBtn").on("click", function () {
      const text = $("#chatInput").val().trim();
      if (!text) return;
      sendMessage(text);
    });

    $("#chatInput").on("keydown", function (e) {
      if (e.which === 13 && !e.shiftKey) {
        e.preventDefault();
        $("#sendBtn").click();
      }
    });
  }

  $(document).ready(init);
})(jQuery);
