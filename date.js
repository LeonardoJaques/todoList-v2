exports.getDate = () => {
  const today = new Date();
  const options = {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  };

  const locale = 'en-US';
  return today.toLocaleDateString(locale, options);

}

exports.getDay = () => {
  const today = new Date();
  const options = {
    weekday: 'long',
  };

  const locale = 'en-US';
  return today.toLocaleDateString(locale, options);
}