const setup = require('./setup.js');
const { start } = require('./bot.js');

const printValues = function(values, text) {
  console.log(text ? text : 'Current values:');
  for (var key in values) {
    console.log(`  ${key} = \x1b[32m'${values[key]}'\x1b[0m`);
  }
}

const startBot = function(values) {
  console.log('Indító bot');
  var bot = start(values);
  bot.on('restart',() => {
    console.log('\nBot újraindítása');
    bot.destroy();
    bot = start(values);
  })
  var shutdown = function() {
    console.log('Leállítás');
    let destructor = bot.destroy();
    if (destructor) {
      destructor.then(() => {
        process.exit(0);
      }).catch(console.error);
    } else {
      process.exit(0);
    }
  }
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

if (process.argv.includes('-c') || process.argv.includes('--config')) {
  setup.loadValues().then((values) => {
    printValues(values);
    process.exit(0);
  }).catch((error) => {
    console.log('Nem sikerült betölteni a mentett értékeket, újra kell konfigurálni az összes mentett értéket');
    setup.createValues().then((values) => {
      setup.saveValues(values).then(() => {
        printValues(values, 'New values:');
        process.exit(0);
      }).catch(console.error);
    }).catch(console.error);
  })
} else {
  console.log('Környezeti értékek betöltésének kísérlete...');
  setup.loadValues().then((values) => {
    startBot(values);
  }).catch((error) => {
    console.error(error);
    setup.createValues().then((values) => {
      setup.saveValues(values).then(() => {
        startBot(values);
      }).catch(console.error);
    }).catch(console.error);
  })
}
