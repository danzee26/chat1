/**
 * Minichat — компонент чата менеджер ↔ закупщик
 */
(function ($) {
  'use strict';

  function escapeHtml(text) {
    return $('<div>').text(text).html();
  }

  function addMessage(author, text, time) {
    $('#chatMessages').append(`
      <div class="mb-2">
        <small class="text-muted">${author} — ${time}</small>
        <div class="border rounded p-2 chat-text">${escapeHtml(text)}</div>
      </div>
    `);
    $('#chatMessages').scrollTop($('#chatMessages')[0].scrollHeight);
  }

  function init() {
    $('#sendBtn').on('click', function () {
      const text = $('#chatInput').val().trim();
      if (!text) return;
      addMessage('Вы', text, new Date().toLocaleTimeString());
      $('#chatInput').val('');
    });

    $('#chatInput').on('keydown', function (e) {
      if (e.which === 13 && !e.shiftKey) {
        e.preventDefault();
        $('#sendBtn').click();
      }
    });
  }

  $(document).ready(init);
})(jQuery);
