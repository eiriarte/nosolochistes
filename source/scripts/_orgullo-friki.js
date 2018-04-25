(function() {
  var months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  var month = document.querySelector('.mmm');
  var period = document.querySelector('.period');
  document.addEventListener('DOMContentLoaded', function() {
    refreshNow();
    setGeekPrideDay();
    setInterval(refreshNow, 60000);
  });
  function setGeekPrideDay() {
    var now = new Date();
    var geekPrideDay = new Date(now.getFullYear(), 4, 25);
    var year = now.getFullYear() + (now < geekPrideDay ? 0 : 1);
    setNumber('.dest', 'yyyy', getPart(year, 4));
  }
  function refreshNow() {
    var now = new Date();
    var hours = now.getHours();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours === 0 ? 12 : hours;
    month.className = 'mmm ' + months[now.getMonth()];
    period.className = 'period ' + ampm;
    setDigits('.present', now.getDate(), now.getFullYear(), hours, now.getMinutes());
  }
  function setDigits(lcd, day, year, hour, min) {
    setNumber(lcd, 'dd', getPart(day, 2));
    setNumber(lcd, 'yyyy', getPart(year, 4));
    setNumber(lcd, 'hh', getPart(hour, 2));
    setNumber(lcd, 'mm', getPart(min, 2));
  }
  function getPart(num, len) {
    return ('0000' + num).slice(-len);
  }
  function setNumber(lcd, part, num) {
    for (var i = 0; i < num.length; i++) {
      var digits = part.split('');
      digits.splice(i, 1, '_');
      digits = digits.join('');
      document.querySelector(lcd + ' .' + digits).className = digits + ' _' + num[i];
    }
  }
})();
