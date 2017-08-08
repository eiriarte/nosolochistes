const footprints = [
  'MediaGet',
  'Torrent',
  'BTWebClient',
  'Jorgee',
  '360Spider'
];

const badRobot = new RegExp(footprints.join('|'));

module.exports = (ua) => {
  return badRobot.test(ua);
}
