const footprints = [
  'MediaGet'
];

const badRobot = new RegExp(footprints.join('|'));

module.exports = (ua) => {
  return badRobot.test(ua);
}
