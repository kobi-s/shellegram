
var options = {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: 'Some button text 1', callback_data: 'os' }],
        [{ text: 'Some button text 2', callback_data: 'hostname' }],
        [{ text: 'Some button text 3', callback_data: 'userinfo' }]
      ]
    })
  };
