const baseDir = window.location.pathname.substring(
  0,
  window.location.pathname.lastIndexOf("/")
);

function getAssetUrl(assetPath) {
  return baseDir + assetPath;
}


const r1d4 = () => Math.ceil(Math.random() * 4);
const r1d6 = () => Math.ceil(Math.random() * 6);
const r1d8 = () => Math.ceil(Math.random() * 8);
const r1d10 = () => Math.ceil(Math.random() * 10);
const r1d12 = () => Math.ceil(Math.random() * 12);
const r1d20 = () => Math.ceil(Math.random() * 20);
const r1d100 = () => Math.ceil(Math.random() * 100);


export { baseDir, getAssetUrl, r1d4, r1d6, r1d8, r1d10, r1d12, r1d20, r1d100};
