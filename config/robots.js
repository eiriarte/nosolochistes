const footprints = [
  '360Spider',
  '80legs',
  'AhrefsBot',
  'AlphaBot',
  'BlackWidow',
  'BTWebClient',
  'Grafula',
  'HomePageBot',
  'Jorgee',
  'kmccrew',
  'LeechFTP',
  'MediaGet',
  'MegaIndex',
  'Scrapy',
  'Semrush',
  'SISTRIX',
  'Torrent',
  'TurnitinBot',
  'WebReaper',
  'WebStripper',
  'WebWhacker',
  'WebZIP'
];

const badRobot = new RegExp(footprints.join('|'));

module.exports = (ua) => {
  return badRobot.test(ua);
};
