/**
 * Minichat — компонент чата менеджер ↔ закупщик
 */

(function ($) {
  "use strict";

  let oldestMessageId = null;
  let isLoadingHistory = false;
  let hasMoreHistory = true;

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

  function addMessage(author, text, time, options) {
    const opts = options || {};
    const prepend = !!opts.prepend;
    const autoScroll = opts.autoScroll !== false; // по умолчанию скроллим вниз

    const isUser = author === "Вы";
    const sideClass = isUser ? "message-out" : "message-in";

    const $container = $("#chatMessages");

    const $message = $(`
      <div class="message ${sideClass}">
        <div class="bubble">
          <div class="bubble-text">${escapeHtml(text)}</div>
          <div class="bubble-time">${time}</div>
        </div>
      </div>
    `);

    if (prepend) {
      $container.prepend($message);
    } else {
      $container.append($message);
    }

    if (autoScroll) {
      $container.scrollTop($container[0].scrollHeight);
    }
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

  function loadInitialHistory() {
    $.get("/api/get_messages.php", { limit: 30 }, function (messages) {
      const $container = $("#chatMessages");
      $container.empty();

      messages.forEach(function (msg) {
        const authorName = msg.author === "user" ? "Вы" : "Бот";
        addMessage(authorName, msg.text, msg.time);
      });

      if (messages.length > 0) {
        oldestMessageId = messages[0].id;
        hasMoreHistory = true;
      } else {
        oldestMessageId = null;
        hasMoreHistory = false;
      }
    });
  }

  function loadOlderMessages() {
    if (isLoadingHistory || !hasMoreHistory || !oldestMessageId) return;
    isLoadingHistory = true;

    $.get(
      "/api/get_messages.php",
      { limit: 30, before_id: oldestMessageId },
      function (messages) {
        if (!messages || !messages.length) {
          hasMoreHistory = false;
          isLoadingHistory = false;
          return;
        }

        const $container = $("#chatMessages");
        const prevScrollTop = $container.scrollTop();
        const prevScrollHeight = $container[0].scrollHeight;

        for (let i = messages.length - 1; i >= 0; i--) {
          const msg = messages[i];
          const authorName = msg.author === "user" ? "Вы" : "Бот";
          addMessage(authorName, msg.text, msg.time, {
            prepend: true,
            autoScroll: false,
          });
        }

        oldestMessageId = messages[0].id;

        const newScrollHeight = $container[0].scrollHeight;
        const delta = newScrollHeight - prevScrollHeight;
        $container.scrollTop(prevScrollTop + delta);

        if (messages.length < 30) {
          hasMoreHistory = false;
        }

        isLoadingHistory = false;
      },
    );
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
    loadInitialHistory();

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

    $("#chatMessages").on("scroll", function () {
      const $container = $(this);
      if ($container.scrollTop() <= 0) {
        loadOlderMessages();
      }
    });
  }

  $(document).ready(init);
})(jQuery);
