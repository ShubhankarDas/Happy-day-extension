$('.card').click(function () {
  $('.card-container').addClass('hide');
  $('.message-container').removeClass('hide');
  $('#save-cta').removeClass('hide');
  $('.hero-image').attr('src', $(this).find('.card-image').attr('src'));
});

$('#back-btn').click(function () {
  $('.card-container').removeClass('hide');
  $('.message-container').addClass('hide');
  $('#save-cta').addClass('hide');
});

$('#save-cta:not(.disabled)').click(function () {
  let saveBtn = $('#save-cta');
  saveBtn.addClass('disabled');
  saveBtn.text('SAVING..');
  let image_src_split = $('.hero-image').attr('src').split('/');
  let quote = $('#message').val();
  let image_name = image_src_split[image_src_split.length - 1];

  if (!isValid(quote) || !isValid(image_name)) {
    return;
  }

  let data = {
    quote,
    image_name,
  };

  $.ajax({
    url: './quote',
    type: 'POST',
    data: JSON.stringify(data),
    contentType: 'application/json',
    dataType: 'json',
    success: function () {
      saveBtn.removeClass('disabled');
      saveBtn.text('SAVE');
      $('#back-btn').trigger('click');
    },
  });
});

function isValid(field) {
  return field.length > 4;
}
